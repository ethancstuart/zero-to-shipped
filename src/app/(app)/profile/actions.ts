"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

const profileSchema = z.object({
  display_name: z.string().trim().min(1).max(100),
  role_track: z.enum(["pm", "pjm", "ba", "bi"]),
  tool_preference: z.enum(["claude-code", "cursor"]),
  public_profile: z.boolean(),
});

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = profileSchema.safeParse({
    display_name: formData.get("display_name"),
    role_track: formData.get("role_track"),
    tool_preference: formData.get("tool_preference"),
    public_profile: formData.get("public_profile") === "on",
  });

  if (!parsed.success) return;

  await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name,
      role_track: parsed.data.role_track,
      tool_preference: parsed.data.tool_preference,
      public_profile: parsed.data.public_profile,
    })
    .eq("id", user.id);

  revalidatePath("/profile");
  revalidatePath("/dashboard");
}
