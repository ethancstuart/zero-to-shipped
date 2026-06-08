import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Redis-backed query cache with graceful degradation.
 *
 * If Upstash is not configured, the fetcher runs every time (no caching).
 * If a Redis read fails, the fetcher runs.
 * If a Redis write fails, the result is still returned.
 *
 * @param key Cache key (use a prefixed convention like `tools:list:v1`)
 * @param ttlSeconds Time-to-live in seconds
 * @param fetcher Function that produces the value when not cached
 */
export async function cachedQuery<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  if (!redis) return fetcher();

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) return cached;
  } catch {
    // Redis read failure — proceed to fetcher
  }

  const result = await fetcher();

  try {
    await redis.set(key, result, { ex: ttlSeconds });
  } catch {
    // Redis write failure — return result anyway
  }

  return result;
}

/**
 * Remove a key from the cache. No-op if Redis is not configured.
 */
export async function invalidateCache(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    // ignore
  }
}
