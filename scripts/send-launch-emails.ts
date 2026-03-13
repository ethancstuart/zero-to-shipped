/**
 * Waitlist Launch Email Script
 *
 * Usage:
 *   npx tsx scripts/send-launch-emails.ts announcement
 *   npx tsx scripts/send-launch-emails.ts reminder
 *   npx tsx scripts/send-launch-emails.ts final
 *
 * Required env vars: RESEND_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Resend free tier: 100 emails/day — run across multiple days if waitlist > 100.
 */

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE_URL = "https://zerotoship.app";

const TEMPLATES = {
  announcement: {
    subject: "Zero to Shipped just launched — your spot is ready",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <h1 style="font-size: 24px;">It's live.</h1>
        <p>Zero to Shipped is officially open. You signed up for the waitlist, so you're hearing about it first.</p>
        <p>The full curriculum — 16 modules, capstone projects, certificates, and more — is now available with Full Access starting at <strong>$149</strong>.</p>
        <p><a href="${SITE_URL}/pricing" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">See Pricing & Enroll</a></p>
        <p style="color: #666; font-size: 14px;">The first 5 modules are always free. Start there if you want to try before you buy.</p>
        <p>— Zero to Shipped</p>
      </div>
    `,
  },
  reminder: {
    subject: "48 hours left — Zero to Shipped early access",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <h1 style="font-size: 24px;">Quick reminder</h1>
        <p>Zero to Shipped launched earlier this week. If you haven't had a chance to check it out yet, here's what you get with Full Access:</p>
        <ul>
          <li>16 hands-on modules from foundations to capstone</li>
          <li>Role-specific learning paths (PM, PjM, BA, BI)</li>
          <li>Capstone project templates</li>
          <li>Certificate of completion</li>
        </ul>
        <p><a href="${SITE_URL}/pricing" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Get Full Access</a></p>
        <p>— Zero to Shipped</p>
      </div>
    `,
  },
  final: {
    subject: "Last call — Zero to Shipped",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <h1 style="font-size: 24px;">Final reminder</h1>
        <p>This is the last email about the launch. If Zero to Shipped isn't for you, no worries at all.</p>
        <p>But if you've been meaning to check it out — the free tier has 5 full modules you can start right now, no credit card needed.</p>
        <p><a href="${SITE_URL}/pricing" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">See Pricing</a></p>
        <p>— Zero to Shipped</p>
      </div>
    `,
  },
} as const;

async function main() {
  const templateName = process.argv[2] as keyof typeof TEMPLATES;

  if (!templateName || !TEMPLATES[templateName]) {
    console.error("Usage: npx tsx scripts/send-launch-emails.ts [announcement|reminder|final]");
    process.exit(1);
  }

  const template = TEMPLATES[templateName];

  // Fetch all waitlist emails
  const { data: waitlist, error } = await supabase
    .from("waitlist")
    .select("email")
    .order("created_at");

  if (error) {
    console.error("Failed to fetch waitlist:", error.message);
    process.exit(1);
  }

  console.log(`Sending "${templateName}" to ${waitlist.length} waitlist subscribers...`);

  let sent = 0;
  let failed = 0;

  for (const { email } of waitlist) {
    try {
      await resend.emails.send({
        from: "Zero to Shipped <launch@zerotoship.app>",
        to: email,
        subject: template.subject,
        html: template.html,
      });
      sent++;
      console.log(`  ✓ ${email}`);
    } catch (err) {
      failed++;
      console.error(`  ✗ ${email}:`, err instanceof Error ? err.message : err);
    }

    // Resend rate limit: ~10/sec on free tier
    if (sent % 10 === 0) {
      await new Promise((r) => setTimeout(r, 1100));
    }
  }

  console.log(`\nDone. Sent: ${sent}, Failed: ${failed}`);
}

main();
