import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Supabase admin mock ────────────────────────────────────────────────
let processedEventsData: { id: string } | null = null;
let profileUpdateCalls: { tier: string; customerId?: string }[] = [];

const mockSupabaseAdmin = {
  from: vi.fn((table: string) => {
    if (table === "processed_events") {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(() => Promise.resolve({ data: processedEventsData })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
      };
    }
    if (table === "profiles") {
      return {
        select: vi.fn().mockReturnThis(),
        update: vi.fn((data: Record<string, unknown>) => {
          profileUpdateCalls.push({
            tier: data.subscription_tier as string,
            customerId: data.stripe_customer_id as string | undefined,
          });
          return {
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(() => Promise.resolve({ data: { display_name: "Test User" } })),
          };
        }),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: { display_name: "Test User" } })),
      };
    }
    if (table === "badges") {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(() => Promise.resolve({ data: null })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
      };
    }
    // Fallback
    return {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(() => Promise.resolve({ data: null })),
      single: vi.fn(() => Promise.resolve({ data: null })),
    };
  }),
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabaseAdmin),
}));

// ── Stripe mock ────────────────────────────────────────────────────────
let constructEventReturn: Record<string, unknown> = {};

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(() => ({
    webhooks: {
      constructEvent: vi.fn(() => constructEventReturn),
    },
    charges: {
      retrieve: vi.fn(() => Promise.resolve({ customer: "cus_refund_123" })),
    },
  })),
}));

// ── Sentry mock ────────────────────────────────────────────────────────
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

// ── Resend mock ────────────────────────────────────────────────────────
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn(() => Promise.resolve({ id: "email-123" })),
    },
  })),
}));

// ── Email tokens mock ──────────────────────────────────────────────────
vi.mock("@/lib/email/tokens", () => ({
  generateUnsubscribeToken: vi.fn(() => "mock-token"),
}));

// ── Import route handler (after mocks) ────────────────────────────────
import { POST } from "@/app/api/stripe/webhook/route";

// ── Helpers ────────────────────────────────────────────────────────────
function makeWebhookRequest(body = "{}") {
  return new NextRequest("http://localhost:3000/api/stripe/webhook", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": "sig_test_123",
    },
  });
}

// ── Tests ──────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  processedEventsData = null;
  profileUpdateCalls = [];
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  process.env.RESEND_API_KEY = "re_test";
  process.env.CRON_SECRET = "test-cron-secret";
});

describe("POST /api/stripe/webhook", () => {
  describe("idempotency", () => {
    it("skips duplicate events that were already processed", async () => {
      constructEventReturn = {
        id: "evt_duplicate",
        type: "checkout.session.completed",
        data: { object: { metadata: { user_id: "user-1" }, customer: "cus_1", customer_email: "a@b.com" } },
      };

      // Simulate event already in processed_events table
      processedEventsData = { id: "evt_duplicate" };

      const response = await POST(makeWebhookRequest());

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.received).toBe(true);

      // profiles.update should NOT have been called since the event was skipped
      expect(profileUpdateCalls).toHaveLength(0);
    });
  });

  describe("checkout.session.completed", () => {
    it("updates user tier to premium", async () => {
      constructEventReturn = {
        id: "evt_checkout_1",
        type: "checkout.session.completed",
        data: {
          object: {
            metadata: { user_id: "user-premium" },
            customer: "cus_stripe_123",
            customer_email: "user@test.com",
            discounts: [],
          },
        },
      };

      const response = await POST(makeWebhookRequest());

      expect(response.status).toBe(200);
      expect(profileUpdateCalls).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ tier: "premium" }),
        ])
      );
    });
  });

  describe("charge.refunded", () => {
    it("reverts user tier to free", async () => {
      constructEventReturn = {
        id: "evt_refund_1",
        type: "charge.refunded",
        data: {
          object: {
            customer: "cus_refunded_user",
          },
        },
      };

      const response = await POST(makeWebhookRequest());

      expect(response.status).toBe(200);
      expect(profileUpdateCalls).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ tier: "free" }),
        ])
      );
    });
  });

  describe("missing signature", () => {
    it("returns 400 when stripe-signature header is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/stripe/webhook", {
        method: "POST",
        body: "{}",
        headers: { "Content-Type": "application/json" },
        // No stripe-signature header
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Missing signature");
    });
  });
});
