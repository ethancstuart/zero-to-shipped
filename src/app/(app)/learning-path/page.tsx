import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MODULE_METADATA } from "@/lib/content/modules";
import { cn } from "@/lib/utils";
import type { ModuleProgress, Profile, RoleTrack } from "@/types";

export const metadata = { title: "Learning Path" };

const ROLE_LABELS: Record<RoleTrack, string> = {
  pm: "Product Manager",
  pjm: "Project Manager",
  ba: "Business Analyst",
  bi: "Business Intelligence",
};

export default async function LearningPathPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [profileRes, progressRes] = await Promise.all([
    supabase.from("profiles").select("role_track, subscription_tier").eq("id", user.id).single(),
    supabase.from("module_progress").select("*").eq("user_id", user.id),
  ]);

  const profile = profileRes.data as Pick<Profile, "role_track" | "subscription_tier">;
  const progress = (progressRes.data ?? []) as ModuleProgress[];
  const progressMap = new Map(progress.map((p) => [p.module_number, p]));

  if (profile.subscription_tier !== "premium") {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <Lock className="mx-auto mb-4 size-12 text-muted-foreground/30" />
        <h1 className="mb-2 text-xl font-bold">Premium Feature</h1>
        <p className="mb-6 text-muted-foreground">
          Role-specific learning paths are available with Full Access.
          Get a curated program designed for your role.
        </p>
        <Button render={<Link href="/pricing" />}>
          Upgrade to Full Access
          <ArrowRight className="ml-1 size-4" />
        </Button>
      </div>
    );
  }

  const roleTrack = profile.role_track as RoleTrack | null;

  if (!roleTrack) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <h1 className="mb-2 text-xl font-bold">Set Your Role First</h1>
        <p className="mb-6 text-muted-foreground">
          Select a role track in your profile to get a personalized learning path.
        </p>
        <Button render={<Link href="/profile" />}>Go to Profile</Button>
      </div>
    );
  }

  // Sort modules by relevance: core → recommended → optional
  const relevanceOrder = { core: 0, recommended: 1, optional: 2 };
  const sortedModules = [...MODULE_METADATA].sort((a, b) => {
    const aRel = a.roleRelevance[roleTrack];
    const bRel = b.roleRelevance[roleTrack];
    return relevanceOrder[aRel] - relevanceOrder[bRel];
  });

  const coreModules = sortedModules.filter((m) => m.roleRelevance[roleTrack] === "core");
  const recommendedModules = sortedModules.filter((m) => m.roleRelevance[roleTrack] === "recommended");
  const optionalModules = sortedModules.filter((m) => m.roleRelevance[roleTrack] === "optional");

  const coreCompleted = coreModules.filter((m) => progressMap.get(m.number)?.status === "completed").length;
  const recCompleted = recommendedModules.filter((m) => progressMap.get(m.number)?.status === "completed").length;

  const renderModuleList = (modules: typeof MODULE_METADATA) =>
    modules.map((mod) => {
      const mp = progressMap.get(mod.number);
      const status = mp?.status ?? "locked";
      const isCompleted = status === "completed";

      return (
        <Link
          key={mod.number}
          href={`/modules/${mod.slug}`}
          className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/30"
        >
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              isCompleted
                ? "bg-green-500/10 text-green-500"
                : "bg-muted text-muted-foreground"
            )}
          >
            {mod.number}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{mod.title}</p>
            <p className="text-xs text-muted-foreground">
              {mod.estimatedHours}h · {mod.tier}
            </p>
          </div>
          {isCompleted ? (
            <CheckCircle2 className="size-4 shrink-0 text-green-500" />
          ) : (
            <Circle className="size-4 shrink-0 text-muted-foreground/40" />
          )}
        </Link>
      );
    });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Learning Path: {ROLE_LABELS[roleTrack]}
        </h1>
        <p className="text-muted-foreground">
          A curated module sequence designed for your role. Start with core
          modules, then expand with recommended content.
        </p>
      </div>

      {/* Core */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
            Core ({coreCompleted}/{coreModules.length})
          </h2>
        </div>
        <div className="space-y-2">{renderModuleList(coreModules)}</div>
      </div>

      {/* Recommended */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
            Recommended ({recCompleted}/{recommendedModules.length})
          </h2>
        </div>
        <div className="space-y-2">{renderModuleList(recommendedModules)}</div>
      </div>

      {/* Optional */}
      {optionalModules.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Optional
          </h2>
          <div className="space-y-2">{renderModuleList(optionalModules)}</div>
        </div>
      )}
    </div>
  );
}
