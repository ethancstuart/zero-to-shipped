import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { emailWrapper, emailButton } from "@/lib/email/templates";
import { generateEmailUnsubscribeToken } from "@/lib/email/tokens";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { email?: string };
  const email = (body.email ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: dbError } = await supabase
    .from("waitlist")
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

  if (dbError) {
    console.error("[waitlist] db error:", dbError.message);
    return NextResponse.json({ error: "Subscribe failed" }, { status: 500 });
  }

  // Welcome email — non-fatal if Resend isn't configured yet
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const unsubToken = generateEmailUnsubscribeToken(email);
    const unsubUrl = `https://zerotoship.app/api/unsubscribe?token=${unsubToken}&type=email`;

    try {
      await resend.emails.send({
        from: "Zero to Ship <hello@zerotoship.app>",
        to: email,
        subject: "You're on the list — Zero to Ship opens April 28",
        html: emailWrapper(
          `<p>You&apos;re on the list.</p>

          <p>Zero to Ship opens <strong>Monday, April 28</strong>. Founding member pricing is <strong>$99 one-time</strong> (standard: $199) — limited to 200 spots.</p>

          <p>You&apos;ll get one email when doors open. That&apos;s it.</p>

          <p>While you wait — the Builder&apos;s Library is free and available right now. 44 prompts, 4 CLAUDE.md templates, and 6 guides for building with AI. No account required.</p>

          <p style="text-align: center; margin: 28px 0;">
            ${emailButton("Browse the Builder&apos;s Library", "https://zerotoship.app/library?utm_source=waitlist&utm_medium=email&utm_campaign=welcome", { large: true })}
          </p>

          <p>Or jump straight in — <a href="https://zerotoship.app/preview/module-1?utm_source=waitlist&utm_medium=email&utm_campaign=welcome" style="color: #6366f1;">Module 1 is completely free</a>. No sign-up needed.</p>`,
          {
            unsubscribeUrl: unsubUrl,
            footerNote: "You&apos;re receiving this because you joined the Zero to Ship waitlist.",
          }
        ),
      });
    } catch (err) {
      console.error("[waitlist] email error:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
