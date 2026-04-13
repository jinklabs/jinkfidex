import { useState, useCallback } from "react";
import { useAccount, useChainId, useReadContract, useWriteContract } from "wagmi";
import { parseUnits, maxUint256 } from "viem";
import { ETH_ADDRESS, type Token } from "../lib/tokens";
import { ERC20_ABI } from "../lib/contracts";
import {
  NONFUNGIBLE_POSITION_MANAGER_ABI, V3_FACTORY_ABI, V3_POOL_ABI,
  V3_FACTORY_ADDRESSES, UNISWAP_ADDRESSES, V3_FEE_TIERS, type V3FeeTier,
  priceToTick, nearestUsableTick,
} from "../lib/uniswap";

export function useV3Position() {
  const { address } = useAccount();
  const chainId = useChainId();
  const uniAddrs = UNISWAP_ADDRESSES[chainId];
  const v3Factory = V3_FACTORY_ADDRESSES[chainId];
  const pmAddr = uniAddrs?.v3PositionManager;

  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [fee, setFee] = useState<V3FeeTier>(3000);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sort tokens by address (V3 requires token0 < token1)
  const swapped = !!(tokenA && tokenB && tokenA.address.toLowerCase() > tokenB.address.toLowerCase());
  const token0 = swapped ? tokenB : tokenA;
  const token1 = swapped ? tokenA : tokenB;
  const amount0Str = swapped ? amountB : amountA;
  const amount1Str = swapped ? amountA : amountB;

  // Fetch V3 pool address
  const { data: poolAddress } = useReadContract({
    address: v3Factory,
    abi: V3_FACTORY_ABI,
    functionName: "getPool",
    args: token0 && token1
      ? [token0.address as `0x${string}`, token1.address as `0x${string}`, fee]
      : undefined,
    query: { enabled: !!v3Factory && !!token0 && !!token1 },
  });

  const poolExists =
    !!poolAddress && poolAddress !== "0x0000000000000000000000000000000000000000";

  // Fetch current pool price
  const { data: slot0 } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: V3_POOL_ABI,
    functionName: "slot0",
    query: { enabled: poolExists },
  });

  const currentTick = slot0 ? (slot0 as unknown as [bigint, number])[1] : 0;
  const currentPrice =
    token0 && token1
      ? Math.pow(1.0001, currentTick) * Math.pow(10, token0.decimals - token1.decimals)
      : 1;

  const { writeContractAsync } = useWriteContract();

  const parsed0 = token0 && amount0Str
    ? (() => { try { return parseUnits(amount0Str, token0.decimals); } catch { return 0n; } })()
    : 0n;
  const parsed1 = token1 && amount1Str
    ? (() => { try { return parseUnits(amount1Str, token1.decimals); } catch { return 0n; } })()
    : 0n;

  const isEth0 = token0?.address === ETH_ADDRESS;
  const isEth1 = token1?.address === ETH_ADDRESS;

  const { data: allowance0, refetch: refetch0 } = useReadContract({
    address: token0?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, pmAddr as `0x${string}`] : undefined,
    query: { enabled: !!pmAddr && !isEth0 && !!token0 && !!address },
  });

  const { data: allowance1, refetch: refetch1 } = useReadContract({
    address: token1?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, pmAddr as `0x${string}`] : undefined,
    query: { enabled: !!pmAddr && !isEth1 && !!token1 && !!address },
  });

  const needsApprove0 = !isEth0 && !!allowance0 && parsed0 > 0n && (allowance0 as bigint) < parsed0;
  const needsApprove1 = !isEth1 && !!allowance1 && parsed1 > 0n && (allowance1 as bigint) < parsed1;

  const approve0 = useCallback(async () => {
    if (!token0 || !pmAddr) return;
    await writeContractAsync({ address: token0.address as `0x${string}`, abi: ERC20_ABI, functionName: "approve", args: [pmAddr as `0x${string}`, maxUint256] });
    refetch0();
  }, [token0, pmAddr, writeContractAsync, refetch0]);

  const approve1 = useCallback(async () => {
    if (!token1 || !pmAddr) return;
    await writeContractAsync({ address: token1.address as `0x${string}`, abi: ERC20_ABI, functionName: "approve", args: [pmAddr as `0x${string}`, maxUint256] });
    refetch1();
  }, [token1, pmAddr, writeContractAsync, refetch1]);

  const mint = useCallback(async () => {
    if (!token0 || !token1 || !address || !minPrice || !maxPrice || !amount0Str || !amount1Str || !pmAddr) return;
    setIsPending(true);
    setError(null);
    try {
      const tickSpacing = V3_FEE_TIERS.find(t => t.fee === fee)?.tickSpacing ?? 60;
      const rawTickLower = priceToTick(parseFloat(minPrice), token0.decimals, token1.decimals);
      const maxPriceNum = maxPrice === "∞" ? 1e18 : parseFloat(maxPrice);
      const rawTickUpper = priceToTick(maxPriceNum, token0.decimals, token1.decimals);
      const tickLower = nearestUsableTick(Math.min(rawTickLower, rawTickUpper), tickSpacing);
      const tickUpper = nearestUsableTick(Math.max(rawTickLower, rawTickUpper), tickSpacing);

      const slipBps = 50n; // 0.5%
      const min0 = parsed0 - (parsed0 * slipBps) / 10000n;
      const min1 = parsed1 - (parsed1 * slipBps) / 10000n;
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

      const hash = await writeContractAsync({
        address: pmAddr as `0x${string}`,
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "mint",
        args: [{
          token0: token0.address as `0x${string}`,
          token1: token1.address as `0x${string}`,
          fee,
          tickLower,
          tickUpper,
          amount0Desired: parsed0,
          amount1Desired: parsed1,
          amount0Min: min0 > 0n ? min0 : 0n,
          amount1Min: min1 > 0n ? min1 : 0n,
          recipient: address,
          deadline,
        }],
        value: isEth0 ? parsed0 : isEth1 ? parsed1 : 0n,
      });
      setTxHash(hash);
      setAmountA(""); setAmountB("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message.slice(0, 120) : "Transaction failed");
    } finally {
      setIsPending(false);
    }
  }, [
    token0, token1, address, fee, minPrice, maxPrice,
    amount0Str, amount1Str, parsed0, parsed1,
    isEth0, isEth1, pmAddr, writeContractAsync,
  ]);

  return {
    tokenA, setTokenA, tokenB, setTokenB,
    amountA, setAmountA, amountB, setAmountB,
    fee, setFee, minPrice, setMinPrice, maxPrice, setMaxPrice,
    token0, token1, currentPrice, poolExists,
    needsApprove0, needsApprove1,
    isPending, txHash, error,
    approve0, approve1, mint,
  };
}
