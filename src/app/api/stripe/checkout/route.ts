import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      automatic_tax: { enabled: true },
      metadata: { user_id: user.id },
      success_url: `${request.nextUrl.origin}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
