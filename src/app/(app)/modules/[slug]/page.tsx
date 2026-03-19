import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Lock } from "lucide-react";
import { MODULE_METADATA, getModuleBySlug } from "@/lib/content/modules";
import { CheckpointList } from "@/components/modules/checkpoint-list";
import { ToolToggle } from "@/components/modules/tool-toggle";
import { ModuleContent } from "@/components/modules/module-content";
import { Button } from "@/components/ui/button";
import { ToolSetupBanner } from "@/components/modules/tool-setup-banner";
import { CapstoneSuggestions } from "@/components/modules/capstone-suggestions";
import { canAccessModule } from "@/lib/content/tiers";
import { PremiumGate } from "@/components/modules/premium-gate";
import { siteConfig } from "@/lib/constants";
import type { ModuleProgress, CheckpointProgress, Profile, RoleTrack, SubscriptionTier } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const mod = getModuleBySlug(slug);
  if (!mod) return { title: "Module Not Found" };

  const ogUrl = `${siteConfig.url}/api/og?template=module&number=${mod.number}&title=${encodeURIComponent(mod.title)}&tier=${mod.tier}`;

  return {
    title: `Module ${mod.number}: ${mod.title}`,
    openGraph: { images: [{ url: ogUrl, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image" as const, images: [ogUrl] },
  };
}

export default async function ModuleReaderPage({ params }: Props) {
  const { slug } = await params;
  const mod = getModuleBySlug(slug);
  if (!mod) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [profileRes, progressRes, checkpointsRes, allProgressRes] = await Promise.all([
    supabase.from("profiles").select("tool_preference, role_track, subscription_tier").eq("id", user.id).single(),
    supabase
      .from("module_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("module_number", mod.number)
      .single(),
    supabase
      .from("checkpoint_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("module_number", mod.number)
      .eq("completed", true),
    supabase
      .from("module_progress")
      .select("module_number")
      .eq("user_id", user.id)
      .eq("status", "completed"),
  ]);

  const profile = profileRes.data as Pick<Profile, "tool_preference" | "role_track" | "subscription_tier">;
  const moduleProgress = progressRes.data as ModuleProgress | null;
  const completedCheckpoints = (checkpointsRes.data ?? []) as CheckpointProgress[];
  const completedIndexes = completedCheckpoints.map((c) => c.checkpoint_index);
  const totalCompletedModules = allProgressRes.data?.length ?? 0;

  // Check if module is accessible
  if (moduleProgress?.status === "locked") {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <Lock className="mx-auto mb-4 size-12 text-muted-foreground/30" />
        <h1 className="mb-2 text-xl font-bold">Module Locked</h1>
        <p className="mb-6 text-muted-foreground">
          Complete the prerequisite modules to unlock Module {mod.number}:{" "}
          {mod.title}.
        </p>
        <div className="mb-6 space-y-2">
          {mod.prerequisites.map((prereq) => {
            const prereqMod = MODULE_METADATA.find((m) => m.number === prereq);
            return prereqMod ? (
              <p key={prereq} className="text-sm text-muted-foreground">
                Requires: Module {prereqMod.number} — {prereqMod.title}
              </p>
            ) : null;
          })}
        </div>
        <Button variant="outline" render={<Link href="/modules" />}>
          Back to Modules
        </Button>
      </div>
    );
  }

  // Check premium access
  const subscriptionTier = (profile.subscription_tier ?? "free") as SubscriptionTier;
  if (!canAccessModule(mod.number, subscriptionTier)) {
    return (
      <div className="mx-auto max-w-4xl py-10">
        <PremiumGate
          moduleTitle={mod.title}
          moduleNumber={mod.number}
          description={mod.description}
        />
      </div>
    );
  }

  // Find previous and next modules
  const modIndex = MODULE_METADATA.findIndex((m) => m.number === mod.number);
  const prevMod = modIndex > 0 ? MODULE_METADATA[modIndex - 1] : null;
  const nextMod =
    modIndex < MODULE_METADATA.length - 1 ? MODULE_METADATA[modIndex + 1] : null;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/modules"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All Modules
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-sm font-medium uppercase tracking-wider text-primary">
              Module {mod.number}
            </p>
            <h1 className="text-2xl font-bold">{mod.title}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                {mod.estimatedHours} hours
              </span>
              <span className="capitalize">{mod.tier}</span>
            </div>
          </div>
          <ToolToggle current={profile.tool_preference} />
        </div>
      </div>

      {/* Tool Setup Banner for Module 5+ */}
      {mod.number >= 5 && <ToolSetupBanner toolPreference={profile.tool_preference} />}

      {/* Content + Sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Module Content */}
        <div
          data-tool-active={profile.tool_preference}
          className="prose prose-sm max-w-none dark:prose-invert"
        >
          <ModuleContent moduleNumber={mod.number} />
          {mod.number === 16 && (
            <div className="mt-8 not-prose">
              <CapstoneSuggestions roleTrack={profile.role_track as RoleTrack | null} isPremium={subscriptionTier === "premium"} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CheckpointList
            moduleNumber={mod.number}
            moduleTitle={mod.title}
            checkpoints={mod.checkpoints}
            completedIndexes={completedIndexes}
            totalCompletedModules={totalCompletedModules}
          />

          {/* Navigation */}
          <div className="flex gap-3">
            {prevMod && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                render={<Link href={`/modules/${prevMod.slug}`} />}
              >
                &larr; {prevMod.title}
              </Button>
            )}
            {nextMod && (
              <Button
                size="sm"
                className="flex-1"
                render={<Link href={`/modules/${nextMod.slug}`} />}
              >
                {nextMod.title} &rarr;
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
