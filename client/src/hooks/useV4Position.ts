import { useState, useCallback } from "react";
import { useAccount, useChainId, useReadContract, useWriteContract } from "wagmi";
import { parseUnits, maxUint256, encodeAbiParameters, encodePacked } from "viem";
import { ETH_ADDRESS, type Token } from "../lib/tokens";
import { ERC20_ABI } from "../lib/contracts";
import {
  V4_POSITION_MANAGER_ABI, POOL_MANAGER_ABI, UNISWAP_ADDRESSES,
  V3_FEE_TIERS, type V3FeeTier,
  V4_ACTIONS, V4_HOOKS,
  priceToTick, nearestUsableTick,
} from "../lib/uniswap";

// Native ETH is address(0) in V4
const NATIVE = "0x0000000000000000000000000000000000000000" as `0x${string}`;

const Q96 = 2n ** 96n;

function sqrtPriceX96FromTick(tick: number): bigint {
  const sqrtPrice = Math.sqrt(Math.pow(1.0001, tick));
  return BigInt(Math.floor(sqrtPrice * 2 ** 48)) * (Q96 / BigInt(2 ** 48));
}

function getLiquidityForAmounts(
  sqrtRatioX96: bigint,
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  amount0: bigint,
  amount1: bigint,
): bigint {
  if (sqrtRatioAX96 > sqrtRatioBX96) [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
  // Divide before multiply to avoid bigint overflow (sqrtPrice values are Q96-scaled)
  if (sqrtRatioX96 <= sqrtRatioAX96) {
    const num = amount0 * (sqrtRatioAX96 / Q96) * sqrtRatioBX96;
    const den = sqrtRatioBX96 - sqrtRatioAX96;
    return den > 0n ? num / den : 0n;
  } else if (sqrtRatioX96 < sqrtRatioBX96) {
    const l0Den = sqrtRatioBX96 - sqrtRatioX96;
    const l0 = l0Den > 0n ? (amount0 * (sqrtRatioX96 / Q96) * sqrtRatioBX96) / l0Den : 0n;
    const l1Den = sqrtRatioX96 - sqrtRatioAX96;
    const l1 = l1Den > 0n ? (amount1 * Q96) / l1Den : 0n;
    return l0 < l1 ? l0 : l1;
  } else {
    const den = sqrtRatioBX96 - sqrtRatioAX96;
    return den > 0n ? (amount1 * Q96) / den : 0n;
  }
}

/** Encode the unlockData bytes for a MINT_POSITION + SETTLE_PAIR call */
function encodeMintLiquidities(params: {
  currency0: `0x${string}`;
  currency1: `0x${string}`;
  fee: number;
  tickSpacing: number;
  hooks: `0x${string}`;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  amount0Max: bigint;
  amount1Max: bigint;
  recipient: `0x${string}`;
}): `0x${string}` {
  const actions = encodePacked(
    ["uint8", "uint8"],
    [V4_ACTIONS.MINT_POSITION, V4_ACTIONS.SETTLE_PAIR],
  );

  const mintParam = encodeAbiParameters(
    [
      {
        type: "tuple",
        components: [
          { name: "currency0",   type: "address" },
          { name: "currency1",   type: "address" },
          { name: "fee",         type: "uint24"  },
          { name: "tickSpacing", type: "int24"   },
          { name: "hooks",       type: "address" },
        ],
      },
      { name: "tickLower",   type: "int24"   },
      { name: "tickUpper",   type: "int24"   },
      { name: "liquidity",   type: "uint128" },
      { name: "amount0Max",  type: "uint128" },
      { name: "amount1Max",  type: "uint128" },
      { name: "recipient",   type: "address" },
      { name: "hookData",    type: "bytes"   },
    ],
    [
      {
        currency0:   params.currency0,
        currency1:   params.currency1,
        fee:         params.fee,
        tickSpacing: params.tickSpacing,
        hooks:       params.hooks,
      },
      params.tickLower,
      params.tickUpper,
      params.liquidity,
      params.amount0Max,
      params.amount1Max,
      params.recipient,
      "0x" as `0x${string}`,
    ],
  );

  const settlePairParam = encodeAbiParameters(
    [{ name: "currency0", type: "address" }, { name: "currency1", type: "address" }],
    [params.currency0, params.currency1],
  );

  return encodeAbiParameters(
    [{ name: "actions", type: "bytes" }, { name: "params", type: "bytes[]" }],
    [actions, [mintParam, settlePairParam]],
  );
}

export function useV4Position() {
  const { address } = useAccount();
  const chainId = useChainId();
  const uniAddrs = UNISWAP_ADDRESSES[chainId];
  const pmAddr = uniAddrs?.v4PositionManager as `0x${string}` | undefined;
  const poolManagerAddr = uniAddrs?.v4PoolManager as `0x${string}` | undefined;

  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [fee, setFee] = useState<V3FeeTier>(3000);
  const [hookAddr, setHookAddr] = useState<string>(V4_HOOKS[0].address);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sort by address — V4 also requires currency0 < currency1
  const swapped = !!(tokenA && tokenB && tokenA.address.toLowerCase() > tokenB.address.toLowerCase());
  const token0 = swapped ? tokenB : tokenA;
  const token1 = swapped ? tokenA : tokenB;
  const amount0Str = swapped ? amountB : amountA;
  const amount1Str = swapped ? amountA : amountB;

  // V4 native ETH = address(0)
  const currency0 = token0?.address === ETH_ADDRESS ? NATIVE : (token0?.address as `0x${string}` | undefined);
  const currency1 = token1?.address === ETH_ADDRESS ? NATIVE : (token1?.address as `0x${string}` | undefined);
  const isNative0 = currency0 === NATIVE;
  const isNative1 = currency1 === NATIVE;

  const tickSpacing = V3_FEE_TIERS.find(t => t.fee === fee)?.tickSpacing ?? 60;

  // Fetch current pool slot0 from PoolManager
  const poolKey = token0 && token1 && currency0 && currency1
    ? { currency0, currency1, fee, tickSpacing, hooks: hookAddr as `0x${string}` }
    : undefined;

  const { data: slot0 } = useReadContract({
    address: poolManagerAddr,
    abi: POOL_MANAGER_ABI,
    functionName: "getSlot0",
    args: poolKey ? [poolKey] : undefined,
    query: { enabled: !!poolManagerAddr && !!poolKey },
  });

  const poolExists = !!slot0 && (slot0 as unknown as [bigint, number])[0] > 0n;
  const currentSqrtX96: bigint = poolExists ? (slot0 as unknown as [bigint, number])[0] : sqrtPriceX96FromTick(0);
  const currentTick: number = poolExists ? (slot0 as unknown as [bigint, number])[1] : 0;
  const currentPrice = token0 && token1
    ? Math.pow(1.0001, currentTick) * Math.pow(10, token0.decimals - token1.decimals)
    : 1;

  const { writeContractAsync } = useWriteContract();

  const parsed0 = token0 && amount0Str
    ? (() => { try { return parseUnits(amount0Str, token0.decimals); } catch { return 0n; } })()
    : 0n;
  const parsed1 = token1 && amount1Str
    ? (() => { try { return parseUnits(amount1Str, token1.decimals); } catch { return 0n; } })()
    : 0n;

  // ERC20 approvals to V4 PositionManager
  const { data: allowance0, refetch: refetch0 } = useReadContract({
    address: token0?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, pmAddr as `0x${string}`] : undefined,
    query: { enabled: !!pmAddr && !isNative0 && !!token0 && !!address },
  });

  const { data: allowance1, refetch: refetch1 } = useReadContract({
    address: token1?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, pmAddr as `0x${string}`] : undefined,
    query: { enabled: !!pmAddr && !isNative1 && !!token1 && !!address },
  });

  const needsApprove0 = !isNative0 && !!allowance0 && parsed0 > 0n && (allowance0 as bigint) < parsed0;
  const needsApprove1 = !isNative1 && !!allowance1 && parsed1 > 0n && (allowance1 as bigint) < parsed1;

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
    if (!token0 || !token1 || !address || !currency0 || !currency1 || !minPrice || !maxPrice || !pmAddr) return;
    setIsPending(true);
    setError(null);
    try {
      const rawTickLower = priceToTick(parseFloat(minPrice), token0.decimals, token1.decimals);
      const maxPriceNum = maxPrice === "∞" ? 1e18 : parseFloat(maxPrice);
      const rawTickUpper = priceToTick(maxPriceNum, token0.decimals, token1.decimals);
      const tickLower = nearestUsableTick(Math.min(rawTickLower, rawTickUpper), tickSpacing);
      const tickUpper = nearestUsableTick(Math.max(rawTickLower, rawTickUpper), tickSpacing);

      const sqrtA = sqrtPriceX96FromTick(tickLower);
      const sqrtB = sqrtPriceX96FromTick(tickUpper);
      const liquidity = getLiquidityForAmounts(currentSqrtX96, sqrtA, sqrtB, parsed0, parsed1);
      if (liquidity === 0n) throw new Error("Computed liquidity is zero — check price range and amounts");

      // Add 1% buffer to maxAmounts to avoid slippage reverts
      const amount0Max = parsed0 + (parsed0 / 100n);
      const amount1Max = parsed1 + (parsed1 / 100n);

      const unlockData = encodeMintLiquidities({
        currency0,
        currency1,
        fee,
        tickSpacing,
        hooks: hookAddr as `0x${string}`,
        tickLower,
        tickUpper,
        liquidity,
        amount0Max,
        amount1Max,
        recipient: address,
      });

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
      const ethValue = isNative0 ? amount0Max : isNative1 ? amount1Max : 0n;

      const hash = await writeContractAsync({
        address: pmAddr as `0x${string}`,
        abi: V4_POSITION_MANAGER_ABI,
        functionName: "modifyLiquidities",
        args: [unlockData, deadline],
        value: ethValue,
      });
      setTxHash(hash);
      setAmountA(""); setAmountB("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message.slice(0, 120) : "Transaction failed");
    } finally {
      setIsPending(false);
    }
  }, [
    token0, token1, address, currency0, currency1,
    fee, tickSpacing, hookAddr, minPrice, maxPrice,
    parsed0, parsed1, currentSqrtX96,
    isNative0, isNative1, pmAddr, writeContractAsync,
  ]);

  const initializePool = useCallback(async (initialPrice: number) => {
    if (!token0 || !token1 || !currency0 || !currency1 || !pmAddr) return;
    setIsPending(true);
    setError(null);
    try {
      const tick = priceToTick(initialPrice, token0.decimals, token1.decimals);
      const sqrtPriceX96 = sqrtPriceX96FromTick(tick);
      const hash = await writeContractAsync({
        address: pmAddr as `0x${string}`,
        abi: V4_POSITION_MANAGER_ABI,
        functionName: "initializePool",
        args: [
          { currency0, currency1, fee, tickSpacing, hooks: hookAddr as `0x${string}` },
          sqrtPriceX96,
          "0x" as `0x${string}`,
        ],
      });
      setTxHash(hash);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message.slice(0, 120) : "Init failed");
    } finally {
      setIsPending(false);
    }
  }, [token0, token1, currency0, currency1, fee, tickSpacing, hookAddr, pmAddr, writeContractAsync]);

  return {
    tokenA, setTokenA, tokenB, setTokenB,
    amountA, setAmountA, amountB, setAmountB,
    fee, setFee, hookAddr, setHookAddr,
    minPrice, setMinPrice, maxPrice, setMaxPrice,
    token0, token1, currentPrice, poolExists,
    needsApprove0, needsApprove1,
    isPending, txHash, error,
    approve0, approve1, mint, initializePool,
  };
}
