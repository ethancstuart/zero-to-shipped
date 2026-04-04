import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";
import { generateUnsubscribeToken } from "@/lib/email/tokens";
import { buildEmailMap } from "@/lib/supabase/list-all-users";
import { batchSendEmails } from "@/lib/email/batch-send";
import { emailWrapper, emailButton, emailLink } from "@/lib/email/templates";

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
      { lock_name: "setup-check", acquired_at: new Date().toISOString(), expires_at: lockExpiry },
      { onConflict: "lock_name" }
    )
    .select("lock_name")
    .single();

  if (!lock) {
    return NextResponse.json({ skipped: "lock held by another instance" });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Find users who signed up 20-28 hours ago (catches the 24hr window)
    const now = new Date();
    const twentyHoursAgo = new Date(now.getTime() - 20 * 60 * 60 * 1000);
    const twentyEightHoursAgo = new Date(now.getTime() - 28 * 60 * 60 * 1000);

    const { data: recentUsers, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name")
      .gte("created_at", twentyEightHoursAgo.toISOString())
      .lte("created_at", twentyHoursAgo.toISOString())
      .eq("email_opt_out", false);

    if (profilesError) {
      Sentry.captureException(profilesError);
      return NextResponse.json({ error: "Failed to query profiles" }, { status: 500 });
    }

    if (!recentUsers || recentUsers.length === 0) {
      await supabase.from("cron_locks").delete().eq("lock_name", "setup-check");
      return NextResponse.json({ sent: 0 });
    }

    // Filter out users who have completed any checkpoints
    const userIds = recentUsers.map((u) => u.id);
    const { data: usersWithProgress } = await supabase
      .from("checkpoint_progress")
      .select("user_id")
      .in("user_id", userIds);

    const usersWithProgressSet = new Set(
      (usersWithProgress ?? []).map((r) => r.user_id)
    );

    const stuckUsers = recentUsers.filter((u) => !usersWithProgressSet.has(u.id));

    if (stuckUsers.length === 0) {
      await supabase.from("cron_locks").delete().eq("lock_name", "setup-check");
      return NextResponse.json({ sent: 0 });
    }

    // Build userId -> email map
    const emailMap = await buildEmailMap(supabase);

    // Build email payloads
    const emailPayloads = stuckUsers
      .filter((user) => emailMap.has(user.id))
      .map((user) => {
        const firstName = user.display_name?.split(" ")[0] ?? "there";
        const unsubscribeUrl = `https://zerotoship.app/api/unsubscribe?token=${generateUnsubscribeToken(user.id)}`;

        return {
          from: "Zero to Ship <hello@zerotoship.app>",
          to: emailMap.get(user.id)!,
          subject: "Did you get set up okay?",
          html: emailWrapper(
            `<p>Hey ${firstName},</p>
            <p>You signed up for Zero to Ship yesterday. Just checking — did you get everything installed?</p>
            <p>If you hit any snags with Node.js, the terminal, or anything else, <strong>reply to this email</strong>. A real person reads these.</p>
            <p>Here are the 3 most common setup issues:</p>
            <ol>
              <li><strong>Node.js "command not found"</strong> — close and reopen your terminal after installing. This is the #1 gotcha.</li>
              <li><strong>Permission errors on Mac</strong> — use ${emailLink("nvm", "https://github.com/nvm-sh/nvm")} instead of installing Node directly. It avoids the sudo headaches entirely.</li>
              <li><strong>Not sure which AI tool to pick</strong> — start with ${emailLink("Claude Code", "https://docs.anthropic.com/en/docs/claude-code/overview")}. It's free and it's what the course is built around.</li>
            </ol>
            <p>If everything's working, dive into Module 1:</p>
            <p>${emailButton("Start Module 1", "https://zerotoship.app/modules/01-setup-and-first-build")}</p>
            <p>You've got this.</p>`,
            { unsubscribeUrl }
          ),
        };
      });

    const sent = await batchSendEmails(resend, emailPayloads);

    // Release lock
    await supabase.from("cron_locks").delete().eq("lock_name", "setup-check");

    return NextResponse.json({ sent, checked: recentUsers.length, stuck: stuckUsers.length });
  } catch (error) {
    Sentry.captureException(error);
    // Release lock on error
    await supabase.from("cron_locks").delete().eq("lock_name", "setup-check");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
