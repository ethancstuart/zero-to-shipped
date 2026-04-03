import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateUnsubscribeToken } from "@/lib/email/tokens";
import { buildAuthMap } from "@/lib/supabase/list-all-users";
import { batchSendEmails } from "@/lib/email/batch-send";
import { emailWrapper, emailButton } from "@/lib/email/templates";

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
      <p>${emailButton("Continue Learning", "https://zerotoship.app/dashboard")}</p>
    `,
  },
  {
    day: 7,
    subject: "Here's what builders are shipping",
    body: (name) => `
      <p>Hey ${name},</p>
      <p>Builders on Zero to Ship are creating dashboards, internal tools, automated reports, and more — all without engineering backgrounds.</p>
      <p>The premium modules (6–16) are where things get real: interactive tools, data products, automations, and your capstone project.</p>
      <p>${emailButton("See What You'll Build", "https://zerotoship.app/pricing")}</p>
    `,
  },
  {
    day: 14,
    subject: "You're making progress",
    body: (name, progressPct) => `
      <p>Hey ${name},</p>
      <p>You're ${progressPct}% through the foundations. The first 5 modules give you the building blocks — the next 11 modules are where you ship real things.</p>
      <p>Upgrade to Full Access to unlock your capstone project, earn your certificate, and get on the leaderboard.</p>
      <p>${emailButton("Upgrade — $99", "https://zerotoship.app/pricing")}</p>
    `,
  },
  {
    day: 30,
    subject: "Your modules are waiting",
    body: (name) => `
      <p>Hey ${name},</p>
      <p>Just a friendly nudge — your Zero to Ship modules are still waiting for you.</p>
      <p>At $99, Full Access is under most L&D approval thresholds. We'll send you a receipt you can expense.</p>
      <p>${emailButton("Get Full Access", "https://zerotoship.app/pricing")}</p>
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

  // Paginated fetch of all auth users (emails + created_at)
  const authMap = await buildAuthMap(supabase);

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

  // Build email payloads and track which nurture day each user should receive
  const emailPayloads: { from: string; to: string; subject: string; html: string }[] = [];
  const userUpdates: { userId: string; alreadySent: number[]; day: number }[] = [];

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

        emailPayloads.push({
          from: "Zero to Ship <hello@zerotoship.app>",
          to: auth.email,
          subject: email.subject,
          html: emailWrapper(email.body(name, progressPct), {
            unsubscribeUrl: `https://zerotoship.app/api/unsubscribe?token=${generateUnsubscribeToken(user.id)}`,
          }),
        });

        userUpdates.push({ userId: user.id, alreadySent, day: email.day });

        // Only send one email per user per run
        break;
      }
    }
  }

  // Batch send all emails
  const sent = await batchSendEmails(resend, emailPayloads);

  // Update nurture_emails_sent for all users that were queued
  // (Best-effort: if batch partially failed, some updates may be slightly ahead,
  //  but the nurture schedule is idempotent — duplicates are harmless)
  const updatePromises = userUpdates.map(async (u) => {
    try {
      await supabase
        .from("profiles")
        .update({ nurture_emails_sent: [...u.alreadySent, u.day] })
        .eq("id", u.userId);
    } catch (error) {
      Sentry.captureException(error);
    }
  });
  await Promise.all(updatePromises);

  // Release lock
  await supabase.from("cron_locks").delete().eq("lock_name", "free-user-nurture");

  return NextResponse.json({ sent });
}
