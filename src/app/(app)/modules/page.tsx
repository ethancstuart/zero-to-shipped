import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ModuleSearch } from "@/components/modules/module-search";
import type { ModuleProgress, Profile, RoleTrack } from "@/types";

export const metadata = { title: "Modules" };

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
  const progressMap: Record<number, ModuleProgress["status"]> = {};
  for (const p of progress) {
    progressMap[p.module_number] = p.status;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Modules</h1>
        <p className="text-muted-foreground">
          Work through each tier to unlock the next. Complete prerequisites to
          access new modules.
        </p>
      </div>

      <ModuleSearch
        progressMap={progressMap}
        roleTrack={(profile.role_track as RoleTrack) ?? null}
      />
    </div>
  );
}
