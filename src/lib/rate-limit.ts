import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── In-memory fallback (preserves prior behavior for dev/single-instance) ──
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const inMemoryStore = new Map<string, RateLimitEntry>();

interface LimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

function inMemoryCheck(
  key: string,
  limit: number,
  windowMs: number,
): LimitResult {
  const now = Date.now();
  const entry = inMemoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      remaining: limit - 1,
      reset: now + windowMs,
      limit,
    };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, reset: entry.resetAt, limit };
  }

  entry.count++;
  return {
    success: true,
    remaining: limit - entry.count,
    reset: entry.resetAt,
    limit,
  };
}

// ── Redis client (only constructed if env vars present) ──
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

let fallbackWarned = false;
function warnFallbackOnce() {
  if (!redis && !fallbackWarned) {
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL not set — using in-memory fallback (dev mode only)",
    );
    fallbackWarned = true;
  }
}

interface TierLimiter {
  limit: (identifier: string) => Promise<LimitResult>;
}

function createLimiter(
  limit: number,
  window: "1 m" | "1 h",
  windowMs: number,
  prefix: string,
): TierLimiter {
  if (!redis) {
    warnFallbackOnce();
    return {
      limit: async (identifier: string) =>
        inMemoryCheck(`${prefix}:${identifier}`, limit, windowMs),
    };
  }

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
    prefix,
  });

  return {
    limit: async (identifier: string) => {
      try {
        const result = await ratelimit.limit(identifier);
        return {
          success: result.success,
          remaining: result.remaining,
          reset: result.reset,
          limit,
        };
      } catch {
        // Redis call failed — fall back to in-memory to keep the route alive.
        return inMemoryCheck(`${prefix}:${identifier}`, limit, windowMs);
      }
    },
  };
}

// ── Tier-based limiters ──
export const apiLimiter = createLimiter(100, "1 h", 60 * 60 * 1000, "api");
export const assistantLimiter = createLimiter(
  50,
  "1 h",
  60 * 60 * 1000,
  "assistant",
);
export const authLimiter = createLimiter(5, "1 m", 60 * 1000, "auth");

// ── Legacy API preserved for existing callers ──
// `rateLimit({ limit, windowMs }).check(key)` and `rateLimitResponse(...)`
// are used by src/app/api/referral-invite/route.ts and likely others.
export function rateLimit(options: { limit: number; windowMs: number }) {
  return {
    check(key: string): { success: boolean; remaining: number } {
      const result = inMemoryCheck(
        `legacy:${key}`,
        options.limit,
        options.windowMs,
      );
      return { success: result.success, remaining: result.remaining };
    },
  };
}

export function rateLimitResponse(retryAfterMs: number) {
  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
    },
  );
}

// ── Test-only helper: reset in-memory store ──
export function __resetInMemoryStoreForTests() {
  inMemoryStore.clear();
}
