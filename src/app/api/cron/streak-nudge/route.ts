import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateUnsubscribeToken } from "@/lib/email/tokens";

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

  // Acquire lock to prevent duplicate runs from concurrent instances
  const lockExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min
  const { data: lock } = await supabase
    .from("cron_locks")
    .upsert(
      { lock_name: "streak-nudge", acquired_at: new Date().toISOString(), expires_at: lockExpiry },
      { onConflict: "lock_name" }
    )
    .select("lock_name")
    .single();

  // If upsert returned nothing, another instance holds a valid lock
  if (!lock) {
    return NextResponse.json({ skipped: "lock held by another instance" });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Find users with streaks who haven't been active in 3+ days
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const { data: users } = await supabase
    .from("profiles")
    .select("id, display_name, current_streak")
    .gt("current_streak", 0)
    .lt("last_activity_date", threeDaysAgo.toISOString().split("T")[0])
    .eq("email_opt_out", false);

  if (!users || users.length === 0) {
    await supabase.from("cron_locks").delete().eq("lock_name", "streak-nudge");
    return NextResponse.json({ nudged: 0 });
  }

  // Batch fetch all emails upfront instead of N+1 getUserById calls
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map<string, string>();
  if (authData?.users) {
    for (const u of authData.users) {
      if (u.email) emailMap.set(u.id, u.email);
    }
  }

  let nudged = 0;
  for (const user of users) {
    const email = emailMap.get(user.id);
    if (!email) continue;

    try {
      await resend.emails.send({
        from: "Zero to Ship <hello@zerotoship.app>",
        to: email,
        subject: `Don't lose your ${user.current_streak}-day streak!`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
            <p>Hey ${user.display_name?.split(" ")[0] ?? "there"},</p>
            <p>You've got a <strong>${user.current_streak}-day streak</strong> on Zero to Ship — don't let it slip!</p>
            <p>Even one checkpoint keeps the streak alive.</p>
            <p><a href="https://zerotoship.app/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Continue Learning</a></p>
            <p style="color: #666; font-size: 14px;">— Zero to Ship</p>
            <p style="color: #999; font-size: 12px; margin-top: 24px; border-top: 1px solid #333; padding-top: 12px;">
              <a href="https://zerotoship.app/api/unsubscribe?token=${generateUnsubscribeToken(user.id)}" style="color: #999;">Unsubscribe</a>
            </p>
          </div>
        `,
      });
      nudged++;
    } catch {
      // Skip failed sends
    }
  }

  // Release lock
  await supabase.from("cron_locks").delete().eq("lock_name", "streak-nudge");

  return NextResponse.json({ nudged });
}
