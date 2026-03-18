import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle2, PlayCircle, Circle } from "lucide-react";
import { MODULE_METADATA } from "@/lib/content/modules";
import { TIER_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ModuleProgress, ModuleTier, Profile } from "@/types";

export const metadata = { title: "Modules" };

const STATUS_ICONS = {
  locked: Lock,
  available: Circle,
  in_progress: PlayCircle,
  completed: CheckCircle2,
};

const STATUS_COLORS = {
  locked: "text-muted-foreground/40",
  available: "text-muted-foreground",
  in_progress: "text-primary",
  completed: "text-green-500",
};

export default async function ModulesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [profileRes, progressRes] = await Promise.all([
    supabase.from("profiles").select("role_track").eq("id", user.id).single(),
    supabase.from("module_progress").select("module_number, status").eq("user_id", user.id),
  ]);

  const profile = profileRes.data as Pick<Profile, "role_track">;
  const progress = (progressRes.data ?? []) as ModuleProgress[];
  const progressMap = new Map(progress.map((p) => [p.module_number, p]));

  const tiers: ModuleTier[] = ["foundations", "intermediate", "advanced", "capstone"];

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Modules</h1>
        <p className="text-muted-foreground">
          Work through each tier to unlock the next. Complete prerequisites to
          access new modules.
        </p>
      </div>

      {tiers.map((tier) => {
        const modules = MODULE_METADATA.filter((m) => m.tier === tier);
        return (
          <div key={tier}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
              {TIER_LABELS[tier]}
            </h2>
            <div className="space-y-3">
              {modules.map((mod) => {
                const mp = progressMap.get(mod.number);
                const status = mp?.status ?? "locked";
                const isLocked = status === "locked";
                const StatusIcon = STATUS_ICONS[status];
                const relevance =
                  profile.role_track
                    ? mod.roleRelevance[profile.role_track as keyof typeof mod.roleRelevance]
                    : null;

                const content = (
                  <div
                    className={cn(
                      "flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors",
                      isLocked
                        ? "opacity-50"
                        : "hover:border-primary/30 hover:bg-card/80"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full",
                        status === "completed"
                          ? "bg-green-500/10"
                          : status === "in_progress"
                          ? "bg-primary/10"
                          : "bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-bold",
                          status === "completed"
                            ? "text-green-500"
                            : status === "in_progress"
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        {mod.number}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{mod.title}</h3>
                        {relevance && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-medium",
                              relevance === "core"
                                ? "bg-primary/10 text-primary"
                                : relevance === "recommended"
                                ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {relevance}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {mod.description}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{mod.estimatedHours} hours</span>
                        <span>{mod.checkpoints.length} checkpoints</span>
                      </div>
                    </div>
                    <StatusIcon
                      className={cn("size-5 shrink-0", STATUS_COLORS[status])}
                    />
                  </div>
                );

                if (isLocked) return <div key={mod.number}>{content}</div>;
                return (
                  <Link key={mod.number} href={`/modules/${mod.slug}`}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
