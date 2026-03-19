import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/email/tokens";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }

  const userId = verifyUnsubscribeToken(token);

  if (!userId) {
    return new NextResponse("Invalid or expired token", { status: 400 });
  }

  const supabase = createAdminClient();
  await supabase
    .from("profiles")
    .update({ email_opt_out: true })
    .eq("id", userId);

  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed — Zero to Ship</title></head>
<body style="margin:0;padding:60px 24px;background:#0a0a0a;color:#fafafa;font-family:system-ui,sans-serif;text-align:center;">
  <div style="max-width:480px;margin:0 auto;">
    <p style="font-size:20px;color:#3b82f6;letter-spacing:0.1em;margin-bottom:24px;">ZERO TO SHIPPED</p>
    <h1 style="font-size:24px;margin-bottom:12px;">You&rsquo;ve been unsubscribed</h1>
    <p style="color:#a3a3a3;line-height:1.6;">You won&rsquo;t receive any more emails from Zero to Ship. You can re-enable emails in your profile settings at any time.</p>
    <a href="https://zerotoship.app/dashboard" style="display:inline-block;margin-top:24px;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Go to Dashboard</a>
  </div>
</body>
</html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}
