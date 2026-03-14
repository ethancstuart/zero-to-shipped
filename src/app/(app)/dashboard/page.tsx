import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Flame,
  Trophy,
  ArrowRight,
  Clock,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MODULE_METADATA } from "@/lib/content/modules";
import { getXPProgress, getBadgeBySlug } from "@/lib/gamification/constants";
import { CompletionRing } from "@/components/dashboard/completion-ring";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { StreakCalendar } from "@/components/dashboard/streak-calendar";
import { RoleRecommendations } from "@/components/dashboard/role-recommendations";
import type { ModuleProgress, Badge, XPEvent, Profile, RoleTrack } from "@/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [profileRes, progressRes, badgesRes, eventsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("module_progress").select("*").eq("user_id", user.id),
    supabase.from("badges").select("*").eq("user_id", user.id),
    supabase
      .from("xp_events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const profile = profileRes.data as Profile;
  const progress = (progressRes.data ?? []) as ModuleProgress[];
  const badges = (badgesRes.data ?? []) as Badge[];
  const events = (eventsRes.data ?? []) as XPEvent[];

  const completedModules = progress.filter((p) => p.status === "completed");
  const inProgressModules = progress.filter((p) => p.status === "in_progress");
  const availableModules = progress.filter((p) => p.status === "available");
  const { current, next, progressPercent } = getXPProgress(profile.xp);

  // Next recommended module
  const nextModule = inProgressModules[0] ?? availableModules[0];
  const nextModuleMeta = nextModule
    ? MODULE_METADATA.find((m) => m.number === nextModule.module_number)
    : null;

  // Build activity map for streak calendar
  const activityMap: Record<string, number> = {};
  for (const event of events) {
    const day = event.created_at.split("T")[0];
    activityMap[day] = (activityMap[day] ?? 0) + 1;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Welcome + Completion Ring */}
      <div className="flex flex-wrap items-center gap-6">
        <CompletionRing completed={completedModules.length} total={16} />
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {profile.display_name?.split(" ")[0] ?? "Builder"}
          </h1>
          <p className="text-muted-foreground">
            Keep building. You&apos;re doing great.
          </p>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
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
      </div>

      {/* Upgrade CTA for free users */}
      {profile.subscription_tier !== "premium" && (
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div>
            <p className="font-medium">Unlock the full curriculum</p>
            <p className="text-sm text-muted-foreground">
              Get access to all 16 modules, capstone templates, and certificates.
            </p>
          </div>
          <Button render={<Link href="/pricing" />}>
            Upgrade
            <ArrowRight className="ml-1 size-4" />
          </Button>
        </div>
      )}

      {/* Share & Earn */}
      {profile.referral_code && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <Users className="size-5 text-primary" />
            <div>
              <p className="font-medium">Share &amp; Earn</p>
              <p className="text-sm text-muted-foreground">
                Invite a friend &mdash; you both earn 100 XP when they complete Module 1
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="rounded bg-muted px-2 py-1 text-xs">
              zerotoship.app?ref={profile.referral_code}
            </code>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Next Module */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">Next Up</h2>
          {nextModuleMeta ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  {nextModuleMeta.number}
                </div>
                <div>
                  <h3 className="font-medium">{nextModuleMeta.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {nextModuleMeta.description}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {nextModuleMeta.estimatedHours} hours
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                You&apos;re {16 - completedModules.length} modules from your capstone project
              </p>
              <Button
                size="sm"
                render={<Link href={`/modules/${nextModuleMeta.slug}`} />}
              >
                {nextModule?.status === "in_progress"
                  ? "Continue"
                  : "Start Module"}
                <ArrowRight className="ml-1 size-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {completedModules.length === 16
                ? "You've completed all modules! Amazing work."
                : "No modules available yet. Complete prerequisites to unlock more."}
            </p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">Recent Activity</h2>
          <ActivityFeed events={events.slice(0, 8)} />
        </div>
      </div>

      {/* Role Recommendations */}
      {profile.role_track && (
        <RoleRecommendations
          roleTrack={profile.role_track as RoleTrack}
          progress={progress}
        />
      )}

      {/* Streak Calendar */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold">Activity</h2>
        <StreakCalendar activityMap={activityMap} />
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">Badges Earned</h2>
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
                  <span className="text-xl">{def.icon}</span>
                  <span className="text-sm font-medium">{def.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
