import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Flame,
  Trophy,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MODULE_METADATA } from "@/lib/content/modules";
import { getXPProgress, BADGES, getBadgeBySlug } from "@/lib/gamification/constants";
import type { ModuleProgress, Badge, XPEvent, Profile } from "@/types";

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
      .limit(10),
  ]);

  const profile = profileRes.data as Profile;
  const progress = (progressRes.data ?? []) as ModuleProgress[];
  const badges = (badgesRes.data ?? []) as Badge[];
  const events = (eventsRes.data ?? []) as XPEvent[];

  const completedModules = progress.filter((p) => p.status === "completed");
  const inProgressModules = progress.filter((p) => p.status === "in_progress");
  const availableModules = progress.filter((p) => p.status === "available");
  const { current, next, progressPercent } = getXPProgress(profile.xp);

  // Find next recommended module
  const nextModule =
    inProgressModules[0] ??
    availableModules[0];
  const nextModuleMeta = nextModule
    ? MODULE_METADATA.find((m) => m.number === nextModule.module_number)
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {profile.display_name?.split(" ")[0] ?? "Builder"}
        </h1>
        <p className="text-muted-foreground">
          Keep building. You&apos;re doing great.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="size-4" />
            Modules Completed
          </div>
          <p className="text-3xl font-bold">
            {completedModules.length}
            <span className="text-base font-normal text-muted-foreground">
              /16
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="size-4" />
            Level
          </div>
          <p className="text-3xl font-bold">{current.title}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="size-4" />
            Current Streak
          </div>
          <p className="text-3xl font-bold">
            {profile.current_streak}
            <span className="text-base font-normal text-muted-foreground">
              {" "}
              days
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4" />
            Badges Earned
          </div>
          <p className="text-3xl font-bold">
            {badges.length}
            <span className="text-base font-normal text-muted-foreground">
              /18
            </span>
          </p>
        </div>
      </div>

      {/* Next Steps & Recent Activity */}
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
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {event.event_type === "checkpoint" && "Completed checkpoint"}
                    {event.event_type === "module_complete" && "Finished module"}
                    {event.event_type === "streak_bonus" && "Streak bonus"}
                    {event.event_type === "badge_earned" && "Badge earned"}
                    {event.event_type === "tier_complete" && "Tier completed"}
                    {event.event_type === "capstone" && "Capstone completed"}
                  </span>
                  <span className="font-medium text-primary">
                    +{event.xp_amount} XP
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No activity yet. Start your first module!
            </p>
          )}
        </div>
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
