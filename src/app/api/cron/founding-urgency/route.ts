import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { getStripe } from "@/lib/stripe";
import { generateUnsubscribeToken } from "@/lib/email/tokens";

const URGENCY_THRESHOLDS = [75, 50, 25, 10, 5] as const;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const couponId = process.env.STRIPE_COUPON_FOUNDING;
  if (!couponId) {
    return NextResponse.json({ skipped: "No founding coupon configured" });
  }

  // Get current founding spots
  let remaining: number;
  try {
    const coupon = await getStripe().coupons.retrieve(couponId);
    const total = coupon.max_redemptions ?? 100;
    const used = coupon.times_redeemed ?? 0;
    remaining = Math.max(0, total - used);
  } catch {
    return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 });
  }

  // Check if we've hit a threshold that hasn't been emailed yet
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Track which thresholds we've already sent emails for
  const { data: sentThresholds } = await supabase
    .from("processed_events")
    .select("id")
    .like("id", "founding-urgency-%");

  const sentSet = new Set(
    (sentThresholds ?? []).map((e) => e.id)
  );

  // Find the current threshold
  const currentThreshold = URGENCY_THRESHOLDS.find((t) => remaining <= t);
  if (!currentThreshold) {
    return NextResponse.json({ skipped: "No threshold hit yet", remaining });
  }

  const eventId = `founding-urgency-${currentThreshold}`;
  if (sentSet.has(eventId)) {
    return NextResponse.json({ skipped: "Already sent for this threshold", remaining });
  }

  // Mark as sent (idempotent)
  await supabase
    .from("processed_events")
    .insert({ id: eventId, event_type: "founding_urgency" });

  // Get all free users who haven't opted out
  const { data: freeUsers } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("subscription_tier", "free")
    .eq("email_opt_out", false);

  if (!freeUsers || freeUsers.length === 0) {
    return NextResponse.json({ sent: 0, remaining });
  }

  // Get emails
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map<string, string>();
  if (authData?.users) {
    for (const u of authData.users) {
      if (u.email) emailMap.set(u.id, u.email);
    }
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  let sent = 0;

  const subject = remaining <= 10
    ? `Only ${remaining} founding member spots left`
    : `${remaining} founding member spots remaining — Zero to Ship`;

  for (const user of freeUsers) {
    const email = emailMap.get(user.id);
    if (!email) continue;

    const name = user.display_name?.split(" ")[0] ?? "there";
    const unsubToken = generateUnsubscribeToken(user.id);

    try {
      await resend.emails.send({
        from: "Zero to Ship <hello@zerotoship.app>",
        to: email,
        subject,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
            <p>Hey ${name},</p>

            <p>${remaining <= 10
              ? `There are only <strong>${remaining} founding member spots</strong> left.`
              : `<strong>${remaining} of 100 founding member spots</strong> are still available.`
            }</p>

            <p>Founding members get full access to all 16 modules, the capstone project, a certificate of completion, and Season 2 when it ships — all for <strong>$99</strong> (standard price: $199). Plus a Founding Member badge on your profile.</p>

            ${remaining <= 25 ? `<p style="color: #f59e0b; font-weight: 600;">Founding pricing ends April 30 or when spots run out — whichever comes first.</p>` : ""}

            <p><a href="https://zerotoship.app/pricing?utm_source=urgency&utm_medium=email&utm_campaign=founding" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Get Founding Member Access — $99</a></p>

            <p style="color: #666; font-size: 14px;">— Zero to Ship</p>

            <p style="color: #999; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px;">
              <a href="https://zerotoship.app/api/unsubscribe?token=${unsubToken}" style="color: #999;">Unsubscribe</a>
            </p>
          </div>
        `,
      });
      sent++;
    } catch {
      // Continue with remaining users
    }
  }

  return NextResponse.json({ sent, remaining, threshold: currentThreshold });
}
