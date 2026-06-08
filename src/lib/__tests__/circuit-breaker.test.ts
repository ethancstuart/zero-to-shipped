import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import { CircuitBreaker } from "../circuit-breaker";
import * as Sentry from "@sentry/nextjs";

describe("CircuitBreaker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(Sentry.captureException).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("executes function normally in closed state and returns result", async () => {
    const breaker = new CircuitBreaker({
      name: "test",
      failureThreshold: 3,
      cooldownMs: 1000,
    });
    const fn = vi.fn().mockResolvedValue("ok");
    const fallback = vi.fn().mockReturnValue("fallback");

    const result = await breaker.execute(fn, fallback);

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fallback).not.toHaveBeenCalled();
    expect(breaker.getState()).toBe("closed");
  });

  it("returns fallback on a single failure but stays closed below threshold", async () => {
    const breaker = new CircuitBreaker({
      name: "test",
      failureThreshold: 3,
      cooldownMs: 1000,
    });
    const fn = vi.fn().mockRejectedValue(new Error("nope"));
    const fallback = vi.fn().mockReturnValue("fallback");

    const result = await breaker.execute(fn, fallback);

    expect(result).toBe("fallback");
    expect(fallback).toHaveBeenCalledTimes(1);
    expect(breaker.getState()).toBe("closed");
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });

  it("opens circuit after reaching failure threshold and returns fallback without calling fn", async () => {
    const breaker = new CircuitBreaker({
      name: "test",
      failureThreshold: 3,
      cooldownMs: 1000,
    });
    const fn = vi.fn().mockRejectedValue(new Error("boom"));
    const fallback = vi.fn().mockReturnValue("fallback");

    await breaker.execute(fn, fallback);
    await breaker.execute(fn, fallback);
    await breaker.execute(fn, fallback);

    expect(breaker.getState()).toBe("open");
    expect(fn).toHaveBeenCalledTimes(3);

    // While open, fn should not be called
    const result = await breaker.execute(fn, fallback);
    expect(result).toBe("fallback");
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fallback).toHaveBeenCalledTimes(4);
  });

  it("transitions to half-open after cooldown expires", async () => {
    const breaker = new CircuitBreaker({
      name: "test",
      failureThreshold: 2,
      cooldownMs: 1000,
    });
    const failFn = vi.fn().mockRejectedValue(new Error("fail"));
    const okFn = vi.fn().mockResolvedValue("ok");
    const fallback = vi.fn().mockReturnValue("fallback");

    await breaker.execute(failFn, fallback);
    await breaker.execute(failFn, fallback);
    expect(breaker.getState()).toBe("open");

    // Advance past cooldown
    vi.advanceTimersByTime(1001);

    const result = await breaker.execute(okFn, fallback);
    expect(result).toBe("ok");
    // Successful half-open call closes the circuit
    expect(breaker.getState()).toBe("closed");
    expect(okFn).toHaveBeenCalledTimes(1);
  });

  it("reopens circuit on half-open failure", async () => {
    const breaker = new CircuitBreaker({
      name: "test",
      failureThreshold: 2,
      cooldownMs: 1000,
    });
    const failFn = vi.fn().mockRejectedValue(new Error("fail"));
    const fallback = vi.fn().mockReturnValue("fallback");

    await breaker.execute(failFn, fallback);
    await breaker.execute(failFn, fallback);
    expect(breaker.getState()).toBe("open");

    vi.advanceTimersByTime(1001);

    // Half-open attempt fails → should reopen (failures already >= threshold)
    await breaker.execute(failFn, fallback);
    expect(breaker.getState()).toBe("open");
  });

  it("does not call fn while open before cooldown", async () => {
    const breaker = new CircuitBreaker({
      name: "test",
      failureThreshold: 1,
      cooldownMs: 5000,
    });
    const failFn = vi.fn().mockRejectedValue(new Error("fail"));
    const fallback = vi.fn().mockReturnValue("fallback");

    await breaker.execute(failFn, fallback);
    expect(breaker.getState()).toBe("open");
    expect(failFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    await breaker.execute(failFn, fallback);
    expect(failFn).toHaveBeenCalledTimes(1); // still not called
    expect(fallback).toHaveBeenCalledTimes(2);
  });

  it("reset() clears state and failure count", async () => {
    const breaker = new CircuitBreaker({
      name: "test",
      failureThreshold: 2,
      cooldownMs: 1000,
    });
    const failFn = vi.fn().mockRejectedValue(new Error("fail"));
    const fallback = vi.fn().mockReturnValue("fallback");

    await breaker.execute(failFn, fallback);
    await breaker.execute(failFn, fallback);
    expect(breaker.getState()).toBe("open");

    breaker.reset();
    expect(breaker.getState()).toBe("closed");

    // After reset, fn should be called again
    const okFn = vi.fn().mockResolvedValue("ok");
    const result = await breaker.execute(okFn, fallback);
    expect(result).toBe("ok");
    expect(okFn).toHaveBeenCalledTimes(1);
  });

  it("captures exceptions to Sentry with circuit name tag", async () => {
    const breaker = new CircuitBreaker({
      name: "my-service",
      failureThreshold: 5,
      cooldownMs: 1000,
    });
    const err = new Error("nope");
    const fn = vi.fn().mockRejectedValue(err);
    const fallback = vi.fn().mockReturnValue("fallback");

    await breaker.execute(fn, fallback);

    expect(Sentry.captureException).toHaveBeenCalledWith(err, {
      tags: { circuit: "my-service" },
    });
  });

  it("different breaker instances are independent", async () => {
    const a = new CircuitBreaker({
      name: "a",
      failureThreshold: 1,
      cooldownMs: 1000,
    });
    const b = new CircuitBreaker({
      name: "b",
      failureThreshold: 1,
      cooldownMs: 1000,
    });
    const failFn = vi.fn().mockRejectedValue(new Error("fail"));
    const okFn = vi.fn().mockResolvedValue("ok");
    const fallback = vi.fn().mockReturnValue("fallback");

    await a.execute(failFn, fallback);
    expect(a.getState()).toBe("open");
    expect(b.getState()).toBe("closed");

    const result = await b.execute(okFn, fallback);
    expect(result).toBe("ok");
    expect(b.getState()).toBe("closed");
    expect(a.getState()).toBe("open");
  });

  it("resets failure count on success in closed state", async () => {
    const breaker = new CircuitBreaker({
      name: "test",
      failureThreshold: 3,
      cooldownMs: 1000,
    });
    const failFn = vi.fn().mockRejectedValue(new Error("fail"));
    const okFn = vi.fn().mockResolvedValue("ok");
    const fallback = vi.fn().mockReturnValue("fallback");

    await breaker.execute(failFn, fallback); // 1 failure
    await breaker.execute(failFn, fallback); // 2 failures
    await breaker.execute(okFn, fallback); // success → reset
    expect(breaker.getState()).toBe("closed");

    // Should now take 3 more failures to open
    await breaker.execute(failFn, fallback);
    await breaker.execute(failFn, fallback);
    expect(breaker.getState()).toBe("closed");
    await breaker.execute(failFn, fallback);
    expect(breaker.getState()).toBe("open");
  });
});
