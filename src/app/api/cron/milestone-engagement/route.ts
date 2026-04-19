import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateUnsubscribeToken } from "@/lib/email/tokens";
import { buildEmailMap } from "@/lib/supabase/list-all-users";
import { batchSendEmails } from "@/lib/email/batch-send";
import { emailWrapper, emailButton, emailLink } from "@/lib/email/templates";

interface Milestone {
  key: string;
  check: (data: { completedModules: number[]; badgeCount: number; tier: string }) => boolean;
  subject: string;
  body: (name: string) => string;
}

const MILESTONES: Milestone[] = [
  {
    key: "module-1-complete",
    check: (d) => d.completedModules.includes(1),
    subject: "You shipped your first build 🎯",
    body: (name) => `
      <p>Hey ${name},</p>
      <p>You completed Module 1. That means you've built something, seen it run, and iterated on it. Most people never get this far.</p>
      <p>Module 2 teaches you how to give AI tools better instructions — the prompts that separate "meh" output from "wow, that's exactly what I needed."</p>
      <p>${emailButton("Start Module 2", "https://zerotoship.app/modules/02-prompt-engineering?utm_source=milestone&utm_medium=email&utm_campaign=module1")}</p>
    `,
  },
  {
    key: "module-5-complete",
    check: (d) => d.completedModules.includes(5),
    subject: "Foundations complete — here's what's next",
    body: (name) => `
      <p>Hey ${name},</p>
      <p>You just finished all 5 foundation modules. You can set up projects, write effective prompts, understand code, use the terminal, and manage version control. That's a real skill set.</p>
      <p>The next 11 modules are where you build real things — interactive tools, data products, automations, and your capstone project.</p>
      <p>${emailButton("Unlock Full Access — $149", "https://zerotoship.app/pricing?utm_source=milestone&utm_medium=email&utm_campaign=module5")}</p>
      <p style="color: #22c55e; font-size: 14px; font-weight: 600;">Founding member price: $99 (limited spots)</p>
    `,
  },
  {
    key: "first-badge",
    check: (d) => d.badgeCount >= 1,
    subject: "You earned your first badge",
    body: (name) => `
      <p>Hey ${name},</p>
      <p>You just earned your first badge on Zero to Ship. Badges track your progress and show up on your public profile.</p>
      <p>Keep building — there are 20+ badges to collect, from streak milestones to role-specific achievements.</p>
      <p>${emailButton("View Your Progress", "https://zerotoship.app/dashboard?utm_source=milestone&utm_medium=email&utm_campaign=firstbadge")}</p>
    `,
  },
  {
    key: "capstone-complete",
    check: (d) => d.completedModules.includes(16),
    subject: "You shipped your capstone. Time to celebrate.",
    body: (name) => `
      <p>Hey ${name},</p>
      <p>You completed all 16 modules and shipped your capstone project. That's incredible.</p>
      <p>Your certificate is ready. Share it on LinkedIn — you earned it.</p>
      <p>${emailButton("Download Your Certificate", "https://zerotoship.app/certificate?utm_source=milestone&utm_medium=email&utm_campaign=capstone")}</p>
      <p>One more thing: if you know a PM, analyst, or project manager who'd benefit from this, share your referral link. You both earn 100 XP.</p>
      <p>${emailLink("Your referral dashboard →", "https://zerotoship.app/referrals?utm_source=milestone&utm_medium=email&utm_campaign=capstone")}</p>
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

  // Get all users who haven't opted out
  const { data: users } = await supabase
    .from("profiles")
    .select("id, display_name, email_opt_out")
    .eq("email_opt_out", false);

  if (!users || users.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Paginated fetch of all auth users to build userId -> email map
  const emailMap = await buildEmailMap(supabase);

  // Get all progress and badges in batch
  const userIds = users.map((u) => u.id);

  const [progressRes, badgesRes] = await Promise.all([
    supabase
      .from("module_progress")
      .select("user_id, module_number")
      .in("user_id", userIds)
      .eq("status", "completed"),
    supabase
      .from("badges")
      .select("user_id")
      .in("user_id", userIds),
  ]);

  // Build user data maps
  const userModules = new Map<string, number[]>();
  for (const row of progressRes.data ?? []) {
    const existing = userModules.get(row.user_id) ?? [];
    existing.push(row.module_number);
    userModules.set(row.user_id, existing);
  }

  const userBadgeCounts = new Map<string, number>();
  for (const row of badgesRes.data ?? []) {
    userBadgeCounts.set(row.user_id, (userBadgeCounts.get(row.user_id) ?? 0) + 1);
  }

  // Check already-sent milestones
  const { data: sentEvents } = await supabase
    .from("processed_events")
    .select("id")
    .like("id", "milestone-%");

  const sentSet = new Set((sentEvents ?? []).map((e) => e.id));

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Collect email payloads and event markers for batch processing
  const emailPayloads: { from: string; to: string; subject: string; html: string }[] = [];
  const eventInserts: { id: string; event_type: string }[] = [];

  for (const user of users) {
    const email = emailMap.get(user.id);
    if (!email) continue;

    const data = {
      completedModules: userModules.get(user.id) ?? [],
      badgeCount: userBadgeCounts.get(user.id) ?? 0,
      tier: "free", // simplified — could check subscription_tier
    };

    for (const milestone of MILESTONES) {
      const eventId = `milestone-${user.id}-${milestone.key}`;
      if (sentSet.has(eventId)) continue;
      if (!milestone.check(data)) continue;

      const name = user.display_name?.split(" ")[0] ?? "there";
      const unsubToken = generateUnsubscribeToken(user.id);

      eventInserts.push({ id: eventId, event_type: "milestone_email" });

      emailPayloads.push({
        from: "Zero to Ship <hello@zerotoship.app>",
        to: email,
        subject: milestone.subject,
        html: emailWrapper(milestone.body(name), {
          unsubscribeUrl: `https://zerotoship.app/api/unsubscribe?token=${unsubToken}`,
        }),
      });

      // Only send one milestone email per user per run
      break;
    }
  }

  // Mark events as sent first (idempotent), then batch send emails
  if (eventInserts.length > 0) {
    await supabase
      .from("processed_events")
      .insert(eventInserts);
  }

  const sent = await batchSendEmails(resend, emailPayloads);

  return NextResponse.json({ sent });
}
