import { describe, it, expect } from "vitest";

describe("security headers", () => {
  it("next.config exports a headers function", async () => {
    const config = await import("../../next.config");
    expect(typeof config.default.headers).toBe("function");
  });

  it("headers function returns expected security headers", async () => {
    const config = await import("../../next.config");
    const headers = await config.default.headers!();
    const root = headers.find((h) => h.source === "/(.*)");
    expect(root).toBeDefined();
    const headerKeys = root!.headers.map((h) => h.key);
    expect(headerKeys).toContain("X-Content-Type-Options");
    expect(headerKeys).toContain("X-Frame-Options");
    expect(headerKeys).toContain("Referrer-Policy");
    expect(headerKeys).toContain("Permissions-Policy");
    expect(headerKeys).toContain("Strict-Transport-Security");
    expect(headerKeys).toContain("Content-Security-Policy-Report-Only");
  });

  it("CSP includes report-uri", async () => {
    const config = await import("../../next.config");
    const headers = await config.default.headers!();
    const root = headers.find((h) => h.source === "/(.*)")!;
    const csp = root.headers.find(
      (h) => h.key === "Content-Security-Policy-Report-Only",
    )!;
    expect(csp.value).toContain("report-uri /api/csp-report");
  });
});
