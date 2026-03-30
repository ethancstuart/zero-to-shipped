import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateUnsubscribeToken } from "@/lib/email/tokens";

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
      <p><a href="https://zerotoship.app/modules/02-prompt-engineering?utm_source=milestone&utm_medium=email&utm_campaign=module1" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Start Module 2</a></p>
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
      <p><a href="https://zerotoship.app/pricing?utm_source=milestone&utm_medium=email&utm_campaign=module5" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Unlock Full Access — $79</a></p>
      <p style="color: #22c55e; font-size: 14px; font-weight: 600;">Founding member price: $49 (limited spots)</p>
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
      <p><a href="https://zerotoship.app/dashboard?utm_source=milestone&utm_medium=email&utm_campaign=firstbadge" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Your Progress</a></p>
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
      <p><a href="https://zerotoship.app/certificate?utm_source=milestone&utm_medium=email&utm_campaign=capstone" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Download Your Certificate</a></p>
      <p>One more thing: if you know a PM, analyst, or project manager who'd benefit from this, share your referral link. You both earn 100 XP.</p>
      <p><a href="https://zerotoship.app/referrals?utm_source=milestone&utm_medium=email&utm_campaign=capstone" style="color: #6366f1;">Your referral dashboard →</a></p>
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

  // Get emails in batch
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map<string, string>();
  if (authData?.users) {
    for (const u of authData.users) {
      if (u.email) emailMap.set(u.id, u.email);
    }
  }

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
  let sent = 0;

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

      // Mark as sent first (idempotent)
      await supabase
        .from("processed_events")
        .insert({ id: eventId, event_type: "milestone_email" });

      const name = user.display_name?.split(" ")[0] ?? "there";
      const unsubToken = generateUnsubscribeToken(user.id);

      try {
        await resend.emails.send({
          from: "Zero to Ship <hello@zerotoship.app>",
          to: email,
          subject: milestone.subject,
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
              ${milestone.body(name)}
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

      // Only send one milestone email per user per run
      break;
    }
  }

  return NextResponse.json({ sent });
}
