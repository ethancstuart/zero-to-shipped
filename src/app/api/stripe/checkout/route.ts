import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const limiter = rateLimit({ limit: 5, windowMs: 60_000 });

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = limiter.check(`checkout:${user.id}`);
    if (!success) return rateLimitResponse(60_000);

    const { tier } = await request.json();

    const priceMap: Record<string, string | undefined> = {
      full_access: process.env.STRIPE_PRICE_FULL_ACCESS,
      extras: process.env.STRIPE_PRICE_EXTRAS,
    };

    const priceId = priceMap[tier];

    if (!priceId) {
      return NextResponse.json(
        { error: `Invalid tier or missing price config for: ${tier}` },
        { status: 400 }
      );
    }

    // Auto-apply founding member coupon if available and tier is full_access
    const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    const foundingCouponId = process.env.STRIPE_COUPON_FOUNDING;

    if (tier === "full_access" && foundingCouponId) {
      try {
        const coupon = await getStripe().coupons.retrieve(foundingCouponId);
        const underLimit =
          !coupon.max_redemptions ||
          (coupon.times_redeemed ?? 0) < coupon.max_redemptions;
        if (coupon.valid && underLimit) {
          discounts.push({ coupon: foundingCouponId });
        }
      } catch {
        // Coupon not found or expired — proceed without discount
      }
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      ...(discounts.length > 0 && { discounts }),
      customer_email: user.email,
      automatic_tax: { enabled: true },
      payment_intent_data: { receipt_email: user.email },
      metadata: { user_id: user.id },
      success_url: `${request.nextUrl.origin}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/pricing`,
    });

    // Analytics: checkout_start tracked client-side when redirect happens
    return NextResponse.json({ url: session.url });
  } catch (err) {
    Sentry.captureException(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
