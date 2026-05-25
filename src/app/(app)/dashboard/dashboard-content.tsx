import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/cached-queries";
import { redirect } from "next/navigation";
import {
  Award,
  Flame,
  Trophy,
  ArrowRight,
  Zap,
  Layers,
  BookOpen,
  Wrench,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getXPProgress, getBadgeBySlug } from "@/lib/gamification/constants";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { StreakCalendar } from "@/components/dashboard/streak-calendar";
import { EmptyState } from "@/components/ui/empty-state";
import { CopyReferralLink } from "./copy-referral-link";
import type { Badge, XPEvent } from "@/types";

const PILLARS = [
  {
    href: "/pulse",
    label: "Pulse",
    description: "AI tool news and weekly releases",
    icon: Zap,
  },
  {
    href: "/build",
    label: "Build",
    description: "Project walkthroughs and build challenges",
    icon: Layers,
  },
  {
    href: "/learn",
    label: "Learn",
    description: "Lessons and structured curriculum",
    icon: BookOpen,
  },
  {
    href: "/system",
    label: "System",
    description: "Workflows, templates, and cheat sheets",
    icon: Wrench,
  },
];

export async function DashboardContent({ userId }: { userId: string }) {
  const supabase = await createClient();

  const [profile, badgesRes, eventsRes] = await Promise.all([
    getProfile(userId),
    supabase.from("badges").select("id, badge_slug").eq("user_id", userId),
    supabase
      .from("xp_events")
      .select("event_type, xp_amount, metadata, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (!profile) redirect("/");
  const badges = (badgesRes.data ?? []) as Badge[];
  const events = (eventsRes.data ?? []) as XPEvent[];

  const { current, next, progressPercent } = getXPProgress(profile.xp);

  const activityMap: Record<string, number> = {};
  for (const event of events) {
    const day = event.created_at.split("T")[0];
    activityMap[day] = (activityMap[day] ?? 0) + 1;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {profile.display_name?.split(" ")[0] ?? "Builder"}
        </h1>
        <p className="text-muted-foreground">Keep building.</p>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Trophy className="size-4 text-primary" />
            {current.title} &middot; {profile.xp} XP
          </span>
          <span className="flex items-center gap-1">
            <Flame className="size-4 text-orange-500" />
            {profile.current_streak}d streak
          </span>
        </div>
        {next && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {next.xpRequired - profile.xp} XP to {next.title}
            </span>
          </div>
        )}
      </div>

      {/* Upgrade CTA for free users */}
      {profile.subscription_tier !== "premium" && (
        <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Unlock the full curriculum</p>
            <p className="text-sm text-muted-foreground">
              Get access to all lessons, capstone templates, and certificates.
            </p>
          </div>
          <Button className="w-full shrink-0 sm:w-auto" render={<Link href="/pricing" />}>
            Upgrade
            <ArrowRight className="ml-1 size-4" />
          </Button>
        </div>
      )}

      {/* Share & Earn */}
      {profile.referral_code && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Users className="size-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Share &amp; Earn</p>
              <p className="text-sm text-muted-foreground">
                Invite a friend &mdash; you both earn 100 XP when they start learning
              </p>
            </div>
          </div>
          <CopyReferralLink referralCode={profile.referral_code} />
        </div>
      )}

      {/* Pillar links */}
      <div>
        <h2 className="mb-4 font-semibold">Explore</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <Link
              key={pillar.href}
              href={pillar.href}
              className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <pillar.icon className="size-5 text-primary" />
              <div>
                <p className="font-semibold text-sm group-hover:text-primary">
                  {pillar.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pillar.description}
                </p>
              </div>
              <ArrowRight className="mt-auto size-3.5 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stats */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">Your Progress</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-2xl font-bold text-primary">{profile.xp}</div>
              <div className="mt-1 text-xs text-muted-foreground">Total XP</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {profile.current_streak}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Day streak</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-2xl font-bold text-primary">{current.level}</div>
              <div className="mt-1 text-xs text-muted-foreground">Level</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-2xl font-bold text-primary">{badges.length}</div>
              <div className="mt-1 text-xs text-muted-foreground">Badges</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">Recent Activity</h2>
          <ActivityFeed events={events.slice(0, 8)} />
        </div>
      </div>

      {/* Streak Calendar */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold">Activity</h2>
        <StreakCalendar activityMap={activityMap} />
      </div>

      {/* Badges */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold">Badges Earned</h2>
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => {
              const def = getBadgeBySlug(badge.badge_slug);
              if (!def) return null;
              return (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2"
                  title={def.description}
                >
                  <span
                    className="text-xl"
                    role="img"
                    aria-label={`${def.name} badge`}
                  >
                    {def.icon}
                  </span>
                  <span className="text-sm font-medium">{def.name}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Award}
            title="No badges yet"
            description="Complete lessons and hit streaks to earn badges."
          />
        )}
      </div>
    </div>
  );
}
