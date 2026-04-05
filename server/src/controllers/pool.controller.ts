import { Request, Response } from "express";
import { prisma } from "../config/db";
import { cacheGet, cacheSet, CacheKeys } from "../config/redis";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

// GET /api/pools?chainId=1
export async function listPools(req: Request, res: Response) {
  const chainId = parseInt(req.query.chainId as string) || 4217;
  const cacheKey = CacheKeys.pools(chainId);

  const cached = await cacheGet(cacheKey);
  if (cached) { res.setHeader("X-Cache", "HIT"); res.json(cached); return; }

  const pools = await prisma.pool.findMany({
    where: { chainId },
    orderBy: { tvlUSD: "desc" },
  });

  await cacheSet(cacheKey, pools, env.CACHE_TTL_SHORT);
  res.json(pools);
}

// GET /api/pools/:address?chainId=1
export async function getPool(req: Request, res: Response) {
  const chainId = parseInt(req.query.chainId as string) || 4217;
  const address = String(req.params.address).toLowerCase();
  const cacheKey = CacheKeys.pool(address, chainId);

  const cached = await cacheGet(cacheKey);
  if (cached) { res.setHeader("X-Cache", "HIT"); res.json(cached); return; }

  const pool = await prisma.pool.findUnique({ where: { address_chainId: { address, chainId } } });
  if (!pool) throw new AppError(404, "Pool not found");

  await cacheSet(cacheKey, pool, env.CACHE_TTL_SHORT);
  res.json(pool);
}

const upsertPoolSchema = z.object({
  address: z.string().length(42),
  chainId: z.number(),
  token0: z.string().length(42),
  token1: z.string().length(42),
  token0Symbol: z.string(),
  token1Symbol: z.string(),
  feeTier: z.string().optional(),
  reserve0: z.string().optional(),
  reserve1: z.string().optional(),
  tvlUSD: z.number().optional(),
  volume24h: z.number().optional(),
  apr: z.number().optional(),
});

// POST /api/pools  (internal/admin use)
export async function upsertPool(req: Request, res: Response) {
  const data = upsertPoolSchema.parse(req.body);

  const pool = await prisma.pool.upsert({
    where: { address_chainId: { address: data.address.toLowerCase(), chainId: data.chainId } },
    create: { ...data, address: data.address.toLowerCase() },
    update: { ...data, address: data.address.toLowerCase() },
  });

  res.json(pool);
}
