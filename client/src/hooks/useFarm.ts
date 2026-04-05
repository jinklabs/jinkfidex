import { useState, useCallback } from "react";
import { useAccount, useChainId, useReadContract, useWriteContract } from "wagmi";
import { parseUnits, maxUint256 } from "viem";
import { ERC20_ABI, FARM_ABI, CONTRACT_ADDRESSES } from "../lib/contracts";
import type { FarmInfo } from "../lib/farms";

export function useFarm(farm: FarmInfo) {
  const { address } = useAccount();
  const chainId = useChainId();
  const addrs = CONTRACT_ADDRESSES[chainId];
  const farmAddress = addrs?.farm;
  const { writeContractAsync } = useWriteContract();

  const [stakeAmount, setStakeAmount] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: userInfo, refetch: refetchUser } = useReadContract({
    address: farmAddress,
    abi: FARM_ABI,
    functionName: "userInfo",
    args: address ? [BigInt(farm.pid), address] : undefined,
    query: { enabled: !!address && !!farmAddress, refetchInterval: 10_000 },
  });

  const { data: pending, refetch: refetchPending } = useReadContract({
    address: farmAddress,
    abi: FARM_ABI,
    functionName: "pendingReward",
    args: address ? [BigInt(farm.pid), address] : undefined,
    query: { enabled: !!address && !!farmAddress, refetchInterval: 10_000 },
  });

  const { data: lpBalance } = useReadContract({
    address: farm.lpToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: farm.lpToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && farmAddress ? [address, farmAddress] : undefined,
    query: { enabled: !!address && !!farmAddress },
  });

  const parsedStake = stakeAmount ? (() => { try { return parseUnits(stakeAmount, 18); } catch { return 0n; } })() : 0n;
  const needsApprove = !!allowance && parsedStake > 0n && (allowance as bigint) < parsedStake;

  const approve = useCallback(async () => {
    if (!farmAddress) return;
    await writeContractAsync({ address: farm.lpToken as `0x${string}`, abi: ERC20_ABI, functionName: "approve", args: [farmAddress, maxUint256] });
    refetchAllowance();
  }, [farm.lpToken, farmAddress, writeContractAsync, refetchAllowance]);

  const stake = useCallback(async () => {
    if (!parsedStake || !farmAddress) return;
    setIsPending(true);
    setError(null);
    try {
      await writeContractAsync({ address: farmAddress, abi: FARM_ABI, functionName: "deposit", args: [BigInt(farm.pid), parsedStake] });
      setStakeAmount("");
      refetchUser();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Stake failed");
    } finally {
      setIsPending(false);
    }
  }, [farm.pid, parsedStake, farmAddress, writeContractAsync, refetchUser]);

  const unstake = useCallback(async (amount: bigint) => {
    if (!farmAddress) return;
    setIsPending(true);
    setError(null);
    try {
      await writeContractAsync({ address: farmAddress, abi: FARM_ABI, functionName: "withdraw", args: [BigInt(farm.pid), amount] });
      refetchUser();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unstake failed");
    } finally {
      setIsPending(false);
    }
  }, [farm.pid, farmAddress, writeContractAsync, refetchUser]);

  const harvest = useCallback(async () => {
    if (!farmAddress) return;
    setIsPending(true);
    setError(null);
    try {
      await writeContractAsync({ address: farmAddress, abi: FARM_ABI, functionName: "harvest", args: [BigInt(farm.pid)] });
      refetchPending();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Harvest failed");
    } finally {
      setIsPending(false);
    }
  }, [farm.pid, farmAddress, writeContractAsync, refetchPending]);

  const stakedAmount = userInfo ? (userInfo as readonly [bigint, bigint])[0] : 0n;

  return {
    stakedAmount,
    pendingReward: (pending ?? 0n) as bigint,
    lpBalance: (lpBalance ?? 0n) as bigint,
    stakeAmount, needsApprove, isPending, error,
    setStakeAmount, approve, stake, unstake, harvest,
  };
}
