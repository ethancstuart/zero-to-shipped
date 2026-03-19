import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateUnsubscribeToken } from "@/lib/email/tokens";

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
    Sentry.captureException(err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Idempotency: skip already-processed events (Stripe retries duplicates)
  const { data: existing } = await supabase
    .from("processed_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true });
  }

  await supabase
    .from("processed_events")
    .insert({ id: event.id, event_type: event.type });

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

        // Send purchase confirmation email
        try {
          const { data: buyer } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", userId)
            .single();

          const name = buyer?.display_name?.split(" ")[0] ?? "there";
          const resend = new Resend(process.env.RESEND_API_KEY);
          const unsubToken = generateUnsubscribeToken(userId);

          await resend.emails.send({
            from: "Zero to Ship <hello@zerotoship.app>",
            to: session.customer_email!,
            subject: "Welcome to Full Access — Zero to Ship",
            html: `
              <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
                <p>Hey ${name},</p>
                <p>You now have <strong>Full Access</strong> to Zero to Ship. Here's what's unlocked:</p>
                <ul>
                  <li>Modules 6–16 (intermediate, advanced, and capstone)</li>
                  <li>Capstone project with guided prompts</li>
                  <li>Completion certificate</li>
                  <li>Build log and learning path</li>
                  <li>Leaderboard eligibility</li>
                </ul>
                <p><a href="https://zerotoship.app/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Go to Dashboard</a></p>
                <p style="color: #666; font-size: 14px;">Stripe will send your payment receipt separately.</p>
                <p style="color: #666; font-size: 14px;">— Zero to Ship</p>
                <p style="color: #999; font-size: 12px; margin-top: 24px; border-top: 1px solid #333; padding-top: 12px;">
                  <a href="https://zerotoship.app/api/unsubscribe?token=${unsubToken}" style="color: #999;">Unsubscribe</a>
                </p>
              </div>
            `,
          });
        } catch {
          // Don't fail the webhook on email error
        }
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
