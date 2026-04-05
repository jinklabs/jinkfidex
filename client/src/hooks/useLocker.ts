/**
 * useLocker — on-chain integration for TokenLockerManagerV1.
 *
 * Architecture:
 *  - TokenLockerManagerV1 is the single manager contract.
 *  - Each lock deploys a separate TokenLockerV1 contract.
 *  - createTokenLocker / createLpLocker → unlockTime_ is a DURATION (seconds from now).
 *  - TokenLockerV1.deposit(0, newAbsoluteTimestamp) → extends lock.
 *  - TokenLockerV1.withdraw() → returns tokens after unlock.
 *  - TokenLockerV1.transferOwnership(newOwner) → transfers lock.
 */

import { useChainId, useAccount, useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACT_ADDRESSES, TOKEN_LOCKER_MANAGER_ABI, TOKEN_LOCKER_V1_ABI, ERC20_ABI } from "../lib/contracts";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OnChainLock {
  id: string;
  numericId: number;
  lockType: "token" | "lp";
  tokenAddress: string;
  contractAddress: string; // TokenLockerV1 address
  amount: string;          // human-readable (18 decimals assumed)
  rawAmount: bigint;
  owner: string;
  unlockDate: string;      // ISO string
  withdrawn: boolean;
  chainId: number;
}

// ── Raw result → OnChainLock ──────────────────────────────────────────────────

