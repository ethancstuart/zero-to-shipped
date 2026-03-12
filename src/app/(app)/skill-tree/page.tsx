import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MODULE_METADATA } from "@/lib/content/modules";
import { TIER_LABELS } from "@/lib/constants";
import { SkillTreeGraph } from "@/components/gamification/skill-tree-graph";
import type { ModuleProgress } from "@/types";

export const metadata = { title: "Skill Tree" };

export default async function SkillTreePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data } = await supabase
    .from("module_progress")
    .select("*")
    .eq("user_id", user.id);

  const progress = (data ?? []) as ModuleProgress[];
  const statusMap = new Map(progress.map((p) => [p.module_number, p.status]));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Skill Tree</h1>
        <p className="text-muted-foreground">
          Your learning path through the curriculum. Complete prerequisites to
          unlock new modules.
        </p>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-muted-foreground/30" />
          <span className="text-muted-foreground">Locked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full border-2 border-primary bg-transparent" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Completed</span>
        </div>
      </div>

      <SkillTreeGraph statusMap={Object.fromEntries(statusMap)} />
    </div>
  );
}
