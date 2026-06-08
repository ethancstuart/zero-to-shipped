import { describe, it, expect, beforeEach } from "vitest";

// Ensure UPSTASH_REDIS_REST_URL is not set before module import so that
// the limiters use the in-memory fallback for these tests.
delete process.env.UPSTASH_REDIS_REST_URL;

import {
  apiLimiter,
  assistantLimiter,
  authLimiter,
  rateLimit,
  rateLimitResponse,
  __resetInMemoryStoreForTests,
} from "../rate-limit";

describe("rate-limit (in-memory fallback)", () => {
  beforeEach(() => {
    __resetInMemoryStoreForTests();
  });

  describe("tier-based limiters", () => {
    it("apiLimiter allows requests under the limit", async () => {
      const result = await apiLimiter.limit("test-id-1");
      expect(result.success).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
      expect(result.limit).toBe(100);
    });

    it("authLimiter blocks requests over the limit (5/min)", async () => {
      const id = "test-auth-block";
      for (let i = 0; i < 5; i++) {
        const r = await authLimiter.limit(id);
        expect(r.success).toBe(true);
      }
      const result = await authLimiter.limit(id);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("uses different identifiers independently", async () => {
      for (let i = 0; i < 5; i++) {
        await authLimiter.limit("id-a");
      }
      const resultB = await authLimiter.limit("id-b");
      expect(resultB.success).toBe(true);
    });

    it("assistantLimiter has a 50/hour limit", async () => {
      const r = await assistantLimiter.limit("assistant-test");
      expect(r.limit).toBe(50);
      expect(r.success).toBe(true);
    });

    it("returns reset timestamp in the future", async () => {
      const before = Date.now();
      const r = await apiLimiter.limit("reset-test");
      expect(r.reset).toBeGreaterThanOrEqual(before);
    });

    it("decrements remaining across successive calls", async () => {
      const id = "decrement-test";
      const r1 = await apiLimiter.limit(id);
      const r2 = await apiLimiter.limit(id);
      expect(r2.remaining).toBeLessThan(r1.remaining);
    });

    it("isolates identifiers across tiers via prefixes", async () => {
      // Exhaust authLimiter for an id; apiLimiter for the same id should be unaffected.
      const id = "cross-tier";
      for (let i = 0; i < 5; i++) {
        await authLimiter.limit(id);
      }
      const overAuth = await authLimiter.limit(id);
      expect(overAuth.success).toBe(false);

      const apiResult = await apiLimiter.limit(id);
      expect(apiResult.success).toBe(true);
    });
  });

  describe("legacy rateLimit / rateLimitResponse", () => {
    it("rateLimit().check allows under the limit", () => {
      const limiter = rateLimit({ limit: 3, windowMs: 60_000 });
      const r1 = limiter.check("legacy-id-1");
      expect(r1.success).toBe(true);
      expect(r1.remaining).toBe(2);
    });

    it("rateLimit().check blocks over the limit", () => {
      const limiter = rateLimit({ limit: 2, windowMs: 60_000 });
      const id = "legacy-id-block";
      limiter.check(id);
      limiter.check(id);
      const blocked = limiter.check(id);
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
    });

    it("rateLimitResponse returns 429 with Retry-After", () => {
      const res = rateLimitResponse(60_000);
      expect(res.status).toBe(429);
      expect(res.headers.get("Retry-After")).toBe("60");
    });
  });
});
