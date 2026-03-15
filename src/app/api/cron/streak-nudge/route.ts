import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Find users with streaks who haven't been active in 3+ days
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const { data: users } = await supabase
    .from("profiles")
    .select("id, display_name, current_streak")
    .gt("current_streak", 0)
    .lt("last_activity_date", threeDaysAgo.toISOString().split("T")[0]);

  if (!users || users.length === 0) {
    return NextResponse.json({ nudged: 0 });
  }

  // Get emails from auth.users via admin API
  let nudged = 0;
  for (const user of users) {
    const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
    if (!authUser?.user?.email) continue;

    try {
      await resend.emails.send({
        from: "Zero to Ship <hello@zerotoship.app>",
        to: authUser.user.email,
        subject: `Don't lose your ${user.current_streak}-day streak!`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
            <p>Hey ${user.display_name?.split(" ")[0] ?? "there"},</p>
            <p>You've got a <strong>${user.current_streak}-day streak</strong> on Zero to Ship — don't let it slip!</p>
            <p>Even one checkpoint keeps the streak alive.</p>
            <p><a href="https://zerotoship.app/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Continue Learning</a></p>
            <p style="color: #666; font-size: 14px;">— Zero to Ship</p>
          </div>
        `,
      });
      nudged++;
    } catch {
      // Skip failed sends
    }
  }

  return NextResponse.json({ nudged });
}
