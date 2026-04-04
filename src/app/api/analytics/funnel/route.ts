import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "ethan@zerotoship.app";

export async function GET(request: NextRequest) {
  // Auth: accept either CRON_SECRET bearer token or admin session cookie
  const authHeader = request.headers.get("authorization");
  const hasCronAuth = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!hasCronAuth) {
    // Fall back to checking Supabase session for admin email
    try {
      const serverSupabase = await createServerClient();
      const { data: { user } } = await serverSupabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // All-time counts
  const [totalProfilesRes, premiumRes] = await Promise.all([
    // Total signups
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),
    // Premium users (paid)
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("subscription_tier", "premium"),
  ]);

  // Distinct users with at least 1 checkpoint (the count above may double-count)
  const { data: distinctCheckpointUsers } = await supabase
    .from("checkpoint_progress")
    .select("user_id")
    .eq("completed", true);
  const uniqueCheckpointUsers = new Set(
    (distinctCheckpointUsers ?? []).map((r: { user_id: string }) => r.user_id)
  ).size;

  // Distinct users who completed Module 1
  const { data: distinctMod1Users } = await supabase
    .from("module_progress")
    .select("user_id")
    .eq("module_number", 1)
    .eq("status", "completed");
  const uniqueMod1Users = new Set(
    (distinctMod1Users ?? []).map((r: { user_id: string }) => r.user_id)
  ).size;

  // Distinct users who completed Module 5
  const { data: distinctMod5Users } = await supabase
    .from("module_progress")
    .select("user_id")
    .eq("module_number", 5)
    .eq("status", "completed");
  const uniqueMod5Users = new Set(
    (distinctMod5Users ?? []).map((r: { user_id: string }) => r.user_id)
  ).size;

  // 7-day window
  const [signups7dRes, checkpoints7dRes, mod1_7dRes, mod5_7dRes, premium7dRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo),
      supabase
        .from("checkpoint_progress")
        .select("user_id")
        .eq("completed", true)
        .gte("completed_at", sevenDaysAgo),
      supabase
        .from("module_progress")
        .select("user_id")
        .eq("module_number", 1)
        .eq("status", "completed")
        .gte("completed_at", sevenDaysAgo),
      supabase
        .from("module_progress")
        .select("user_id")
        .eq("module_number", 5)
        .eq("status", "completed")
        .gte("completed_at", sevenDaysAgo),
      // Premium users who signed up in last 7 days
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("subscription_tier", "premium")
        .gte("created_at", sevenDaysAgo),
    ]);

  // 30-day window
  const [signups30dRes, checkpoints30dRes, mod1_30dRes, mod5_30dRes, premium30dRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo),
      supabase
        .from("checkpoint_progress")
        .select("user_id")
        .eq("completed", true)
        .gte("completed_at", thirtyDaysAgo),
      supabase
        .from("module_progress")
        .select("user_id")
        .eq("module_number", 1)
        .eq("status", "completed")
        .gte("completed_at", thirtyDaysAgo),
      supabase
        .from("module_progress")
        .select("user_id")
        .eq("module_number", 5)
        .eq("status", "completed")
        .gte("completed_at", thirtyDaysAgo),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("subscription_tier", "premium")
        .gte("created_at", thirtyDaysAgo),
    ]);

  function distinctCount(data: { user_id: string }[] | null): number {
    return new Set((data ?? []).map((r) => r.user_id)).size;
  }

  function rate(numerator: number, denominator: number): string {
    if (denominator === 0) return "0.0";
    return ((numerator / denominator) * 100).toFixed(1);
  }

  const allTime = {
    signups: totalProfilesRes.count ?? 0,
    started: uniqueCheckpointUsers,
    module1Completed: uniqueMod1Users,
    module5Completed: uniqueMod5Users,
    paid: premiumRes.count ?? 0,
  };

  const last7d = {
    signups: signups7dRes.count ?? 0,
    started: distinctCount(checkpoints7dRes.data as { user_id: string }[] | null),
    module1Completed: distinctCount(mod1_7dRes.data as { user_id: string }[] | null),
    module5Completed: distinctCount(mod5_7dRes.data as { user_id: string }[] | null),
    paid: premium7dRes.count ?? 0,
  };

  const last30d = {
    signups: signups30dRes.count ?? 0,
    started: distinctCount(checkpoints30dRes.data as { user_id: string }[] | null),
    module1Completed: distinctCount(mod1_30dRes.data as { user_id: string }[] | null),
    module5Completed: distinctCount(mod5_30dRes.data as { user_id: string }[] | null),
    paid: premium30dRes.count ?? 0,
  };

  function buildRates(data: typeof allTime) {
    return {
      signupToStarted: rate(data.started, data.signups),
      startedToMod1: rate(data.module1Completed, data.started),
      mod1ToMod5: rate(data.module5Completed, data.module1Completed),
      mod5ToPaid: rate(data.paid, data.module5Completed),
      overallSignupToPaid: rate(data.paid, data.signups),
    };
  }

  return NextResponse.json({
    generatedAt: now.toISOString(),
    allTime: { ...allTime, rates: buildRates(allTime) },
    last7d: { ...last7d, rates: buildRates(last7d) },
    last30d: { ...last30d, rates: buildRates(last30d) },
  });
}
