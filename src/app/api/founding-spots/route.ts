import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const revalidate = 60; // ISR: cache for 60 seconds

export async function GET() {
  try {
    const couponId = process.env.STRIPE_COUPON_FOUNDING;
    if (!couponId) {
      return NextResponse.json(
        { error: "Founding coupon not configured" },
        { status: 500 }
      );
    }

    const coupon = await getStripe().coupons.retrieve(couponId);

    // max_redemptions is total spots, times_redeemed is how many used
    const total = coupon.max_redemptions ?? 100;
    const used = coupon.times_redeemed ?? 0;
    const remaining = Math.max(0, total - used);

    return NextResponse.json({
      remaining,
      total,
      deadline: "2026-04-15",
    });
  } catch (err) {
    console.error("Failed to fetch founding spots:", err);
    return NextResponse.json(
      { error: "Failed to fetch founding spots" },
      { status: 500 }
    );
  }
}
