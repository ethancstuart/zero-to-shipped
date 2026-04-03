import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateUnsubscribeToken } from "@/lib/email/tokens";
import { buildEmailMap } from "@/lib/supabase/list-all-users";
import { batchSendEmails } from "@/lib/email/batch-send";
import { emailWrapper, emailButton } from "@/lib/email/templates";

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

  // Paginated fetch of all auth users to build userId -> email map
  const emailMap = await buildEmailMap(supabase);

  // Collect all emails for batch sending
  const emailPayloads = users
    .filter((user) => emailMap.has(user.id))
    .map((user) => ({
      from: "Zero to Ship <hello@zerotoship.app>",
      to: emailMap.get(user.id)!,
      subject: `Don't lose your ${user.current_streak}-day streak!`,
      html: emailWrapper(
        `<p>Hey ${user.display_name?.split(" ")[0] ?? "there"},</p>
          <p>You've got a <strong>${user.current_streak}-day streak</strong> on Zero to Ship — don't let it slip!</p>
          <p>Even one checkpoint keeps the streak alive.</p>
          <p>${emailButton("Continue Learning", "https://zerotoship.app/dashboard")}</p>`,
        { unsubscribeUrl: `https://zerotoship.app/api/unsubscribe?token=${generateUnsubscribeToken(user.id)}` }
      ),
    }));

  const nudged = await batchSendEmails(resend, emailPayloads);

  // Release lock
  await supabase.from("cron_locks").delete().eq("lock_name", "streak-nudge");

  return NextResponse.json({ nudged });
}
