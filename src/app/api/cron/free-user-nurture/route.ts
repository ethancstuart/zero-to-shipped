import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateUnsubscribeToken } from "@/lib/email/tokens";

const NURTURE_SCHEDULE: {
  day: number;
  subject: string;
  body: (name: string, progressPct: number) => string;
}[] = [
  {
    day: 3,
    subject: "How's Module 1 going?",
    body: (name) => `
      <p>Hey ${name},</p>
      <p>You signed up for Zero to Ship a few days ago — nice move.</p>
      <p>If you haven't started yet, Module 1 takes about 3 hours and you'll have your first build by the end. Plus, completing checkpoints every day earns you streak bonuses.</p>
      <p><a href="https://zerotoship.app/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Continue Learning</a></p>
    `,
  },
  {
    day: 7,
    subject: "Here's what builders are shipping",
    body: (name) => `
      <p>Hey ${name},</p>
      <p>Builders on Zero to Ship are creating dashboards, internal tools, automated reports, and more — all without engineering backgrounds.</p>
      <p>The premium modules (6–16) are where things get real: interactive tools, data products, automations, and your capstone project.</p>
      <p><a href="https://zerotoship.app/pricing" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">See What You'll Build</a></p>
    `,
  },
  {
    day: 14,
    subject: "You're making progress",
    body: (name, progressPct) => `
      <p>Hey ${name},</p>
      <p>You're ${progressPct}% through the foundations. The first 5 modules give you the building blocks — the next 11 modules are where you ship real things.</p>
      <p>Upgrade to Full Access to unlock your capstone project, earn your certificate, and get on the leaderboard.</p>
      <p><a href="https://zerotoship.app/pricing" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Upgrade — $79</a></p>
    `,
  },
  {
    day: 30,
    subject: "Your modules are waiting",
    body: (name) => `
      <p>Hey ${name},</p>
      <p>Just a friendly nudge — your Zero to Ship modules are still waiting for you.</p>
      <p>At $79, Full Access is under most L&D approval thresholds. We'll send you a receipt you can expense.</p>
      <p><a href="https://zerotoship.app/pricing" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Get Full Access</a></p>
      <p style="color: #666; font-size: 14px;">This is the last email in this series. You can always come back when you're ready.</p>
    `,
  },
];

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Acquire lock to prevent duplicate runs from concurrent instances
  const lockExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const { data: lock } = await supabase
    .from("cron_locks")
    .upsert(
      { lock_name: "free-user-nurture", acquired_at: new Date().toISOString(), expires_at: lockExpiry },
      { onConflict: "lock_name" }
    )
    .select("lock_name")
    .single();

  if (!lock) {
    return NextResponse.json({ skipped: "lock held by another instance" });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Get all free users
  const { data: freeUsers } = await supabase
    .from("profiles")
    .select("id, display_name, subscription_tier, nurture_emails_sent")
    .eq("subscription_tier", "free")
    .eq("email_opt_out", false);

  if (!freeUsers || freeUsers.length === 0) {
    await supabase.from("cron_locks").delete().eq("lock_name", "free-user-nurture");
    return NextResponse.json({ sent: 0 });
  }

  // Batch fetch all auth users upfront (emails + created_at) instead of N+1
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const authMap = new Map<string, { email: string; created_at: string }>();
  if (authData?.users) {
    for (const u of authData.users) {
      if (u.email && u.created_at) {
        authMap.set(u.id, { email: u.email, created_at: u.created_at });
      }
    }
  }

  // Batch fetch completed module counts for all free users
  const userIds = freeUsers.map((u) => u.id);
  const { data: progressData } = await supabase
    .from("module_progress")
    .select("user_id")
    .in("user_id", userIds)
    .eq("status", "completed");

  const completedCounts = new Map<string, number>();
  if (progressData) {
    for (const row of progressData) {
      completedCounts.set(row.user_id, (completedCounts.get(row.user_id) ?? 0) + 1);
    }
  }

  let sent = 0;

  for (const user of freeUsers) {
    const auth = authMap.get(user.id);
    if (!auth) continue;

    const daysSinceSignup = Math.floor(
      (Date.now() - new Date(auth.created_at).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const alreadySent: number[] = user.nurture_emails_sent ?? [];

    // Find the right email for this user
    for (const email of NURTURE_SCHEDULE) {
      if (daysSinceSignup >= email.day && !alreadySent.includes(email.day)) {
        const progressPct = Math.round(((completedCounts.get(user.id) ?? 0) / 5) * 100);
        const name = user.display_name?.split(" ")[0] ?? "there";

        try {
          await resend.emails.send({
            from: "Zero to Ship <hello@zerotoship.app>",
            to: auth.email,
            subject: email.subject,
            html: `
              <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
                ${email.body(name, progressPct)}
                <p style="color: #666; font-size: 14px;">— Zero to Ship</p>
                <p style="color: #999; font-size: 12px; margin-top: 24px; border-top: 1px solid #333; padding-top: 12px;">
                  <a href="https://zerotoship.app/api/unsubscribe?token=${generateUnsubscribeToken(user.id)}" style="color: #999;">Unsubscribe</a>
                </p>
              </div>
            `,
          });

          // Track that this email was sent
          await supabase
            .from("profiles")
            .update({
              nurture_emails_sent: [...alreadySent, email.day],
            })
            .eq("id", user.id);

          sent++;
        } catch {
          // Skip failed sends
        }

        // Only send one email per user per run
        break;
      }
    }
  }

  // Release lock
  await supabase.from("cron_locks").delete().eq("lock_name", "free-user-nurture");

  return NextResponse.json({ sent });
}
