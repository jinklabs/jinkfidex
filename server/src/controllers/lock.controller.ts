import { Request, Response } from "express";
import { prisma } from "../config/db";
import { cacheGet, cacheSet, cacheDel, CacheKeys } from "../config/redis";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

// GET /api/locks?owner=0x...&type=token|lp&chainId=1
export async function listLocks(req: Request, res: Response) {
  const { owner, type, chainId } = req.query;

  if (owner) {
    const cacheKey = CacheKeys.locks(owner as string);
    const cached = await cacheGet(cacheKey);
    if (cached) { res.setHeader("X-Cache", "HIT"); res.json(cached); return; }

    const locks = await prisma.lock.findMany({
      where: {
        owner: (owner as string).toLowerCase(),
        ...(type && { lockType: type as string }),
        ...(chainId && { chainId: parseInt(chainId as string) }),
      },
      orderBy: { createdAt: "desc" },
    });

    await cacheSet(cacheKey, locks, env.CACHE_TTL_SHORT);
    res.json(locks);
    return;
  }

  const locks = await prisma.lock.findMany({
    where: {
      ...(type && { lockType: type as string }),
      ...(chainId && { chainId: parseInt(chainId as string) }),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  res.json(locks);
}

// GET /api/locks/:id
export async function getLock(req: Request, res: Response) {
  const lock = await prisma.lock.findUnique({ where: { id: String(req.params.id) } });
  if (!lock) throw new AppError(404, "Lock not found");
  res.json(lock);
}

const createLockSchema = z.object({
  lockType: z.enum(["token", "lp"]),
  onChainId: z.number().optional(),
  tokenAddress: z.string().length(42),
  tokenSymbol: z.string().optional(),
  token0Symbol: z.string().optional(),
  token1Symbol: z.string().optional(),
  amount: z.string(),
  owner: z.string().length(42),
  unlockDate: z.string().datetime(),
  txHash: z.string().optional(),
  chainId: z.number(),
});

// POST /api/locks  (auth required)
export async function createLock(req: AuthRequest, res: Response) {
  const data = createLockSchema.parse(req.body);

  const lock = await prisma.lock.create({
    data: {
      ...data,
      tokenAddress: data.tokenAddress.toLowerCase(),
      owner: data.owner.toLowerCase(),
      userId: req.user!.id,
    },
  });

  await cacheDel(CacheKeys.locks(data.owner.toLowerCase()));
  res.status(201).json(lock);
}

// PATCH /api/locks/:id/withdraw  (auth required)
export async function markWithdrawn(req: AuthRequest, res: Response) {
  const id = String(req.params.id);
  const lock = await prisma.lock.findUnique({ where: { id } });
  if (!lock) throw new AppError(404, "Lock not found");
  if (lock.owner !== req.user!.address) throw new AppError(403, "Not the lock owner");
  if (lock.withdrawn) throw new AppError(409, "Already withdrawn");
  if (new Date() < lock.unlockDate) throw new AppError(400, "Lock has not expired yet");

  const updated = await prisma.lock.update({
    where: { id },
    data: { withdrawn: true, withdrawnAt: new Date() },
  });

  await cacheDel(CacheKeys.locks(req.user!.address));
  res.json(updated);
}
