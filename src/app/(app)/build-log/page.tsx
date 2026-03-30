import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MODULE_METADATA } from "@/lib/content/modules";
import { BuildLogPDF } from "@/components/build-log/build-log-pdf";
import type { ModuleProgress, Profile, RoleTrack } from "@/types";

export const metadata = { title: "Build Log" };

export default async function BuildLogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [profileRes, progressRes] = await Promise.all([
    supabase.from("profiles").select("subscription_tier, display_name, role_track, xp, level").eq("id", user.id).single(),
    supabase
      .from("module_progress")
      .select("module_number, completed_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: true }),
  ]);

  const profile = profileRes.data as Profile;
  const completedModules = (progressRes.data ?? []) as ModuleProgress[];

  if (profile.subscription_tier !== "premium") {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <Lock className="mx-auto mb-4 size-12 text-muted-foreground/30" />
        <h1 className="mb-2 text-xl font-bold">Premium Feature</h1>
        <p className="mb-6 text-muted-foreground">
          Your Build Log is an exportable portfolio of everything you&apos;ve built.
          Upgrade to Full Access to unlock it.
        </p>
        <Button render={<Link href="/pricing" />}>
          Upgrade to Full Access
          <ArrowRight className="ml-1 size-4" />
        </Button>
      </div>
    );
  }

  const moduleDetails = completedModules.map((mp) => {
    const meta = MODULE_METADATA.find((m) => m.number === mp.module_number);
    return {
      number: mp.module_number,
      title: meta?.title ?? `Module ${mp.module_number}`,
      tier: meta?.tier ?? "foundations",
      checkpoints: meta?.checkpoints ?? [],
      completedAt: mp.completed_at,
    };
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Build Log</h1>
          <p className="text-muted-foreground">
            Everything you&apos;ve built across {completedModules.length} modules.
          </p>
        </div>
        <BuildLogPDF
          displayName={profile.display_name ?? "Learner"}
          roleTrack={profile.role_track as RoleTrack | null}
          modules={moduleDetails}
          xp={profile.xp}
          level={profile.level}
        />
      </div>

      {completedModules.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <FileText className="mx-auto mb-4 size-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            Complete modules to start building your log. Each module adds to
            your portfolio.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            render={<Link href="/modules" />}
          >
            Go to Modules
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {moduleDetails.map((mod) => (
            <div
              key={mod.number}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-green-500/10 text-sm font-bold text-green-500">
                  {mod.number}
                </div>
                <div>
                  <h3 className="font-medium">{mod.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {mod.tier} ·{" "}
                    {mod.completedAt
                      ? new Date(mod.completedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Completed"}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                {mod.checkpoints.map((cp, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-green-500" />
                    {cp}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
