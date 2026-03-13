"use server";

import { createClient } from "@/lib/supabase/server";
import {
  handleCheckpointComplete,
  handleCheckpointUncomplete,
} from "@/lib/gamification/engine";
import { revalidatePath } from "next/cache";
import type { CheckpointResult } from "@/types";

export async function toggleCheckpoint(
  moduleNumber: number,
  checkpointIndex: number,
  completed: boolean
): Promise<CheckpointResult | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Ensure module is in_progress
  await supabase
    .from("module_progress")
    .update({ status: "in_progress", started_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("module_number", moduleNumber)
    .eq("status", "available");

  let result: CheckpointResult | null = null;

  if (completed) {
    result = await handleCheckpointComplete(user.id, moduleNumber, checkpointIndex);
  } else {
    await handleCheckpointUncomplete(user.id, moduleNumber, checkpointIndex);
  }

  revalidatePath(`/modules`);
  revalidatePath(`/dashboard`);

  return result;
}

export async function updateToolPreference(tool: "claude-code" | "cursor") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase
    .from("profiles")
    .update({ tool_preference: tool })
    .eq("id", user.id);

  revalidatePath("/modules");
}