function parseLockResult(
  result: { status: string; result?: unknown },
  isLp: boolean,
  chainId: number
): OnChainLock | null {
  if (result.status !== "success" || !result.result) return null;
  const [, numId, contractAddress, lockOwner, token, , , , unlockTime, balance] =
    result.result as [boolean, bigint, `0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`, bigint, bigint, bigint, bigint, bigint];
  return {
    id: `${isLp ? "lp" : "token"}_${numId}`,
    numericId: Number(numId),
    lockType: isLp ? "lp" : "token",
    tokenAddress: token,
    contractAddress,
    rawAmount: balance,
    amount: formatUnits(balance, 18),
    owner: lockOwner,
    unlockDate: new Date(Number(unlockTime) * 1000).toISOString(),
    withdrawn: balance === 0n && Number(unlockTime) * 1000 <= Date.now(),
    chainId,
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useLocker() {
  const chainId  = useChainId();
  const { address } = useAccount();

  const managerAddress = CONTRACT_ADDRESSES[chainId]?.lockerManager as `0x${string}` | undefined;
  const enabled = !!managerAddress && managerAddress !== "0x0000000000000000000000000000000000000001";

  // ── Fees ──────────────────────────────────────────────────────────────────

  const { data: tokenFee } = useReadContract({
    address: managerAddress, abi: TOKEN_LOCKER_MANAGER_ABI,
    functionName: "TokenLockerFee", query: { enabled },
  });

  const { data: lpFee } = useReadContract({
    address: managerAddress, abi: TOKEN_LOCKER_MANAGER_ABI,
    functionName: "LpLockerFee", query: { enabled },
  });

  // ── Global counts (for stats + explore) ──────────────────────────────────

  const { data: tokenCount } = useReadContract({
    address: managerAddress, abi: TOKEN_LOCKER_MANAGER_ABI,
    functionName: "tokenLockerCount", query: { enabled },
  });

  const { data: lpCount } = useReadContract({
    address: managerAddress, abi: TOKEN_LOCKER_MANAGER_ABI,
    functionName: "lpLockerCount", query: { enabled },
  });

  // ── My lock IDs ───────────────────────────────────────────────────────────

  const { data: myTokenIds, refetch: refetchMyTokenIds } = useReadContract({
    address: managerAddress, abi: TOKEN_LOCKER_MANAGER_ABI,
    functionName: "getTokenLockersForAddress",
    args: address ? [address] : undefined,
    query: { enabled: enabled && !!address },
  });

  const { data: myLpIds, refetch: refetchMyLpIds } = useReadContract({
    address: managerAddress, abi: TOKEN_LOCKER_MANAGER_ABI,
    functionName: "getLpLockersForAddress",
    args: address ? [address] : undefined,
    query: { enabled: enabled && !!address },
  });

  // ── Batch-read my lock data ───────────────────────────────────────────────

  const myTokenCalls = ((myTokenIds as unknown as bigint[]) ?? []).map(id => ({
    address: managerAddress!, abi: TOKEN_LOCKER_MANAGER_ABI,
    functionName: "getTokenLockData" as const, args: [id] as [bigint],
  }));

  const myLpCalls = ((myLpIds as unknown as bigint[]) ?? []).map(id => ({
    address: managerAddress!, abi: TOKEN_LOCKER_MANAGER_ABI,
    functionName: "getLpLockData" as const, args: [id] as [bigint],
  }));

  const { data: myTokenData, refetch: refetchMyTokenData } = useReadContracts({
    contracts: myTokenCalls,
    query: { enabled: enabled && myTokenCalls.length > 0 },
  });

  const { data: myLpData, refetch: refetchMyLpData } = useReadContracts({
    contracts: myLpCalls,
    query: { enabled: enabled && myLpCalls.length > 0 },
  });

  // ── Explore: last 20 of each type ─────────────────────────────────────────

  const EXPLORE_MAX = 20;

  const exploreTokenIds = tokenCount != null
    ? Array.from({ length: Math.min(Number(tokenCount), EXPLORE_MAX) }, (_, i) => BigInt(Number(tokenCount) - 1 - i))
    : [];

  const exploreLpIds = lpCount != null
    ? Array.from({ length: Math.min(Number(lpCount), EXPLORE_MAX) }, (_, i) => BigInt(Number(lpCount) - 1 - i))
    : [];

  const { data: exploreTokenData } = useReadContracts({
    contracts: exploreTokenIds.map(id => ({
      address: managerAddress!, abi: TOKEN_LOCKER_MANAGER_ABI,
      functionName: "getTokenLockData" as const, args: [id] as [bigint],
    })),
    query: { enabled: enabled && exploreTokenIds.length > 0 },
  });

  const { data: exploreLpData } = useReadContracts({
    contracts: exploreLpIds.map(id => ({
      address: managerAddress!, abi: TOKEN_LOCKER_MANAGER_ABI,
      functionName: "getLpLockData" as const, args: [id] as [bigint],
    })),
    query: { enabled: enabled && exploreLpIds.length > 0 },
  });

  // ── Parsed results ────────────────────────────────────────────────────────

  const myLocks: OnChainLock[] = [
    ...((myTokenData ?? []).map(r => parseLockResult(r as any, false, chainId)).filter(Boolean) as OnChainLock[]),
    ...((myLpData ?? []).map(r => parseLockResult(r as any, true, chainId)).filter(Boolean) as OnChainLock[]),
  ];

  const exploreTokenLocks: OnChainLock[] =
    (exploreTokenData ?? []).map(r => parseLockResult(r as any, false, chainId)).filter(Boolean) as OnChainLock[];

  const exploreLpLocks: OnChainLock[] =
    (exploreLpData ?? []).map(r => parseLockResult(r as any, true, chainId)).filter(Boolean) as OnChainLock[];

  // ── Writes ────────────────────────────────────────────────────────────────

  const { writeContractAsync } = useWriteContract();

  async function createLock(
    type: "token" | "lp",
    tokenAddress: `0x${string}`,
    rawAmount: bigint,
    durationSecs: number,
  ) {
    if (!managerAddress || !address) throw new Error("Not connected");
    const fee = (type === "token" ? (tokenFee as bigint) : (lpFee as bigint)) ?? 0n;

    // Step 1 — approve manager to spend tokens
    await writeContractAsync({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [managerAddress, rawAmount],
    });

    // Step 2 — create the lock (send ETH fee)
    const fn = type === "token" ? "createTokenLocker" : "createLpLocker";
    return writeContractAsync({
      address: managerAddress,
      abi: TOKEN_LOCKER_MANAGER_ABI,
      functionName: fn,
      args: [tokenAddress, rawAmount, durationSecs],
      value: fee,
    });
  }

  async function withdrawLock(lockerAddress: `0x${string}`) {
    return writeContractAsync({
      address: lockerAddress,
      abi: TOKEN_LOCKER_V1_ABI,
      functionName: "withdraw",
    });
  }

  /** Extend lock to a new absolute Unix timestamp (seconds). */
  async function extendLock(lockerAddress: `0x${string}`, newUnlockTimeSecs: number) {
    return writeContractAsync({
      address: lockerAddress,
      abi: TOKEN_LOCKER_V1_ABI,
      functionName: "deposit",
      args: [0n, newUnlockTimeSecs],
    });
  }

  async function transferLock(lockerAddress: `0x${string}`, newOwner: `0x${string}`) {
    return writeContractAsync({
      address: lockerAddress,
      abi: TOKEN_LOCKER_V1_ABI,
      functionName: "transferOwnership",
      args: [newOwner],
    });
  }

  function refetch() {
    refetchMyTokenIds();
    refetchMyLpIds();
    refetchMyTokenData();
    refetchMyLpData();
  }

  return {
    managerAddress,
    isDeployed: enabled,
    tokenFee: tokenFee as bigint | undefined,
    lpFee: lpFee as bigint | undefined,
    tokenCount: Number(tokenCount ?? 0),
    lpCount: Number(lpCount ?? 0),
    myLocks,
    exploreTokenLocks,
    exploreLpLocks,
    createLock,
    withdrawLock,
    extendLock,
    transferLock,
    refetch,
  };
}
