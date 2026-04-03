import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Supabase mock ──────────────────────────────────────────────────────
const mockUser = { id: "user-123", email: "test@example.com" };
let authReturn: { data: { user: typeof mockUser | null } } = {
  data: { user: mockUser },
};
let profileReturn: { data: { subscription_tier: string } | null } = {
  data: { subscription_tier: "free" },
};

const mockSupabase = {
  auth: {
    getUser: vi.fn(() => Promise.resolve(authReturn)),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve(profileReturn)),
  })),
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// ── Stripe mock ────────────────────────────────────────────────────────
vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(() => ({
    checkout: {
      sessions: {
        create: vi.fn(() =>
          Promise.resolve({ url: "https://checkout.stripe.com/test" })
        ),
      },
    },
    coupons: {
      retrieve: vi.fn(() => Promise.resolve({ valid: false })),
    },
  })),
}));

// ── Sentry mock ────────────────────────────────────────────────────────
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

// ── Rate limiter mock ──────────────────────────────────────────────────
let rateLimitSuccess = true;
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({
    check: vi.fn(() => ({ success: rateLimitSuccess, remaining: rateLimitSuccess ? 4 : 0 })),
  })),
  rateLimitResponse: vi.fn(
    () =>
      new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { "Retry-After": "60", "Content-Type": "application/json" },
      })
  ),
}));

// ── Import route handler (after mocks) ────────────────────────────────
import { POST } from "@/app/api/stripe/checkout/route";

// ── Helpers ────────────────────────────────────────────────────────────
function makeRequest(body: Record<string, unknown> = { tier: "full_access" }) {
  return new NextRequest("http://localhost:3000/api/stripe/checkout", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

// ── Tests ──────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  authReturn = { data: { user: mockUser } };
  profileReturn = { data: { subscription_tier: "free" } };
  rateLimitSuccess = true;
  process.env.STRIPE_PRICE_FULL_ACCESS = "price_test_123";
  process.env.STRIPE_PRICE_EXTRAS = "price_extras_456";
});

describe("POST /api/stripe/checkout", () => {
  it("returns 401 if not authenticated", async () => {
    authReturn = { data: { user: null } };

    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 if user already has premium (double-purchase guard)", async () => {
    profileReturn = { data: { subscription_tier: "premium" } };

    const response = await POST(makeRequest());

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("You already have premium access");
  });

  it("returns 429 if rate limited", async () => {
    rateLimitSuccess = false;

    const response = await POST(makeRequest());

    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toBe("Too many requests");
  });

  it("returns 400 for invalid tier", async () => {
    const response = await POST(makeRequest({ tier: "nonexistent" }));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Invalid tier");
  });

  it("returns checkout URL for valid request", async () => {
    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.url).toBe("https://checkout.stripe.com/test");
  });
});
