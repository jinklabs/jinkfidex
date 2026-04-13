import { useState, useEffect, useCallback } from "react";
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits, maxUint256 } from "viem";
import { ETH_ADDRESS, type Token } from "../lib/tokens";
import { ERC20_ABI } from "../lib/contracts";
import { QUOTER_V2_ABI, SWAP_ROUTER_V3_ABI, UNISWAP_ADDRESSES, type V3FeeTier } from "../lib/uniswap";

export function useSwapV3() {
  const { address } = useAccount();
  const chainId = useChainId();
  const addrs = UNISWAP_ADDRESSES[chainId];

  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [fee, setFee] = useState<V3FeeTier>(3000);
  const [slippage, setSlippage] = useState(0.5);
  const [priceImpact] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);

  const isEthIn = tokenIn?.address === ETH_ADDRESS;

  // Resolve WETH for ETH
  const resolvedIn = isEthIn ? addrs?.weth : (tokenIn?.address as `0x${string}` | undefined);
  const resolvedOut = tokenOut?.address === ETH_ADDRESS ? addrs?.weth : (tokenOut?.address as `0x${string}` | undefined);

  const parsedIn = tokenIn && amountIn
    ? (() => { try { return parseUnits(amountIn, tokenIn.decimals); } catch { return 0n; } })()
    : 0n;

  // QuoterV2 call (read-only simulation)
  const { data: quoteData } = useReadContract({
    address: addrs?.v3QuoterV2,
    abi: QUOTER_V2_ABI,
    functionName: "quoteExactInputSingle",
    args: resolvedIn && resolvedOut && parsedIn > 0n ? [{
      tokenIn: resolvedIn,
      tokenOut: resolvedOut,
      amountIn: parsedIn,
      fee,
      sqrtPriceLimitX96: 0n,
    }] : undefined,
    query: { enabled: !!addrs && !!resolvedIn && !!resolvedOut && parsedIn > 0n, refetchInterval: 15000 },
  });

  // Allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenIn?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, addrs?.v3Router as `0x${string}`] : undefined,
    query: { enabled: !!addrs && !isEthIn && !!address && !!tokenIn },
  });

  useEffect(() => {
    if (!quoteData || !tokenOut) return;
    const [outAmount] = quoteData as [bigint, bigint, number, bigint];
    setAmountOut(parseFloat(formatUnits(outAmount, tokenOut.decimals)).toFixed(6));
  }, [quoteData, tokenOut]);

  const needsApproval = !isEthIn && !!allowance && parsedIn > 0n && (allowance as bigint) < parsedIn;

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isTxPending } = useWaitForTransactionReceipt({ hash: txHash ?? undefined });

  const approve = useCallback(async () => {
    if (!tokenIn || !addrs) return;
    try {
      const hash = await writeContractAsync({
        address: tokenIn.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [addrs.v3Router, maxUint256],
      });
      setTxHash(hash);
      await refetchAllowance();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Approval failed");
    }
  }, [tokenIn, addrs, writeContractAsync, refetchAllowance]);

  const swap = useCallback(async () => {
    if (!tokenIn || !tokenOut || !address || !quoteData || !resolvedIn || !resolvedOut || !addrs) return;
    setIsSwapping(true);
    setError(null);
    try {
      const [outAmount] = quoteData as [bigint, bigint, number, bigint];
      const amountOutMin = (outAmount * BigInt(Math.floor((1 - slippage / 100) * 10000))) / 10000n;

      const hash = await writeContractAsync({
        address: addrs!.v3Router,
        abi: SWAP_ROUTER_V3_ABI,
        functionName: "exactInputSingle",
        args: [{
          tokenIn: resolvedIn,
          tokenOut: resolvedOut,
          fee,
          recipient: address,
          amountIn: parsedIn,
          amountOutMinimum: amountOutMin,
          sqrtPriceLimitX96: 0n,
        }],
        value: isEthIn ? parsedIn : 0n,
      });
      setTxHash(hash);
      setAmountIn("");
      setAmountOut("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Swap failed");
    } finally {
      setIsSwapping(false);
    }
  }, [tokenIn, tokenOut, address, quoteData, resolvedIn, resolvedOut, fee, parsedIn, slippage, isEthIn, addrs.v3Router, writeContractAsync]);

  const flip = useCallback(() => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOut);
    setAmountOut("");
  }, [tokenIn, tokenOut, amountOut]);

  return {
    tokenIn, tokenOut, amountIn, amountOut, fee, slippage, priceImpact,
    needsApproval, isSwapping, isTxPending, txHash, error,
    setTokenIn, setTokenOut, setAmountIn, setFee, setSlippage, approve, swap, flip,
  };
}
