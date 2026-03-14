import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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
      <p>You signed up for Zero to Shipped a few days ago — nice move.</p>
      <p>If you haven't started yet, Module 1 takes about 3 hours and you'll have your first build by the end. Plus, completing checkpoints every day earns you streak bonuses.</p>
      <p><a href="https://zerotoship.app/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Continue Learning</a></p>
    `,
  },
  {
    day: 7,
    subject: "Here's what builders are shipping",
    body: (name) => `
      <p>Hey ${name},</p>
      <p>Builders on Zero to Shipped are creating dashboards, internal tools, automated reports, and more — all without engineering backgrounds.</p>
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
      <p><a href="https://zerotoship.app/pricing" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Upgrade — $149</a></p>
    `,
  },
  {
    day: 30,
    subject: "Your modules are waiting",
    body: (name) => `
      <p>Hey ${name},</p>
      <p>Just a friendly nudge — your Zero to Shipped modules are still waiting for you.</p>
      <p>At $149, Full Access is under most L&D approval thresholds. We'll send you a receipt you can expense.</p>
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

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Get all free users
  const { data: freeUsers } = await supabase
    .from("profiles")
    .select("id, display_name, subscription_tier, nurture_emails_sent")
    .eq("subscription_tier", "free");

  if (!freeUsers || freeUsers.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;

  for (const user of freeUsers) {
    // Get auth user for email and created_at
    const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
    if (!authUser?.user?.email || !authUser.user.created_at) continue;

    const daysSinceSignup = Math.floor(
      (Date.now() - new Date(authUser.user.created_at).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const alreadySent: number[] = user.nurture_emails_sent ?? [];

    // Find the right email for this user
    for (const email of NURTURE_SCHEDULE) {
      if (daysSinceSignup >= email.day && !alreadySent.includes(email.day)) {
        // Calculate progress percentage for personalization
        const { count } = await supabase
          .from("module_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "completed");

        const progressPct = Math.round(((count ?? 0) / 5) * 100);
        const name = user.display_name?.split(" ")[0] ?? "there";

        try {
          await resend.emails.send({
            from: "Zero to Shipped <hello@zerotoship.app>",
            to: authUser.user.email,
            subject: email.subject,
            html: `
              <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
                ${email.body(name, progressPct)}
                <p style="color: #666; font-size: 14px;">— Zero to Shipped</p>
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

  return NextResponse.json({ sent });
}
