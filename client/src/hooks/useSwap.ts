import { useState, useEffect, useCallback } from "react";
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits, maxUint256 } from "viem";
import { ETH_ADDRESS, type Token } from "../lib/tokens";
import { ROUTER_ABI, ERC20_ABI, CONTRACT_ADDRESSES } from "../lib/contracts";

export interface SwapState {
  tokenIn: Token | null;
  tokenOut: Token | null;
  amountIn: string;
  amountOut: string;
  slippage: number;
  priceImpact: number | null;
  needsApproval: boolean;
  isApproving: boolean;
  isSwapping: boolean;
  txHash: `0x${string}` | null;
  error: string | null;
}

export function useSwap() {
  const { address } = useAccount();
  const chainId = useChainId();
  const addrs = CONTRACT_ADDRESSES[chainId];

  const [state, setState] = useState<SwapState>({
    tokenIn: null, tokenOut: null, amountIn: "", amountOut: "",
    slippage: 0.5, priceImpact: null, needsApproval: false,
    isApproving: false, isSwapping: false, txHash: null, error: null,
  });

  const isEthIn = state.tokenIn?.address === ETH_ADDRESS;
  const isEthOut = state.tokenOut?.address === ETH_ADDRESS;
  const path = state.tokenIn && state.tokenOut
    ? [state.tokenIn.address as `0x${string}`, state.tokenOut.address as `0x${string}`]
    : undefined;

  const amountInParsed = state.tokenIn && state.amountIn
    ? (() => { try { return parseUnits(state.amountIn, state.tokenIn.decimals); } catch { return 0n; } })()
    : 0n;

  // Get amounts out
  const { data: amountsOut } = useReadContract({
    address: addrs?.router,
    abi: ROUTER_ABI,
    functionName: "getAmountsOut",
    args: path && amountInParsed > 0n ? [amountInParsed, path] : undefined,
    query: { enabled: !!addrs && !!path && amountInParsed > 0n, refetchInterval: 15000 },
  });

  // Get allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: state.tokenIn?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, addrs?.router as `0x${string}`] : undefined,
    query: { enabled: !!addrs && !isEthIn && !!address && !!state.tokenIn },
  });

  // Update amountOut + needsApproval when data changes
  useEffect(() => {
    if (!amountsOut || !state.tokenOut) return;
    const out = formatUnits(amountsOut[amountsOut.length - 1], state.tokenOut.decimals);
    const needsApproval = !isEthIn && allowance !== undefined && amountInParsed > 0n && (allowance as bigint) < amountInParsed;
    setState(s => ({ ...s, amountOut: parseFloat(out).toFixed(6), needsApproval: needsApproval ?? false }));
  }, [amountsOut, allowance, amountInParsed, isEthIn, state.tokenOut]);

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isTxPending } = useWaitForTransactionReceipt({ hash: state.txHash ?? undefined });

  const approve = useCallback(async () => {
    if (!state.tokenIn || !address || !addrs) return;
    setState(s => ({ ...s, isApproving: true, error: null }));
    try {
      const hash = await writeContractAsync({
        address: state.tokenIn.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [addrs.router, maxUint256],
      });
      setState(s => ({ ...s, txHash: hash }));
      await refetchAllowance();
      setState(s => ({ ...s, isApproving: false, needsApproval: false }));
    } catch (e: unknown) {
      setState(s => ({ ...s, isApproving: false, error: e instanceof Error ? e.message : "Approval failed" }));
    }
  }, [state.tokenIn, address, addrs.router, writeContractAsync, refetchAllowance]);

  const swap = useCallback(async () => {
    if (!state.tokenIn || !state.tokenOut || !address || !path || !addrs) return;
    setState(s => ({ ...s, isSwapping: true, error: null }));
    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
      const amountOutMin = amountsOut
        ? (amountsOut[amountsOut.length - 1] * BigInt(Math.floor((1 - state.slippage / 100) * 10000))) / 10000n
        : 0n;
      let hash: `0x${string}`;
      if (isEthIn) {
        hash = await writeContractAsync({
          address: addrs.router,
          abi: ROUTER_ABI,
          functionName: "swapExactETHForTokens",
          args: [amountOutMin, path, address, deadline],
          value: amountInParsed,
        });
      } else if (isEthOut) {
        hash = await writeContractAsync({
          address: addrs.router,
          abi: ROUTER_ABI,
          functionName: "swapExactTokensForETH",
          args: [amountInParsed, amountOutMin, path, address, deadline],
        });
      } else {
        hash = await writeContractAsync({
          address: addrs.router,
          abi: ROUTER_ABI,
          functionName: "swapExactTokensForTokens",
          args: [amountInParsed, amountOutMin, path, address, deadline],
        });
      }
      setState(s => ({ ...s, txHash: hash, isSwapping: false, amountIn: "", amountOut: "" }));
    } catch (e: unknown) {
      setState(s => ({ ...s, isSwapping: false, error: e instanceof Error ? e.message : "Swap failed" }));
    }
  }, [state, address, path, amountsOut, amountInParsed, isEthIn, isEthOut, addrs.router, writeContractAsync]);

  const flip = useCallback(() => {
    setState(s => ({ ...s, tokenIn: s.tokenOut, tokenOut: s.tokenIn, amountIn: s.amountOut, amountOut: "" }));
  }, []);

  const setTokenIn = useCallback((t: Token) => setState(s => ({ ...s, tokenIn: t })), []);
  const setTokenOut = useCallback((t: Token) => setState(s => ({ ...s, tokenOut: t })), []);
  const setAmountIn = useCallback((v: string) => setState(s => ({ ...s, amountIn: v })), []);
  const setSlippage = useCallback((v: number) => setState(s => ({ ...s, slippage: v })), []);

  return { ...state, isTxPending, setTokenIn, setTokenOut, setAmountIn, setSlippage, approve, swap, flip };
}
