"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.longCache = exports.mediumCache = exports.shortCache = void 0;
exports.withCache = withCache;
const redis_1 = require("../config/redis");
const env_1 = require("../config/env");
function withCache(keyFn, ttl) {
    return async (req, res, next) => {
        const key = keyFn(req);
        const cached = await (0, redis_1.cacheGet)(key);
        if (cached) {
            res.setHeader("X-Cache", "HIT");
            res.json(cached);
            return;
        }
        // Monkey-patch res.json to intercept and cache
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode === 200) {
                (0, redis_1.cacheSet)(key, body, ttl).catch(() => { });
            }
            res.setHeader("X-Cache", "MISS");
            return originalJson(body);
        };
        next();
    };
}
const shortCache = (keyFn) => withCache(keyFn, env_1.env.CACHE_TTL_SHORT);
exports.shortCache = shortCache;
const mediumCache = (keyFn) => withCache(keyFn, env_1.env.CACHE_TTL_MEDIUM);
exports.mediumCache = mediumCache;
const longCache = (keyFn) => withCache(keyFn, env_1.env.CACHE_TTL_LONG);
exports.longCache = longCache;
//# sourceMappingURL=cache.js.map