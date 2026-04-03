import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { getStripe } from "@/lib/stripe";
import { emailWrapperDark } from "@/lib/email/templates";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayISO = yesterday.toISOString();

  // Parallel data fetching
  const [
    totalUsersRes,
    newSignupsRes,
    premiumUsersRes,
    completionsRes,
    waitlistRes,
    foundingSpotsRes,
  ] = await Promise.all([
    // Total users
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),
    // New signups (last 24h)
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", yesterdayISO),
    // Premium users
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("subscription_tier", "premium"),
    // Module completions (last 24h)
    supabase
      .from("module_progress")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("completed_at", yesterdayISO),
    // Waitlist size
    supabase
      .from("waitlist")
      .select("email", { count: "exact", head: true }),
    // Founding spots
    (async () => {
      try {
        const couponId = process.env.STRIPE_COUPON_FOUNDING;
        if (!couponId) return { remaining: "N/A", total: 100 };
        const coupon = await getStripe().coupons.retrieve(couponId);
        const total = coupon.max_redemptions ?? 100;
        const used = coupon.times_redeemed ?? 0;
        return { remaining: Math.max(0, total - used), total };
      } catch (error) {
        Sentry.captureException(error);
        return { remaining: "Error", total: 100 };
      }
    })(),
  ]);

  // Stripe revenue (last 24h)
  let revenue24h = 0;
  try {
    const charges = await getStripe().charges.list({
      created: { gte: Math.floor(yesterday.getTime() / 1000) },
      limit: 100,
    });
    revenue24h = charges.data
      .filter((c) => c.status === "succeeded")
      .reduce((sum, c) => sum + c.amount, 0) / 100;
  } catch (error) {
    Sentry.captureException(error);
  }

  // Top modules completed (all time)
  const { data: topModules } = await supabase
    .from("module_progress")
    .select("module_number")
    .eq("status", "completed");

  const moduleCounts: Record<number, number> = {};
  for (const m of topModules ?? []) {
    moduleCounts[m.module_number] = (moduleCounts[m.module_number] ?? 0) + 1;
  }
  const sortedModules = Object.entries(moduleCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const digest = {
    date: now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
    totalUsers: totalUsersRes.count ?? 0,
    newSignups24h: newSignupsRes.count ?? 0,
    premiumUsers: premiumUsersRes.count ?? 0,
    completions24h: completionsRes.count ?? 0,
    waitlistSize: waitlistRes.count ?? 0,
    foundingSpots: foundingSpotsRes,
    revenue24h,
    topModules: sortedModules,
  };

  // Send digest email
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "ZTS Analytics <hello@zerotoship.app>",
      to: "ethan@zerotoship.app",
      subject: `📊 ZTS Daily Digest — ${digest.date}`,
      html: emailWrapperDark(
        `<h2 style="color: #fff; margin-top: 0;">ZTS Daily Digest</h2>
          <p style="color: #888;">${digest.date}</p>

          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px 0; color: #888;">Total Users</td>
              <td style="padding: 8px 0; text-align: right; color: #fff; font-weight: bold;">${digest.totalUsers}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">New Signups (24h)</td>
              <td style="padding: 8px 0; text-align: right; color: #22c55e; font-weight: bold;">${digest.newSignups24h > 0 ? "+" : ""}${digest.newSignups24h}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Premium Users</td>
              <td style="padding: 8px 0; text-align: right; color: #fff; font-weight: bold;">${digest.premiumUsers}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Revenue (24h)</td>
              <td style="padding: 8px 0; text-align: right; color: #22c55e; font-weight: bold;">$${digest.revenue24h.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Completions (24h)</td>
              <td style="padding: 8px 0; text-align: right; color: #fff; font-weight: bold;">${digest.completions24h}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Waitlist Size</td>
              <td style="padding: 8px 0; text-align: right; color: #fff; font-weight: bold;">${digest.waitlistSize}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Founding Spots Left</td>
              <td style="padding: 8px 0; text-align: right; color: #f59e0b; font-weight: bold;">${digest.foundingSpots.remaining} / ${digest.foundingSpots.total}</td>
            </tr>
          </table>

          ${sortedModules.length > 0 ? `
          <h3 style="color: #fff; margin-top: 24px;">Top Completed Modules</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${sortedModules.map(([num, count]) => `
            <tr>
              <td style="padding: 4px 0; color: #888;">Module ${num}</td>
              <td style="padding: 4px 0; text-align: right; color: #fff;">${count} completions</td>
            </tr>
            `).join("")}
          </table>
          ` : ""}`,
        { footerNote: "Automated digest from Zero to Ship analytics agent." }
      ),
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ sent: false, error: "Failed to send digest email", digest }, { status: 500 });
  }

  return NextResponse.json({ sent: true, digest });
}
