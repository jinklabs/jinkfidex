import { Request, Response } from "express";
import { prisma } from "../config/db";
import { cacheGet, cacheSet, CacheKeys } from "../config/redis";
import { env } from "../config/env";

// GET /api/farms?chainId=1
export async function listFarms(req: Request, res: Response) {
  const chainId = parseInt(req.query.chainId as string) || 4217;
  const cacheKey = CacheKeys.farms(chainId);

  const cached = await cacheGet(cacheKey);
  if (cached) { res.setHeader("X-Cache", "HIT"); res.json(cached); return; }

  const farms = await prisma.farm.findMany({
    where: { chainId, active: true },
    orderBy: { aprPercent: "desc" },
  });

  await cacheSet(cacheKey, farms, env.CACHE_TTL_MEDIUM);
  res.json(farms);
}
