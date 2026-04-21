import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateEmailUnsubscribeToken } from "@/lib/email/tokens";
import { emailWrapper, emailButton } from "@/lib/email/templates";

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
        from: "Ethan Stuart <ethan@zerotoship.app>",
        to: user.email,
        subject: "Your founding member spot is ready",
        html: emailWrapper(
          `<p>Six months ago I told a handful of people I was going to build a course that teaches non-engineers to ship real software with AI tools. Today that course is live.</p>

            <p><strong>Zero to Ship is open.</strong> → <a href="https://zerotoship.app?utm_source=waitlist&utm_medium=email&utm_campaign=launch" style="color: #6366f1;">zerotoship.app</a></p>

            <p>Here's what you're getting:</p>
            <ul>
              <li>16 modules from setup to shipped capstone</li>
              <li>Hands-on builds, not lectures — every module produces something you can point to</li>
              <li>Role-specific learning paths for PMs, Project Managers, BAs, and BI Engineers</li>
              <li>XP, streaks, badges, and a skill tree</li>
              <li>A certificate of completion when you're done</li>
              <li>The first 5 modules free, forever</li>
            </ul>

            <p><strong>You're on the waitlist, which means you get founding member pricing: $99 one-time (normally $199).</strong> This is live for the first 100 students only. After that, it's $199.</p>

            <p>No subscription. Lifetime access. 14-day money-back guarantee, no questions asked.</p>

            <p>If you want to start right now without committing to anything:</p>

            <p style="text-align: center;">
              ${emailButton("Try Module 1 Free — No Sign-Up Required", "https://zerotoship.app/preview/module-1?utm_source=waitlist&utm_medium=email&utm_campaign=launch", { large: true })}
            </p>

            <p>You'll build a working web app from a natural language prompt in the first 40 minutes. That's how you know the method works before you pay for anything.</p>

            <p>If you like how it feels: <a href="https://zerotoship.app/pricing?utm_source=waitlist&utm_medium=email&utm_campaign=launch" style="color: #6366f1;">claim your founding spot here</a>.</p>

            <p>I'll send one follow-up in a couple of days if you don't act on this. No drip sequence, no countdown timer, no pressure.</p>

            <p>Thank you for waiting.</p>

            <p>— Ethan</p>

            <p style="font-size: 13px; color: #888;">PS: If you try Module 1 and something breaks, reply to this email. I read every response personally. Launch-day feedback is the most valuable feedback I'll get.</p>`,
          {
            unsubscribeUrl: unsubUrl,
            footerNote: "You're receiving this because you signed up for the Zero to Ship waitlist.",
          }
        ),
      });
      sent++;
    } catch {
      // Continue with remaining emails
    }
  }

  return NextResponse.json({ sent, total: waitlistUsers.length });
}
