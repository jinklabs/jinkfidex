"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLocks = listLocks;
exports.getLock = getLock;
exports.createLock = createLock;
exports.markWithdrawn = markWithdrawn;
const db_1 = require("../config/db");
const redis_1 = require("../config/redis");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
// GET /api/locks?owner=0x...&type=token|lp&chainId=1
async function listLocks(req, res) {
    const { owner, type, chainId } = req.query;
    if (owner) {
        const cacheKey = redis_1.CacheKeys.locks(owner);
        const cached = await (0, redis_1.cacheGet)(cacheKey);
        if (cached) {
            res.setHeader("X-Cache", "HIT");
            res.json(cached);
            return;
        }
        const locks = await db_1.prisma.lock.findMany({
            where: {
                owner: owner.toLowerCase(),
                ...(type && { lockType: type }),
                ...(chainId && { chainId: parseInt(chainId) }),
            },
            orderBy: { createdAt: "desc" },
        });
        await (0, redis_1.cacheSet)(cacheKey, locks, env_1.env.CACHE_TTL_SHORT);
        res.json(locks);
        return;
    }
    const locks = await db_1.prisma.lock.findMany({
        where: {
            ...(type && { lockType: type }),
            ...(chainId && { chainId: parseInt(chainId) }),
        },
        orderBy: { createdAt: "desc" },
        take: 100,
    });
    res.json(locks);
}
// GET /api/locks/:id
async function getLock(req, res) {
    const lock = await db_1.prisma.lock.findUnique({ where: { id: String(req.params.id) } });
    if (!lock)
        throw new errorHandler_1.AppError(404, "Lock not found");
    res.json(lock);
}
const createLockSchema = zod_1.z.object({
    lockType: zod_1.z.enum(["token", "lp"]),
    onChainId: zod_1.z.number().optional(),
    tokenAddress: zod_1.z.string().length(42),
    tokenSymbol: zod_1.z.string().optional(),
    token0Symbol: zod_1.z.string().optional(),
    token1Symbol: zod_1.z.string().optional(),
    amount: zod_1.z.string(),
    owner: zod_1.z.string().length(42),
    unlockDate: zod_1.z.string().datetime(),
    txHash: zod_1.z.string().optional(),
    chainId: zod_1.z.number(),
});
// POST /api/locks  (auth required)
async function createLock(req, res) {
    const data = createLockSchema.parse(req.body);
    const lock = await db_1.prisma.lock.create({
        data: {
            ...data,
            tokenAddress: data.tokenAddress.toLowerCase(),
            owner: data.owner.toLowerCase(),
            userId: req.user.id,
        },
    });
    await (0, redis_1.cacheDel)(redis_1.CacheKeys.locks(data.owner.toLowerCase()));
    res.status(201).json(lock);
}
// PATCH /api/locks/:id/withdraw  (auth required)
async function markWithdrawn(req, res) {
    const id = String(req.params.id);
    const lock = await db_1.prisma.lock.findUnique({ where: { id } });
    if (!lock)
        throw new errorHandler_1.AppError(404, "Lock not found");
    if (lock.owner !== req.user.address)
        throw new errorHandler_1.AppError(403, "Not the lock owner");
    if (lock.withdrawn)
        throw new errorHandler_1.AppError(409, "Already withdrawn");
    if (new Date() < lock.unlockDate)
        throw new errorHandler_1.AppError(400, "Lock has not expired yet");
    const updated = await db_1.prisma.lock.update({
        where: { id },
        data: { withdrawn: true, withdrawnAt: new Date() },
    });
    await (0, redis_1.cacheDel)(redis_1.CacheKeys.locks(req.user.address));
    res.json(updated);
}
//# sourceMappingURL=lock.controller.js.map