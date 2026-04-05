"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheKeys = void 0;
exports.getRedis = getRedis;
exports.connectRedis = connectRedis;
exports.cacheGet = cacheGet;
exports.cacheSet = cacheSet;
exports.cacheDel = cacheDel;
exports.cacheDelPattern = cacheDelPattern;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
let redis;
function getRedis() {
    if (!redis) {
        redis = new ioredis_1.default(env_1.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: true,
        });
        redis.on("connect", () => console.log("✅ Redis connected"));
        redis.on("error", (err) => console.error("❌ Redis error:", err.message));
        redis.on("reconnecting", () => console.log("🔄 Redis reconnecting..."));
    }
    return redis;
}
async function connectRedis() {
    const r = getRedis();
    await r.connect();
}
// ── Cache helpers ─────────────────────────────────────────────────────────────
async function cacheGet(key) {
    try {
        const data = await getRedis().get(key);
        return data ? JSON.parse(data) : null;
    }
    catch {
        return null;
    }
}
async function cacheSet(key, value, ttlSeconds) {
    try {
        await getRedis().setex(key, ttlSeconds, JSON.stringify(value));
    }
    catch (err) {
        console.error("Cache set error:", err);
    }
}
async function cacheDel(key) {
    try {
        await getRedis().del(key);
    }
    catch (err) {
        console.error("Cache del error:", err);
    }
}
async function cacheDelPattern(pattern) {
    try {
        const keys = await getRedis().keys(pattern);
        if (keys.length > 0)
            await getRedis().del(...keys);
    }
    catch (err) {
        console.error("Cache del pattern error:", err);
    }
}
// ── Cache key factory ─────────────────────────────────────────────────────────
exports.CacheKeys = {
    quests: (chainId) => `quests:${chainId ?? "all"}`,
    quest: (id) => `quest:${id}`,
    questLeaderboard: (id) => `quest:${id}:leaderboard`,
    pools: (chainId) => `pools:${chainId}`,
    pool: (address, chainId) => `pool:${chainId}:${address}`,
    farms: (chainId) => `farms:${chainId}`,
    locks: (owner) => `locks:${owner}`,
    userProfile: (address) => `user:${address}`,
    nonce: (address) => `nonce:${address}`,
};
//# sourceMappingURL=redis.js.map