import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/constants";
import { generateEmailUnsubscribeToken } from "@/lib/email/tokens";
import { emailWrapper, emailButton } from "@/lib/email/templates";

const limiter = rateLimit({ limit: 5, windowMs: 24 * 60 * 60 * 1000 }); // 5/day

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = limiter.check(user.id);
  if (!success) {
    return rateLimitResponse(24 * 60 * 60 * 1000);
  }

  let body: { emails: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { emails } = body;
  if (!Array.isArray(emails) || emails.length === 0 || emails.length > 5) {
    return NextResponse.json(
      { error: "Provide 1-5 email addresses" },
      { status: 400 }
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validEmails = emails.filter((e) => typeof e === "string" && emailRegex.test(e));
  if (validEmails.length === 0) {
    return NextResponse.json(
      { error: "No valid email addresses" },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, referral_code")
    .eq("id", user.id)
    .single();

  const senderName = profile?.display_name ?? "Someone";
  const referralCode = profile?.referral_code ?? user.id.slice(0, 8);
  const referralUrl = `${siteConfig.url}?ref=${referralCode}`;

  const resend = new Resend(process.env.RESEND_API_KEY);

  let sent = 0;
  for (const email of validEmails) {
    try {
      const unsubToken = generateEmailUnsubscribeToken(email);
      const unsubscribeUrl = `${siteConfig.url}/api/unsubscribe?token=${unsubToken}&type=email`;

      await resend.emails.send({
        from: "Zero to Ship <hello@zerotoship.app>",
        to: email,
        subject: `${senderName} invited you to Zero to Ship`,
        html: emailWrapper(
          `<p>Hey!</p>
            <p><strong>${senderName}</strong> thinks you'd enjoy Zero to Ship — a hands-on course where non-engineers learn to build real products with AI coding tools.</p>
            <p>The first 5 modules are free. No credit card required.</p>
            <p>${emailButton("Check it out", referralUrl)}</p>
            <p style="color: #666; font-size: 14px;">16 modules · Gamified progress · Certificate of completion</p>`,
          {
            unsubscribeUrl: unsubscribeUrl,
            footerNote: `You received this because ${senderName} invited you. This is a one-time email.`,
          }
        ),
      });
      sent++;
    } catch {
      // Continue sending to other emails if one fails
    }
  }

  return NextResponse.json({ sent });
}
