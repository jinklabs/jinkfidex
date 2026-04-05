import Redis from "ioredis";
import { env } from "./env";

let redis: Redis;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy: (times) => {
        // Stop retrying after 3 attempts; log only once
        if (times >= 3) return null;
        return Math.min(times * 500, 2000);
      },
    });

    let _redisErrLogged = false;
    redis.on("connect", () => console.log("✅ Redis connected"));
    redis.on("error", (err) => {
      if (!_redisErrLogged) {
        console.warn("⚠️  Redis unavailable:", err.message);
        _redisErrLogged = true;
      }
    });
  }
  return redis;
}

export async function connectRedis() {
  const r = getRedis();
  await r.connect();
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await getRedis().get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await getRedis().setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    console.error("Cache set error:", err);
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await getRedis().del(key);
  } catch (err) {
    console.error("Cache del error:", err);
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const keys = await getRedis().keys(pattern);
    if (keys.length > 0) await getRedis().del(...keys);
  } catch (err) {
    console.error("Cache del pattern error:", err);
  }
}

// ── Cache key factory ─────────────────────────────────────────────────────────
export const CacheKeys = {
  quests: (chainId?: number) => `quests:${chainId ?? "all"}`,
  quest: (id: string) => `quest:${id}`,
  questLeaderboard: (id: string) => `quest:${id}:leaderboard`,
  pools: (chainId: number) => `pools:${chainId}`,
  pool: (address: string, chainId: number) => `pool:${chainId}:${address}`,
  farms: (chainId: number) => `farms:${chainId}`,
  locks: (owner: string) => `locks:${owner}`,
  userProfile: (address: string) => `user:${address}`,
  nonce: (address: string) => `nonce:${address}`,
};
