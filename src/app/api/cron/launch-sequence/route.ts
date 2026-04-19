import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { getStripe } from "@/lib/stripe";
import { generateEmailUnsubscribeToken } from "@/lib/email/tokens";
import { batchSendEmails } from "@/lib/email/batch-send";
import { emailWrapperDark, emailButtonCentered } from "@/lib/email/templates";
import * as Sentry from "@sentry/nextjs";

interface LaunchEmail {
  id: string;
  date: string; // YYYY-MM-DD
  subject: string | ((remaining: number) => string);
  body: string | ((remaining: number) => string);
}

const LAUNCH_EMAILS: LaunchEmail[] = [
  {
    id: "launch-email-1",
    date: "2026-04-22",
    subject: "Zero to Ship opens Monday — founding member pricing",
    body: `
      <h2 style="color: #fff; margin-top: 0;">Zero to Ship opens in 6 days.</h2>

      <p>I'm a PM. A few months ago I realized I could describe what I wanted to build in plain English, and Claude Code would write the code, wire up the database, deploy it to a live URL — all while I watched and directed. No CS degree required.</p>

      <p>I built Zero to Ship because I wanted to teach the workflow, not just show it off. <strong style="color: #fff;">16 modules</strong> — from setting up your environment to shipping a capstone project you can actually put on your resume. Built for PMs, Project Managers, BAs, and BI Engineers.</p>

      <p>Gamified progress (XP, streaks, badges, skill tree). Role-specific learning paths. Certificate of completion. And founding members get <strong style="color: #fff;">Season 2 free</strong> — covering Claude Code mastery, MCP servers, and agent building.</p>

      <p>Founding member pricing: <strong style="color: #22c55e;">$99 one-time</strong> (standard: $199). 100 spots. Opens Monday April 28.</p>

      <p style="color: #888; font-size: 14px;">Not ready to commit? The <a href="https://zerotoship.app/library?utm_source=launch&utm_medium=email&utm_campaign=email1" style="color: #6366f1;">Builder's Library</a> is free — 40+ prompts, guides, and templates, no account required.</p>

      ${emailButtonCentered("Preview Module 1 Free", "https://zerotoship.app/preview/module-1?utm_source=launch&utm_medium=email&utm_campaign=email1")}
    `,
  },
  {
    id: "launch-email-2",
    date: "2026-04-25",
    subject: "What 16 modules looks like — Zero to Ship",
    body: `
      <h2 style="color: #fff; margin-top: 0;">Here's what's inside.</h2>

      <p>Zero to Ship has 16 modules. Here are 5 that people ask about most:</p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #888; border-bottom: 1px solid #222;">Module 2</td>
          <td style="padding: 8px 0; color: #fff; border-bottom: 1px solid #222;"><strong>Prompt Engineering</strong> — the prompts that separate "meh" output from production-quality code</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #888; border-bottom: 1px solid #222;">Module 7</td>
          <td style="padding: 8px 0; color: #fff; border-bottom: 1px solid #222;"><strong>Interactive Dashboards</strong> — build a real data dashboard from scratch</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #888; border-bottom: 1px solid #222;">Module 10</td>
          <td style="padding: 8px 0; color: #fff; border-bottom: 1px solid #222;"><strong>APIs & Integrations</strong> — connect to real-world services and pull live data</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #888; border-bottom: 1px solid #222;">Module 13</td>
          <td style="padding: 8px 0; color: #fff; border-bottom: 1px solid #222;"><strong>Automation</strong> — build workflows that run on their own</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #888;">Module 16</td>
          <td style="padding: 8px 0; color: #fff;"><strong>Capstone Project</strong> — ship something real, earn your certificate</td>
        </tr>
      </table>

      <p>Founding members also get free access to resources outside the core modules: <strong style="color: #fff;">agent templates</strong>, an <strong style="color: #fff;">MCP toolkit</strong>, and a <strong style="color: #fff;">Claude Code guide</strong>.</p>

      <p style="color: #f59e0b;">Founding member pricing: $99 (100 spots, ends April 30)</p>

      ${emailButtonCentered("See Full Pricing", "https://zerotoship.app/pricing?utm_source=launch&utm_medium=email&utm_campaign=email2")}
    `,
  },
  {
    id: "launch-email-3",
    date: "2026-04-27",
    subject: (remaining: number) =>
      `Zero to Ship opens tomorrow — ${remaining} founding spots left`,
    body: (remaining: number) => `
      <h2 style="color: #fff; margin-top: 0;">Tomorrow.</h2>

      <p>Zero to Ship opens tomorrow, Monday April 28.</p>

      <p>There are <strong style="color: #f59e0b;">${remaining} of 100 founding member spots</strong> remaining at the $99 founding price. Standard price after that is $199.</p>

      <p>Founding members also get <strong style="color: #fff;">Season 2 free</strong> when it launches — covering Claude Code mastery, building MCP servers, and creating AI agents.</p>

      <p>If you want to try before you commit, Module 1 is completely free — no account required.</p>

      ${emailButtonCentered("Try Module 1 Free", "https://zerotoship.app/preview/module-1?utm_source=launch&utm_medium=email&utm_campaign=email3")}
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

  // Determine today's date in YYYY-MM-DD (UTC)
  const today = new Date().toISOString().slice(0, 10);

  // Find the email scheduled for today
  const scheduledEmail = LAUNCH_EMAILS.find((e) => e.date === today);
  if (!scheduledEmail) {
    return NextResponse.json({ skipped: "No email scheduled for today", today });
  }

  // Check if this email has already been sent (idempotency)
  const { data: existing } = await supabase
    .from("processed_events")
    .select("id")
    .eq("id", scheduledEmail.id)
    .single();

  if (existing) {
    return NextResponse.json({ skipped: "Already sent", emailId: scheduledEmail.id });
  }

  // Get founding spots remaining (needed for email 3, but fetch always for safety)
  let foundingRemaining = 100;
  try {
    const couponId = process.env.STRIPE_COUPON_FOUNDING;
    if (couponId) {
      const coupon = await getStripe().coupons.retrieve(couponId);
      const total = coupon.max_redemptions ?? 100;
      const used = coupon.times_redeemed ?? 0;
      foundingRemaining = Math.max(0, total - used);
    }
  } catch (error) {
    Sentry.captureException(error);
  }

  // Resolve subject and body (some are functions for dynamic content)
  const subject =
    typeof scheduledEmail.subject === "function"
      ? scheduledEmail.subject(foundingRemaining)
      : scheduledEmail.subject;

  const bodyContent =
    typeof scheduledEmail.body === "function"
      ? scheduledEmail.body(foundingRemaining)
      : scheduledEmail.body;

  // Get all waitlist emails
  const { data: waitlistUsers } = await supabase
    .from("waitlist")
    .select("email");

  if (!waitlistUsers || waitlistUsers.length === 0) {
    return NextResponse.json({ sent: 0, emailId: scheduledEmail.id });
  }

  // Mark as sent before sending (idempotent — prevents duplicate runs)
  await supabase
    .from("processed_events")
    .insert({ id: scheduledEmail.id, event_type: "launch_sequence" });

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Collect all emails for batch sending
  const emailPayloads = waitlistUsers.map((user) => {
    const unsubToken = generateEmailUnsubscribeToken(user.email);
    const unsubUrl = `https://zerotoship.app/api/unsubscribe?token=${unsubToken}&type=email`;

    return {
      from: "Zero to Ship <hello@zerotoship.app>",
      to: user.email,
      subject,
      html: emailWrapperDark(bodyContent, {
        unsubscribeUrl: unsubUrl,
        footerNote: "You're receiving this because you signed up for the Zero to Ship waitlist.",
      }),
    };
  });

  const sent = await batchSendEmails(resend, emailPayloads);

  return NextResponse.json({
    sent,
    total: waitlistUsers.length,
    emailId: scheduledEmail.id,
    foundingRemaining,
  });
}
