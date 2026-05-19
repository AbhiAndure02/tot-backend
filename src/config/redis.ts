import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const CACHE_DISABLED = process.env.REDIS_DISABLED === "true";

export const redisClient = createClient({
    url: REDIS_URL,
    socket: {
        connectTimeout: 1000,
        reconnectStrategy: false,
    },
});

let isReady = false;

redisClient.on("ready", () => {
    isReady = true;
    console.log("Redis connected");
});

redisClient.on("end", () => {
    isReady = false;
});

redisClient.on("error", (err) => {
    isReady = false;
    const message = err.message || "Redis unavailable";
    console.error("Redis error:", message);
});

export const connectRedis = async (): Promise<void> => {
    if (CACHE_DISABLED || redisClient.isOpen) return;

    try {
        await redisClient.connect();
    } catch (err) {
        isReady = false;
        const message = err instanceof Error && err.message ? err.message : "Redis unavailable";
        console.error("Redis connection failed:", message);
    }
};

export const getCachedJson = async <T>(key: string): Promise<T | null> => {
    if (CACHE_DISABLED || !isReady) return null;

    try {
        const cached = await redisClient.get(key);
        return cached ? (JSON.parse(cached) as T) : null;
    } catch {
        return null;
    }
};

export const setCachedJson = async (
    key: string,
    value: unknown,
    ttlSeconds: number
): Promise<void> => {
    if (CACHE_DISABLED || !isReady) return;

    try {
        await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch {
        // Cache writes should never break API requests.
    }
};

export const deleteCacheKeys = async (...keys: string[]): Promise<void> => {
    if (CACHE_DISABLED || !isReady || keys.length === 0) return;

    try {
        await redisClient.del(keys);
    } catch {
        // Cache invalidation is best-effort.
    }
};

export const deleteCacheByPattern = async (pattern: string): Promise<void> => {
    if (CACHE_DISABLED || !isReady) return;

    try {
        for await (const keys of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
            const batch = Array.isArray(keys) ? keys : [keys];
            if (batch.length > 0) await redisClient.del(batch);
        }
    } catch {
        // Pattern invalidation is best-effort.
    }
};
