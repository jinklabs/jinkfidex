import { useState, useCallback } from "react";
import { useAccount, useChainId, useReadContract, useWriteContract } from "wagmi";
import { parseUnits, maxUint256 } from "viem";
import { ETH_ADDRESS, type Token } from "../lib/tokens";
import { ROUTER_ABI, ERC20_ABI, PAIR_ABI, FACTORY_ABI, CONTRACT_ADDRESSES } from "../lib/contracts";

export function useAddLiquidity() {
  const { address } = useAccount();
  const chainId = useChainId();
  const addrs = CONTRACT_ADDRESSES[chainId];

  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [slippage] = useState(0.5);
  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEthA = tokenA?.address === ETH_ADDRESS;
  const isEthB = tokenB?.address === ETH_ADDRESS;

  // Get pair address
  const { data: pairAddress } = useReadContract({
    address: addrs?.factory,
    abi: FACTORY_ABI,
    functionName: "getPair",
    args: tokenA && tokenB ? [tokenA.address as `0x${string}`, tokenB.address as `0x${string}`] : undefined,
    query: { enabled: !!addrs && !!tokenA && !!tokenB },
  });

  // Get reserves for auto-fill
  const { data: reserves } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: "getReserves",
    query: { enabled: !!pairAddress && pairAddress !== "0x0000000000000000000000000000000000000000" },
  });

  // Allowance checks
  const { data: allowanceA, refetch: refetchA } = useReadContract({
    address: tokenA?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, addrs?.router as `0x${string}`] : undefined,
    query: { enabled: !!addrs && !isEthA && !!tokenA && !!address },
  });

  const { data: allowanceB, refetch: refetchB } = useReadContract({
    address: tokenB?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, addrs?.router as `0x${string}`] : undefined,
    query: { enabled: !!addrs && !isEthB && !!tokenB && !!address },
  });

  const { writeContractAsync } = useWriteContract();

  const parsedA = tokenA && amountA ? (() => { try { return parseUnits(amountA, tokenA.decimals); } catch { return 0n; } })() : 0n;
  const parsedB = tokenB && amountB ? (() => { try { return parseUnits(amountB, tokenB.decimals); } catch { return 0n; } })() : 0n;

  const needsApproveA = !isEthA && !!allowanceA && parsedA > 0n && (allowanceA as bigint) < parsedA;
  const needsApproveB = !isEthB && !!allowanceB && parsedB > 0n && (allowanceB as bigint) < parsedB;

  const approveA = useCallback(async () => {
    if (!tokenA || !addrs) return;
    await writeContractAsync({ address: tokenA.address as `0x${string}`, abi: ERC20_ABI, functionName: "approve", args: [addrs.router, maxUint256] });
    refetchA();
  }, [tokenA, addrs, writeContractAsync, refetchA]);

  const approveB = useCallback(async () => {
    if (!tokenB || !addrs) return;
    await writeContractAsync({ address: tokenB.address as `0x${string}`, abi: ERC20_ABI, functionName: "approve", args: [addrs.router, maxUint256] });
    refetchB();
  }, [tokenB, addrs, writeContractAsync, refetchB]);

  const addLiquidity = useCallback(async () => {
    if (!tokenA || !tokenB || !address || !addrs) return;
    setIsPending(true);
    setError(null);
    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
      const minA = (parsedA * BigInt(Math.floor((1 - slippage / 100) * 10000))) / 10000n;
      const minB = (parsedB * BigInt(Math.floor((1 - slippage / 100) * 10000))) / 10000n;
      let hash: `0x${string}`;
      if (isEthA || isEthB) {
        const [token, tokenAmt, tokenMin, ethAmt, ethMin] = isEthA
          ? [tokenB.address as `0x${string}`, parsedB, minB, parsedA, minA]
          : [tokenA.address as `0x${string}`, parsedA, minA, parsedB, minB];
        hash = await writeContractAsync({
          address: addrs.router, abi: ROUTER_ABI, functionName: "addLiquidityETH",
          args: [token, tokenAmt, tokenMin, ethMin, address, deadline],
          value: ethAmt,
        });
      } else {
        hash = await writeContractAsync({
          address: addrs.router, abi: ROUTER_ABI, functionName: "addLiquidity",
          args: [tokenA.address as `0x${string}`, tokenB.address as `0x${string}`, parsedA, parsedB, minA, minB, address, deadline],
        });
      }
      setTxHash(hash);
      setAmountA("");
      setAmountB("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setIsPending(false);
    }
  }, [tokenA, tokenB, address, parsedA, parsedB, slippage, isEthA, isEthB, addrs.router, writeContractAsync]);

  return {
    tokenA, tokenB, amountA, amountB, reserves, pairAddress,
    needsApproveA, needsApproveB, isPending, txHash, error,
    setTokenA, setTokenB, setAmountA, setAmountB,
    approveA, approveB, addLiquidity,
  };
}

export function useRemoveLiquidity(pairAddress: `0x${string}` | undefined, tokenA: Token | null, tokenB: Token | null) {
  const { address } = useAccount();
  const chainId = useChainId();
  const addrs = CONTRACT_ADDRESSES[chainId];
  const { writeContractAsync } = useWriteContract();

  const [percent, setPercent] = useState(50);
  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: lpBalance } = useReadContract({
    address: pairAddress,
    abi: PAIR_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!pairAddress && !!address },
  });

  const { data: lpAllowance, refetch: refetchAllowance } = useReadContract({
    address: pairAddress,
    abi: PAIR_ABI,
    functionName: "allowance",
    args: address ? [address, addrs?.router as `0x${string}`] : undefined,
    query: { enabled: !!addrs && !!pairAddress && !!address },
  });

  const removeAmount = lpBalance ? ((lpBalance as bigint) * BigInt(percent)) / 100n : 0n;
  const needsApprove = !!lpAllowance && removeAmount > 0n && (lpAllowance as bigint) < removeAmount;

  const approve = useCallback(async () => {
    if (!pairAddress || !addrs) return;
    await writeContractAsync({ address: pairAddress, abi: PAIR_ABI, functionName: "approve", args: [addrs.router, maxUint256] });
    refetchAllowance();
  }, [pairAddress, addrs, writeContractAsync, refetchAllowance]);

  const removeLiquidity = useCallback(async () => {
    if (!tokenA || !tokenB || !address || !pairAddress || !addrs) return;
    setIsPending(true);
    setError(null);
    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
      const hash = await writeContractAsync({
        address: addrs.router, abi: ROUTER_ABI, functionName: "removeLiquidity",
        args: [tokenA.address as `0x${string}`, tokenB.address as `0x${string}`, removeAmount, 0n, 0n, address, deadline],
      });
      setTxHash(hash);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setIsPending(false);
    }
  }, [tokenA, tokenB, address, pairAddress, removeAmount, addrs.router, writeContractAsync]);

  return { percent, lpBalance, needsApprove, isPending, txHash, error, setPercent, approve, removeLiquidity };
}
