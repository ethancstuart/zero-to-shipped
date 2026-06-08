import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/content/loader", () => ({
  listContentByPillar: vi.fn(),
}));

describe("GET /api/health", () => {
  it("returns healthy when all checks pass", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const { listContentByPillar } = await import("@/lib/content/loader");

    vi.mocked(createClient).mockResolvedValue({
      from: () => ({
        select: () => ({ limit: () => Promise.resolve({ error: null }) }),
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    vi.mocked(listContentByPillar).mockResolvedValue([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { slug: "test" } as any,
    ]);

    process.env.NEXT_PUBLIC_SUPABASE_URL = "x";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "x";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "x";
    process.env.ANTHROPIC_API_KEY = "x";
    process.env.GEMINI_API_KEY = "x";
    process.env.CRON_SECRET = "x";

    const { GET } = await import("../route");
    const response = await GET();
    const body = await response.json();

    expect(body.status).toMatch(/healthy|degraded/);
    expect(body.checks).toHaveProperty("supabase");
    expect(body.checks).toHaveProperty("content");
    expect(body.checks).toHaveProperty("env");
    expect(body.circuits).toHaveProperty("supabase");
  });
});
