import Redis from "ioredis";
export declare function getRedis(): Redis;
export declare function connectRedis(): Promise<void>;
export declare function cacheGet<T>(key: string): Promise<T | null>;
export declare function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void>;
export declare function cacheDel(key: string): Promise<void>;
export declare function cacheDelPattern(pattern: string): Promise<void>;
export declare const CacheKeys: {
    quests: (chainId?: number) => string;
    quest: (id: string) => string;
    questLeaderboard: (id: string) => string;
    pools: (chainId: number) => string;
    pool: (address: string, chainId: number) => string;
    farms: (chainId: number) => string;
    locks: (owner: string) => string;
    userProfile: (address: string) => string;
    nonce: (address: string) => string;
};
//# sourceMappingURL=redis.d.ts.map