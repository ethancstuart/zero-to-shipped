import { NextRequest, NextResponse } from "next/server";
import {
  verifyUnsubscribeToken,
  verifyEmailUnsubscribeToken,
} from "@/lib/email/tokens";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@supabase/supabase-js";

const SUCCESS_HTML = (message: string) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed — Zero to Ship</title></head>
<body style="margin:0;padding:60px 24px;background:#0a0a0a;color:#fafafa;font-family:system-ui,sans-serif;text-align:center;">
  <div style="max-width:480px;margin:0 auto;">
    <p style="font-size:20px;color:#3b82f6;letter-spacing:0.1em;margin-bottom:24px;">ZERO TO SHIP</p>
    <h1 style="font-size:24px;margin-bottom:12px;">You&rsquo;ve been unsubscribed</h1>
    <p style="color:#a3a3a3;line-height:1.6;">${message}</p>
    <a href="https://zerotoship.app" style="display:inline-block;margin-top:24px;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Back to Zero to Ship</a>
  </div>
</body>
</html>`;

const ERROR_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Invalid Link — Zero to Ship</title></head>
<body style="margin:0;padding:60px 24px;background:#0a0a0a;color:#fafafa;font-family:system-ui,sans-serif;text-align:center;">
  <div style="max-width:480px;margin:0 auto;">
    <p style="font-size:20px;color:#3b82f6;letter-spacing:0.1em;margin-bottom:24px;">ZERO TO SHIP</p>
    <h1 style="font-size:24px;margin-bottom:12px;">Invalid or expired link</h1>
    <p style="color:#a3a3a3;line-height:1.6;">This unsubscribe link is no longer valid. If you continue to receive emails, contact <a href="mailto:hello@zerotoship.app" style="color:#6366f1;">hello@zerotoship.app</a>.</p>
  </div>
</body>
</html>`;

function html(content: string, status = 200) {
  return new NextResponse(content, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const type = request.nextUrl.searchParams.get("type") ?? "user";

  if (!token) return html(ERROR_HTML, 400);

  // ── Email-based unsubscribe (waitlist / library subscribers) ──────────────
  if (type === "email" || type === "library") {
    const email = verifyEmailUnsubscribeToken(token);
    if (!email) return html(ERROR_HTML, 400);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (type === "library") {
      await supabase.from("library_subscribers").delete().eq("email", email);
      return html(
        SUCCESS_HTML(
          "You&rsquo;ve been removed from the Builder&rsquo;s Library list. You won&rsquo;t receive any more emails."
        )
      );
    }

    // type === "email" — waitlist
    await supabase.from("waitlist").delete().eq("email", email);
    return html(
      SUCCESS_HTML(
        "You&rsquo;ve been removed from the Zero to Ship waitlist. You won&rsquo;t receive any more launch emails."
      )
    );
  }

  // ── User-based unsubscribe (authenticated users, in-app emails) ──────────
  const userId = verifyUnsubscribeToken(token);
  if (!userId) return html(ERROR_HTML, 400);

  const supabase = createAdminClient();
  await supabase
    .from("profiles")
    .update({ email_opt_out: true })
    .eq("id", userId);

  return html(
    SUCCESS_HTML(
      "You won&rsquo;t receive any more emails from Zero to Ship. You can re-enable emails in your profile settings at any time."
    )
  );
}
