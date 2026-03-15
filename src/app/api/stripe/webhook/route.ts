import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.user_id;

      if (userId) {
        await supabase
          .from("profiles")
          .update({
            subscription_tier: "premium",
            stripe_customer_id: session.customer as string,
          })
          .eq("id", userId);
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      const customerId = charge.customer as string | null;

      if (customerId) {
        await supabase
          .from("profiles")
          .update({ subscription_tier: "free" })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }

    case "charge.dispute.created": {
      const dispute = event.data.object;
      const charge = dispute.charge;

      if (typeof charge === "string") {
        // Fetch the charge to get the customer ID
        const chargeObj = await getStripe().charges.retrieve(charge);
        const customerId = chargeObj.customer as string | null;

        if (customerId) {
          await supabase
            .from("profiles")
            .update({ subscription_tier: "free" })
            .eq("stripe_customer_id", customerId);
        }
      }
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
