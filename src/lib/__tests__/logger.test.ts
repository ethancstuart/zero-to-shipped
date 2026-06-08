import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { log } from "../logger";

describe("logger", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("outputs JSON to console.log for info", () => {
    log("info", "hello");
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();
    const arg = logSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(arg);
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("hello");
  });

  it("outputs JSON to console.log for warn", () => {
    log("warn", "careful");
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();
    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(parsed.level).toBe("warn");
    expect(parsed.message).toBe("careful");
  });

  it("outputs JSON to console.error for error", () => {
    log("error", "boom");
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).not.toHaveBeenCalled();
    const parsed = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(parsed.level).toBe("error");
    expect(parsed.message).toBe("boom");
  });

  it("includes level, message, and ISO 8601 timestamp", () => {
    log("info", "msg");
    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(parsed).toHaveProperty("level", "info");
    expect(parsed).toHaveProperty("message", "msg");
    expect(parsed).toHaveProperty("timestamp");
    // ISO 8601 format: 2024-01-01T00:00:00.000Z
    expect(parsed.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
    // Should parse as a valid date
    expect(Number.isNaN(new Date(parsed.timestamp).getTime())).toBe(false);
  });

  it("includes context fields when provided", () => {
    log("info", "with context", {
      requestId: "req_123",
      userId: "user_abc",
      route: "/api/v1/tools",
      duration_ms: 42,
      custom: "value",
    });
    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(parsed.requestId).toBe("req_123");
    expect(parsed.userId).toBe("user_abc");
    expect(parsed.route).toBe("/api/v1/tools");
    expect(parsed.duration_ms).toBe(42);
    expect(parsed.custom).toBe("value");
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("with context");
  });

  it("works without context", () => {
    log("info", "no context");
    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(Object.keys(parsed).sort()).toEqual(
      ["level", "message", "timestamp"].sort(),
    );
  });
});
