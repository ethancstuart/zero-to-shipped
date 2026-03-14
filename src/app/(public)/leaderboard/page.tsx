import { Trophy } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/layout/login-button";
import { ROLE_LABELS } from "@/lib/constants";
import type { Profile, RoleTrack } from "@/types";

export const metadata = { title: "Leaderboard" };

function anonymizeName(name: string | null): string {
  if (!name) return "Learner";
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

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

  let userProfile: Pick<Profile, "subscription_tier" | "xp"> | null = null;
  let userRank: number | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier, xp")
      .eq("id", user.id)
      .single();
    userProfile = profile as Pick<Profile, "subscription_tier" | "xp"> | null;

    if (userProfile) {
      const { count: higherCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gt("xp", userProfile.xp ?? 0);
      userRank = (higherCount ?? 0) + 1;
    }
  }

  const isPremium = userProfile?.subscription_tier === "premium";

  // Fetch leaderboard
  let query = supabase
    .from("profiles")
    .select("id, display_name, avatar_url, xp, level, role_track")
    .eq("public_profile", true)
    .order("xp", { ascending: false });

  if (isPremium && roleFilter && ["pm", "pjm", "ba", "bi"].includes(roleFilter)) {
    query = query.eq("role_track", roleFilter);
  }

  const limit = user ? (isPremium ? 50 : 25) : 25;
  const { data: leaders } = await query.limit(limit);
  const leaderboard = (leaders ?? []) as Pick<
    Profile,
    "id" | "display_name" | "avatar_url" | "xp" | "level" | "role_track"
  >[];

  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="size-6 text-primary" />
              <h1 className="text-2xl font-bold">Leaderboard</h1>
            </div>
            <p className="text-muted-foreground">
              Top builders ranked by XP. Ship modules, earn badges, climb the ranks.
            </p>
          </div>
          {userRank !== null && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <Trophy className="size-4 text-primary" />
              <span className="text-sm font-medium">Your rank: #{userRank}</span>
            </div>
          )}
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
        {leaderboard.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No public profiles yet. Be the first!
          </p>
        ) : (
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {leaderboard.map((leader, index) => {
              const rank = index + 1;
              const isCurrentUser = user?.id === leader.id;
              const displayName = user
                ? (leader.display_name ?? "Learner")
                : anonymizeName(leader.display_name);

              return (
                <div
                  key={leader.id}
                  className={`flex items-center gap-4 p-4 ${
                    isCurrentUser ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="w-8 text-center text-sm font-bold text-muted-foreground">
                    {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {leader.display_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {displayName}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-primary">You</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {leader.level}
                      {leader.role_track && (
                        <> &middot; {ROLE_LABELS[leader.role_track as RoleTrack]}</>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {leader.xp.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA for non-logged-in users */}
        {!user && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
            <p className="mb-4 font-medium">
              Sign up free to see your rank and start earning XP
            </p>
            <LoginButton />
          </div>
        )}

        {/* Upgrade prompt for free authenticated users */}
        {user && !isPremium && (
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
    </div>
  );
}
