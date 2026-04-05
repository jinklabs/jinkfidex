import { Request, Response } from "express";
import { ethers } from "ethers";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const RPC_BY_CHAIN: Record<number, string> = {
  1:    env.MAINNET_RPC_URL,
  8453: env.BASE_RPC_URL,
};

const STAKING_FEE_WEI = BigInt(Math.round(parseFloat(env.QUEST_FEE_ETH) * 1e18));

const submitSchema = z.object({
  paymentTxHash:      z.string().regex(/^0x[0-9a-fA-F]{64}$/),
  paymentChainId:     z.number().optional().default(1),
  tokenAddress:       z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  tokenSymbol:        z.string().min(1).max(20),
  tokenName:          z.string().min(1).max(80),
  tokenDecimals:      z.number().int().min(0).max(18).optional().default(18),
  rewardTokenAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  rewardTokenSymbol:  z.string().min(1).max(20),
  chainId:            z.number().optional().default(1),
  apy:                z.number().min(0).max(100000),
  lockDays:           z.number().int().min(0).max(3650).default(0),
  minStake:           z.string().default("0"),
  maxStake:           z.string().optional(),
  poolStartDate:      z.string().datetime(),
  poolEndDate:        z.string().datetime(),
  totalRewardBudget:  z.string().min(1),
  description:        z.string().min(10).max(2000),
  projectName:        z.string().min(2).max(80),
  projectUrl:         z.string().url().optional(),
  logoUrl:            z.string().url().optional(),
});

const reviewSchema = z.object({ adminNote: z.string().optional() });

// POST /api/staking/submit
export async function submitStaking(req: AuthRequest, res: Response) {
  const body = submitSchema.parse(req.body);

  const rpcUrl = RPC_BY_CHAIN[body.paymentChainId] ?? env.MAINNET_RPC_URL;
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const [tx, receipt] = await Promise.all([
    provider.getTransaction(body.paymentTxHash),
    provider.getTransactionReceipt(body.paymentTxHash),
  ]);

  if (!tx) throw new AppError(400, "Payment transaction not found on-chain");
  if (!receipt || receipt.status !== 1) throw new AppError(400, "Payment transaction failed or not yet mined");
  if (tx.from.toLowerCase() !== req.user!.address.toLowerCase())
    throw new AppError(400, "Payment must be sent from your connected wallet");
  if (!env.FEE_RECIPIENT_ADDRESS)
    throw new AppError(500, "Fee recipient not configured");
  if (tx.to?.toLowerCase() !== env.FEE_RECIPIENT_ADDRESS.toLowerCase())
    throw new AppError(400, "Payment not sent to correct fee address");
  if (tx.value < STAKING_FEE_WEI)
    throw new AppError(400, `Payment must be at least ${env.QUEST_FEE_ETH} ETH`);

  const duplicate = await prisma.stakingSubmission.findFirst({ where: { paymentTxHash: body.paymentTxHash } });
  if (duplicate) throw new AppError(409, "Transaction already used for a submission");

  const submission = await prisma.stakingSubmission.create({
    data: {
      submitterAddress:   req.user!.address,
      paymentTxHash:      body.paymentTxHash,
      paymentChainId:     body.paymentChainId,
      feePaid:            env.QUEST_FEE_ETH,
      tokenAddress:       body.tokenAddress,
      tokenSymbol:        body.tokenSymbol,
      tokenName:          body.tokenName,
      tokenDecimals:      body.tokenDecimals,
      rewardTokenAddress: body.rewardTokenAddress,
      rewardTokenSymbol:  body.rewardTokenSymbol,
      chainId:            body.chainId,
      apy:                body.apy,
      lockDays:           body.lockDays,
      minStake:           body.minStake,
      maxStake:           body.maxStake,
      poolStartDate:      new Date(body.poolStartDate),
      poolEndDate:        new Date(body.poolEndDate),
      totalRewardBudget:  body.totalRewardBudget,
      description:        body.description,
      projectName:        body.projectName,
      projectUrl:         body.projectUrl,
      logoUrl:            body.logoUrl,
    },
  });

  res.status(201).json({ id: submission.id, status: submission.status });
}

// GET /api/staking/submissions
export async function listStakingSubmissions(req: Request, res: Response) {
  const { status } = req.query as { status?: string };
  const submissions = await prisma.stakingSubmission.findMany({
    where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : undefined,
    orderBy: { createdAt: "desc" },
  });
  res.json(submissions);
}

// GET /api/staking/submissions/mine
export async function myStakingSubmissions(req: AuthRequest, res: Response) {
  const submissions = await prisma.stakingSubmission.findMany({
    where: { submitterAddress: req.user!.address },
    orderBy: { createdAt: "desc" },
    select: { id: true, projectName: true, tokenSymbol: true, status: true, adminNote: true, createdAt: true },
  });
  res.json(submissions);
}

// POST /api/staking/submissions/:id/approve
export async function approveStakingSubmission(req: AuthRequest, res: Response) {
  const id = String(req.params.id);
  const { adminNote } = reviewSchema.parse(req.body);

  const sub = await prisma.stakingSubmission.findUnique({ where: { id } });
  if (!sub) throw new AppError(404, "Submission not found");
  if (sub.status !== "PENDING") throw new AppError(409, "Already reviewed");

  await prisma.stakingSubmission.update({
    where: { id },
    data: { status: "APPROVED", adminNote, reviewedBy: req.user!.address, reviewedAt: new Date() },
  });

  res.json({ success: true });
}

// POST /api/staking/submissions/:id/reject
export async function rejectStakingSubmission(req: AuthRequest, res: Response) {
  const id = String(req.params.id);
  const { adminNote } = reviewSchema.parse(req.body);

  const sub = await prisma.stakingSubmission.findUnique({ where: { id } });
  if (!sub) throw new AppError(404, "Submission not found");
  if (sub.status !== "PENDING") throw new AppError(409, "Already reviewed");

  await prisma.stakingSubmission.update({
    where: { id },
    data: { status: "REJECTED", adminNote, reviewedBy: req.user!.address, reviewedAt: new Date() },
  });

  res.json({ success: true });
}
