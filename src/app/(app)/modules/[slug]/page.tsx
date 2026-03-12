import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Lock } from "lucide-react";
import { MODULE_METADATA, getModuleBySlug } from "@/lib/content/modules";
import { CheckpointList } from "@/components/modules/checkpoint-list";
import { ToolToggle } from "@/components/modules/tool-toggle";
import { ModuleContent } from "@/components/modules/module-content";
import { Button } from "@/components/ui/button";
import type { ModuleProgress, CheckpointProgress, Profile } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const mod = getModuleBySlug(slug);
  if (!mod) return { title: "Module Not Found" };
  return { title: `Module ${mod.number}: ${mod.title}` };
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

  const [profileRes, progressRes, checkpointsRes] = await Promise.all([
    supabase.from("profiles").select("tool_preference").eq("id", user.id).single(),
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
  ]);

  const profile = profileRes.data as Pick<Profile, "tool_preference">;
  const moduleProgress = progressRes.data as ModuleProgress | null;
  const completedCheckpoints = (checkpointsRes.data ?? []) as CheckpointProgress[];
  const completedIndexes = completedCheckpoints.map((c) => c.checkpoint_index);

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

      {/* Content + Sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Module Content */}
        <div
          data-tool-active={profile.tool_preference}
          className="prose prose-sm max-w-none dark:prose-invert"
        >
          <ModuleContent moduleNumber={mod.number} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CheckpointList
            moduleNumber={mod.number}
            checkpoints={mod.checkpoints}
            completedIndexes={completedIndexes}
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
