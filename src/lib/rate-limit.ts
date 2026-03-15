import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store — resets on cold start, but sufficient for single-instance protection.
// For multi-instance production, swap to Upstash Redis or Vercel KV.
const store = new Map<string, RateLimitEntry>();

export function rateLimit(options: {
  limit: number;
  windowMs: number;
}) {
  return {
    check(key: string): { success: boolean; remaining: number } {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + options.windowMs });
        return { success: true, remaining: options.limit - 1 };
      }

      if (entry.count >= options.limit) {
        return { success: false, remaining: 0 };
      }

      entry.count++;
      return { success: true, remaining: options.limit - entry.count };
    },
  };
}

export function rateLimitResponse(retryAfterMs: number) {
  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
    }
  );
}
