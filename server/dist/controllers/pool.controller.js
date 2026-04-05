"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPools = listPools;
exports.getPool = getPool;
exports.upsertPool = upsertPool;
const db_1 = require("../config/db");
const redis_1 = require("../config/redis");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
// GET /api/pools?chainId=1
async function listPools(req, res) {
    const chainId = parseInt(req.query.chainId) || 4217;
    const cacheKey = redis_1.CacheKeys.pools(chainId);
    const cached = await (0, redis_1.cacheGet)(cacheKey);
    if (cached) {
        res.setHeader("X-Cache", "HIT");
        res.json(cached);
        return;
    }
    const pools = await db_1.prisma.pool.findMany({
        where: { chainId },
        orderBy: { tvlUSD: "desc" },
    });
    await (0, redis_1.cacheSet)(cacheKey, pools, env_1.env.CACHE_TTL_SHORT);
    res.json(pools);
}
// GET /api/pools/:address?chainId=1
async function getPool(req, res) {
    const chainId = parseInt(req.query.chainId) || 4217;
    const address = String(req.params.address).toLowerCase();
    const cacheKey = redis_1.CacheKeys.pool(address, chainId);
    const cached = await (0, redis_1.cacheGet)(cacheKey);
    if (cached) {
        res.setHeader("X-Cache", "HIT");
        res.json(cached);
        return;
    }
    const pool = await db_1.prisma.pool.findUnique({ where: { address_chainId: { address, chainId } } });
    if (!pool)
        throw new errorHandler_1.AppError(404, "Pool not found");
    await (0, redis_1.cacheSet)(cacheKey, pool, env_1.env.CACHE_TTL_SHORT);
    res.json(pool);
}
const upsertPoolSchema = zod_1.z.object({
    address: zod_1.z.string().length(42),
    chainId: zod_1.z.number(),
    token0: zod_1.z.string().length(42),
    token1: zod_1.z.string().length(42),
    token0Symbol: zod_1.z.string(),
    token1Symbol: zod_1.z.string(),
    feeTier: zod_1.z.string().optional(),
    reserve0: zod_1.z.string().optional(),
    reserve1: zod_1.z.string().optional(),
    tvlUSD: zod_1.z.number().optional(),
    volume24h: zod_1.z.number().optional(),
    apr: zod_1.z.number().optional(),
});
// POST /api/pools  (internal/admin use)
async function upsertPool(req, res) {
    const data = upsertPoolSchema.parse(req.body);
    const pool = await db_1.prisma.pool.upsert({
        where: { address_chainId: { address: data.address.toLowerCase(), chainId: data.chainId } },
        create: { ...data, address: data.address.toLowerCase() },
        update: { ...data, address: data.address.toLowerCase() },
    });
    res.json(pool);
}
//# sourceMappingURL=pool.controller.js.map