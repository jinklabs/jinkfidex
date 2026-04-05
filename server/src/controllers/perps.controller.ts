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

const PERPS_FEE_WEI = BigInt(Math.round(parseFloat(env.QUEST_FEE_ETH) * 1e18));

const submitSchema = z.object({
  paymentTxHash:       z.string().regex(/^0x[0-9a-fA-F]{64}$/),
  paymentChainId:      z.number().optional().default(1),
  tokenAddress:        z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  tokenSymbol:         z.string().min(1).max(20),
  tokenName:           z.string().min(1).max(80),
  quoteAsset:          z.enum(["USDT", "USDC"]).default("USDT"),
  chainId:             z.number().optional().default(1),
  oracleType:          z.enum(["chainlink", "pyth", "custom"]).default("chainlink"),
  oracleAddress:       z.string().regex(/^0x[0-9a-fA-F]{40}$/).optional(),
  maxLeverage:         z.number().int().min(2).max(500).default(100),
  tradingFeeBps:       z.number().int().min(1).max(500).default(10),
  liquidationFeeBps:   z.number().int().min(10).max(1000).default(100),
  initialMarginBps:    z.number().int().min(10).max(10000).default(100),
  maintenanceMarginBps: z.number().int().min(5).max(5000).default(50),
  maxOILong:           z.string().min(1).default("1000000"),
  maxOIShort:          z.string().min(1).default("1000000"),
  initialLiquidity:    z.string().default("0"),
  description:         z.string().min(10).max(2000),
  projectName:         z.string().min(2).max(80),
  projectUrl:          z.string().url().optional(),
  logoUrl:             z.string().url().optional(),
});

const reviewSchema = z.object({ adminNote: z.string().optional() });

// POST /api/perps/submit
export async function submitPerps(req: AuthRequest, res: Response) {
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
  if (tx.value < PERPS_FEE_WEI)
    throw new AppError(400, `Payment must be at least ${env.QUEST_FEE_ETH} ETH`);

  const duplicate = await prisma.perpsSubmission.findFirst({ where: { paymentTxHash: body.paymentTxHash } });
  if (duplicate) throw new AppError(409, "Transaction already used for a submission");

  const submission = await prisma.perpsSubmission.create({
    data: {
      submitterAddress:     req.user!.address,
      paymentTxHash:        body.paymentTxHash,
      paymentChainId:       body.paymentChainId,
      feePaid:              env.QUEST_FEE_ETH,
      tokenAddress:         body.tokenAddress,
      tokenSymbol:          body.tokenSymbol,
      tokenName:            body.tokenName,
      quoteAsset:           body.quoteAsset,
      chainId:              body.chainId,
      oracleType:           body.oracleType,
      oracleAddress:        body.oracleAddress,
      maxLeverage:          body.maxLeverage,
      tradingFeeBps:        body.tradingFeeBps,
      liquidationFeeBps:    body.liquidationFeeBps,
      initialMarginBps:     body.initialMarginBps,
      maintenanceMarginBps: body.maintenanceMarginBps,
      maxOILong:            body.maxOILong,
      maxOIShort:           body.maxOIShort,
      initialLiquidity:     body.initialLiquidity,
      description:          body.description,
      projectName:          body.projectName,
      projectUrl:           body.projectUrl,
      logoUrl:              body.logoUrl,
    },
  });

  res.status(201).json({ id: submission.id, status: submission.status });
}

// GET /api/perps/submissions
export async function listPerpsSubmissions(req: Request, res: Response) {
  const { status } = req.query as { status?: string };
  const submissions = await prisma.perpsSubmission.findMany({
    where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : undefined,
    orderBy: { createdAt: "desc" },
  });
  res.json(submissions);
}

// GET /api/perps/submissions/mine
export async function myPerpsSubmissions(req: AuthRequest, res: Response) {
  const submissions = await prisma.perpsSubmission.findMany({
    where: { submitterAddress: req.user!.address },
    orderBy: { createdAt: "desc" },
    select: { id: true, projectName: true, tokenSymbol: true, maxLeverage: true, status: true, adminNote: true, createdAt: true },
  });
  res.json(submissions);
}

// POST /api/perps/submissions/:id/approve
export async function approvePerpsSubmission(req: AuthRequest, res: Response) {
  const id = String(req.params.id);
  const { adminNote } = reviewSchema.parse(req.body);

  const sub = await prisma.perpsSubmission.findUnique({ where: { id } });
  if (!sub) throw new AppError(404, "Submission not found");
  if (sub.status !== "PENDING") throw new AppError(409, "Already reviewed");

  await prisma.perpsSubmission.update({
    where: { id },
    data: { status: "APPROVED", adminNote, reviewedBy: req.user!.address, reviewedAt: new Date() },
  });

  res.json({ success: true });
}

// POST /api/perps/submissions/:id/reject
export async function rejectPerpsSubmission(req: AuthRequest, res: Response) {
  const id = String(req.params.id);
  const { adminNote } = reviewSchema.parse(req.body);

  const sub = await prisma.perpsSubmission.findUnique({ where: { id } });
  if (!sub) throw new AppError(404, "Submission not found");
  if (sub.status !== "PENDING") throw new AppError(409, "Already reviewed");

  await prisma.perpsSubmission.update({
    where: { id },
    data: { status: "REJECTED", adminNote, reviewedBy: req.user!.address, reviewedAt: new Date() },
  });

  res.json({ success: true });
}
