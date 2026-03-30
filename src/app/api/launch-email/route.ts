import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateEmailUnsubscribeToken } from "@/lib/email/tokens";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: waitlistUsers } = await supabase
    .from("waitlist")
    .select("email");

  if (!waitlistUsers || waitlistUsers.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  let sent = 0;

  for (const user of waitlistUsers) {
    const unsubToken = generateEmailUnsubscribeToken(user.email);
    const unsubUrl = `https://zerotoship.app/api/unsubscribe?token=${unsubToken}&type=email`;

    try {
      await resend.emails.send({
        from: "Ethan from Zero to Ship <hello@zerotoship.app>",
        to: user.email,
        subject: "Zero to Ship is live — founding member spots open",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
            <p>Hey!</p>

            <p>You signed up for the Zero to Ship waitlist, and I wanted to let you know — it's live.</p>

            <p><strong>Zero to Ship</strong> teaches PMs, Project Managers, Business Analysts, and BI Engineers to build real products with AI coding tools. No engineering degree required.</p>

            <p>Here's what's inside:</p>
            <ul>
              <li><strong>16 hands-on modules</strong> — from setup to shipping a capstone project</li>
              <li><strong>Gamified progress</strong> — XP, badges, streaks, skill tree, leaderboard</li>
              <li><strong>Certificate of completion</strong> — shareable on LinkedIn</li>
              <li><strong>Role-specific tracks</strong> — tailored for PMs, PjMs, BAs, and BI Engineers</li>
            </ul>

            <p>The first 5 modules are free. Full access is a one-time purchase.</p>

            <p style="background: #22c55e15; border: 1px solid #22c55e30; border-radius: 8px; padding: 16px; text-align: center;">
              <strong style="color: #22c55e;">Founding member pricing: $99</strong> (first 100 students)<br>
              <span style="color: #666; font-size: 14px;">Standard price: $199. Founding spots end April 30. Includes Season 2 when it ships.</span>
            </p>

            <p style="text-align: center;">
              <a href="https://zerotoship.app?utm_source=waitlist&utm_medium=email&utm_campaign=launch" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Start Learning Free</a>
            </p>

            <p>Not ready for premium? Try the <a href="https://zerotoship.app/guides/git-101?utm_source=waitlist&utm_medium=email&utm_campaign=launch" style="color: #6366f1;">free Git 101 guide</a> — no sign-up required.</p>

            <p>Thanks for being on the waitlist. This project has been a labor of love, and I'm excited to share it.</p>

            <p>— Ethan</p>

            <p style="color: #999; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px;">
              You're receiving this because you signed up for the Zero to Ship waitlist.
              <br><a href="${unsubUrl}" style="color: #999;">Unsubscribe</a>
            </p>
          </div>
        `,
      });
      sent++;
    } catch {
      // Continue with remaining emails
    }
  }

  return NextResponse.json({ sent, total: waitlistUsers.length });
}
