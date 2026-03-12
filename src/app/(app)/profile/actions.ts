"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { RoleTrack, ToolPreference } from "@/types";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const displayName = formData.get("display_name") as string;
  const roleTrack = formData.get("role_track") as RoleTrack;
  const toolPreference = formData.get("tool_preference") as ToolPreference;
  const publicProfile = formData.get("public_profile") === "on";

  await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      role_track: roleTrack,
      tool_preference: toolPreference,
      public_profile: publicProfile,
    })
    .eq("id", user.id);

  revalidatePath("/profile");
  revalidatePath("/dashboard");
}
