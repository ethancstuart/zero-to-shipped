import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

const PRICE_MAP: Record<string, string | undefined> = {
  full_access: process.env.STRIPE_PRICE_FULL_ACCESS,
  extras: process.env.STRIPE_PRICE_EXTRAS,
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tier } = await request.json();
  const priceId = PRICE_MAP[tier];

  if (!priceId) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
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
}
