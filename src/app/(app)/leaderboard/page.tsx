import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Profile, RoleTrack } from "@/types";

export const metadata = { title: "Leaderboard" };

const ROLE_LABELS: Record<RoleTrack, string> = {
  pm: "Product Manager",
  pjm: "Project Manager",
  ba: "Business Analyst",
  bi: "Business Intelligence",
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role: roleFilter } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, xp")
    .eq("id", user.id)
    .single();

  const isPremium = (profile as Pick<Profile, "subscription_tier" | "xp">)?.subscription_tier === "premium";

  // Fetch leaderboard
  let query = supabase
    .from("profiles")
    .select("id, display_name, avatar_url, xp, level, role_track")
    .eq("public_profile", true)
    .order("xp", { ascending: false });

  if (isPremium && roleFilter && ["pm", "pjm", "ba", "bi"].includes(roleFilter)) {
    query = query.eq("role_track", roleFilter);
  }

  const limit = isPremium ? 50 : 10;
  const { data: leaders } = await query.limit(limit);
  const leaderboard = (leaders ?? []) as Pick<Profile, "id" | "display_name" | "avatar_url" | "xp" | "level" | "role_track">[];

  // Find user's rank
  const { count: higherCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gt("xp", profile?.xp ?? 0);

  const userRank = (higherCount ?? 0) + 1;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">
            Top learners by XP{!isPremium && " (showing top 10)"}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Trophy className="size-4 text-primary" />
          <span className="text-sm font-medium">Your rank: #{userRank}</span>
        </div>
      </div>

      {/* Role filter (premium only) */}
      {isPremium && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!roleFilter ? "default" : "outline"}
            size="sm"
            render={<Link href="/leaderboard" />}
          >
            All
          </Button>
          {(["pm", "pjm", "ba", "bi"] as RoleTrack[]).map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? "default" : "outline"}
              size="sm"
              render={<Link href={`/leaderboard?role=${role}`} />}
            >
              {ROLE_LABELS[role]}
            </Button>
          ))}
        </div>
      )}

      {/* Leaderboard list */}
      <div className="rounded-xl border border-border bg-card">
        {leaderboard.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No public profiles yet. Enable your public profile to appear here!
          </p>
        ) : (
          <div className="divide-y divide-border">
            {leaderboard.map((leader, index) => {
              const isCurrentUser = leader.id === user.id;
              return (
                <div
                  key={leader.id}
                  className={`flex items-center gap-4 p-4 ${isCurrentUser ? "bg-primary/5" : ""}`}
                >
                  <span className="w-8 text-center text-sm font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {leader.display_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {leader.display_name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-primary">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {leader.level}
                      {leader.role_track && ` · ${ROLE_LABELS[leader.role_track as RoleTrack]}`}
                    </p>
                  </div>
                  <span className="text-sm font-bold">{leader.xp} XP</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!isPremium && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            Upgrade to see the full leaderboard with role-specific filtering.
          </p>
          <Button size="sm" render={<Link href="/pricing" />}>
            Upgrade to Full Access
          </Button>
        </div>
      )}
    </div>
  );
}
