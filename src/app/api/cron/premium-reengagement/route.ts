import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateUnsubscribeToken } from "@/lib/email/tokens";
import { emailWrapper, emailButton } from "@/lib/email/templates";

const TOTAL_MODULES = 16;

const MODULE_TITLES: Record<number, { slug: string; title: string }> = {
  1: { slug: "01-setup-and-first-build", title: "Setup & First Build" },
  2: { slug: "02-prompt-engineering", title: "Prompt Engineering & Critical Thinking" },
  3: { slug: "03-how-code-works", title: "How Code Actually Works" },
  4: { slug: "04-terminal-and-cli", title: "The Terminal & Command Line" },
  5: { slug: "05-version-control", title: "Version Control with Git" },
  6: { slug: "06-blueprints", title: "Blueprints & Project Architecture" },
  7: { slug: "07-brainstorming-and-ideation", title: "Brainstorming & Ideation with AI" },
  8: { slug: "08-planning-and-research", title: "Planning & Research with AI" },
  9: { slug: "09-interactive-tools", title: "Building Interactive Tools" },
  10: { slug: "10-decks-and-visuals", title: "Decks, Diagrams & Visual Assets" },
  11: { slug: "11-design-principles", title: "UI Design Principles for Builders" },
  12: { slug: "12-data-products", title: "Data Products" },
  13: { slug: "13-automations", title: "Automations & Workflows" },
  14: { slug: "14-docs-security-testing-shipping", title: "Documentation, Security, Testing & Shipping" },
  15: { slug: "15-collaboration", title: "Collaboration & Working with Engineers" },
  16: { slug: "16-capstone", title: "Put It All Together (Capstone)" },
};

function getNextModule(completedModules: number[]): { number: number; slug: string; title: string } | null {
  const completed = new Set(completedModules);
  for (let i = 1; i <= TOTAL_MODULES; i++) {
    if (!completed.has(i)) {
      const mod = MODULE_TITLES[i];
      return { number: i, slug: mod.slug, title: mod.title };
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Acquire lock to prevent duplicate runs from concurrent instances
  const lockExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min
  const { data: lock } = await supabase
    .from("cron_locks")
    .upsert(
      { lock_name: "premium-reengagement", acquired_at: new Date().toISOString(), expires_at: lockExpiry },
      { onConflict: "lock_name" }
    )
    .select("lock_name")
    .single();

  if (!lock) {
    return NextResponse.json({ skipped: "lock held by another instance" });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Target premium users inactive 7-30 days who haven't opted out
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: users } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("subscription_tier", "premium")
    .eq("email_opt_out", false)
    .lte("last_activity_date", sevenDaysAgo.toISOString().split("T")[0])
    .gte("last_activity_date", thirtyDaysAgo.toISOString().split("T")[0]);

  if (!users || users.length === 0) {
    await supabase.from("cron_locks").delete().eq("lock_name", "premium-reengagement");
    return NextResponse.json({ sent: 0 });
  }

  // Deduplicate: skip users who already received a re-engagement email this week
  const userIds = users.map((u) => u.id);
  const { data: sentEvents } = await supabase
    .from("processed_events")
    .select("id")
    .like("id", "premium-reengage-%");

  const sentSet = new Set((sentEvents ?? []).map((e) => e.id));

  // Batch fetch completed modules for all targeted users
  const { data: progressData } = await supabase
    .from("module_progress")
    .select("user_id, module_number")
    .in("user_id", userIds)
    .eq("status", "completed");

  const userModules = new Map<string, number[]>();
  for (const row of progressData ?? []) {
    const existing = userModules.get(row.user_id) ?? [];
    existing.push(row.module_number);
    userModules.set(row.user_id, existing);
  }

  // Filter out users who completed all 16 modules
  const eligibleUsers = users.filter((u) => {
    const completed = userModules.get(u.id) ?? [];
    return completed.length < TOTAL_MODULES;
  });

  if (eligibleUsers.length === 0) {
    await supabase.from("cron_locks").delete().eq("lock_name", "premium-reengagement");
    return NextResponse.json({ sent: 0 });
  }

  // Fetch emails individually (small set of premium-gone-silent users)
  const emailMap = new Map<string, string>();
  await Promise.all(
    eligibleUsers.map(async (user) => {
      const { data } = await supabase.auth.admin.getUserById(user.id);
      if (data?.user?.email) {
        emailMap.set(user.id, data.user.email);
      }
    })
  );

  // Build email batch
  type EmailMessage = Parameters<typeof resend.emails.send>[0];
  const emails: EmailMessage[] = [];
  const eventInserts: { id: string; event_type: string }[] = [];

  for (const user of eligibleUsers) {
    const email = emailMap.get(user.id);
    if (!email) continue;

    const eventId = `premium-reengage-${user.id}`;
    if (sentSet.has(eventId)) continue;

    const completedModules = userModules.get(user.id) ?? [];
    const completedCount = completedModules.length;
    const nextModule = getNextModule(completedModules);
    if (!nextModule) continue;

    const name = user.display_name?.split(" ")[0] ?? "there";
    const unsubToken = generateUnsubscribeToken(user.id);
    const progressPct = Math.round((completedCount / TOTAL_MODULES) * 100);

    eventInserts.push({ id: eventId, event_type: "premium_reengagement" });

    emails.push({
      from: "Zero to Ship <hello@zerotoship.app>",
      to: email,
      subject: `You're ${progressPct}% through — pick up where you left off`,
      html: emailWrapper(
        `<p>Hey ${name},</p>
          <p>You've completed <strong>${completedCount} of ${TOTAL_MODULES} modules</strong> on Zero to Ship — that's real progress. But it's been a little while since your last session.</p>
          <p>Your next module is ready:</p>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-weight: 600; color: #6366f1;">Module ${nextModule.number}: ${nextModule.title}</p>
          </div>
          <p>Most modules take 2-3 hours. Even 30 minutes of progress keeps momentum going.</p>
          <p>${emailButton(`Continue Module ${nextModule.number}`, `https://zerotoship.app/modules/${nextModule.slug}?utm_source=reengagement&utm_medium=email&utm_campaign=premium-inactive`)}</p>`,
        { unsubscribeUrl: `https://zerotoship.app/api/unsubscribe?token=${unsubToken}` }
      ),
    });
  }

  if (emails.length === 0) {
    await supabase.from("cron_locks").delete().eq("lock_name", "premium-reengagement");
    return NextResponse.json({ sent: 0 });
  }

  // Mark as sent first (idempotent)
  if (eventInserts.length > 0) {
    await supabase.from("processed_events").upsert(eventInserts, { onConflict: "id" });
  }

  let sent = 0;

  try {
    if (emails.length === 1) {
      await resend.emails.send(emails[0]);
      sent = 1;
    } else {
      // Batch send for multiple emails (Resend batch limit: 100)
      const results = await resend.batch.send(emails as Parameters<typeof resend.batch.send>[0]);
      sent = results.data?.data?.length ?? emails.length;
    }
  } catch (error) {
    Sentry.captureException(error);
  }

  // Release lock
  await supabase.from("cron_locks").delete().eq("lock_name", "premium-reengagement");

  return NextResponse.json({ sent });
}
