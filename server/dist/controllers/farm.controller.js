"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFarms = listFarms;
const db_1 = require("../config/db");
const redis_1 = require("../config/redis");
const env_1 = require("../config/env");
// GET /api/farms?chainId=1
async function listFarms(req, res) {
    const chainId = parseInt(req.query.chainId) || 4217;
    const cacheKey = redis_1.CacheKeys.farms(chainId);
    const cached = await (0, redis_1.cacheGet)(cacheKey);
    if (cached) {
        res.setHeader("X-Cache", "HIT");
        res.json(cached);
        return;
    }
    const farms = await db_1.prisma.farm.findMany({
        where: { chainId, active: true },
        orderBy: { aprPercent: "desc" },
    });
    await (0, redis_1.cacheSet)(cacheKey, farms, env_1.env.CACHE_TTL_MEDIUM);
    res.json(farms);
}
//# sourceMappingURL=farm.controller.js.map