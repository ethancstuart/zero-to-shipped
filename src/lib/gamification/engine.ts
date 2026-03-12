"use server";

import { createClient } from "@/lib/supabase/server";
import { XP, getLevelForXP, BADGES } from "./constants";
import { MODULE_METADATA, getModulesByTier } from "@/lib/content/modules";
import type { ModuleProgress, CheckpointProgress, Badge, Profile } from "@/types";

async function awardXP(
  userId: string,
  eventType: string,
  xpAmount: number,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createClient();

  // Log XP event
  await supabase.from("xp_events").insert({
    user_id: userId,
    event_type: eventType,
    xp_amount: xpAmount,
    metadata,
  });

  // Update total XP and level
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp")
    .eq("id", userId)
    .single();

  const newXP = (profile?.xp ?? 0) + xpAmount;
  const newLevel = getLevelForXP(newXP);

  await supabase
    .from("profiles")
    .update({ xp: newXP, level: newLevel.title })
    .eq("id", userId);

  return newXP;
}

async function tryAwardBadge(userId: string, badgeSlug: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from("badges").insert({
    user_id: userId,
    badge_slug: badgeSlug,
  });

  if (error) return false; // Already has badge (unique constraint)

  // Award badge XP
  await awardXP(userId, "badge_earned", 25, { badge_slug: badgeSlug });
  return true;
}

export async function handleCheckpointComplete(
  userId: string,
  moduleNumber: number,
  checkpointIndex: number
) {
  const supabase = await createClient();

  // Upsert checkpoint
  await supabase.from("checkpoint_progress").upsert(
    {
      user_id: userId,
      module_number: moduleNumber,
      checkpoint_index: checkpointIndex,
      completed: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,module_number,checkpoint_index" }
  );

  // Award checkpoint XP
  await awardXP(userId, "checkpoint", XP.CHECKPOINT, {
    module_number: moduleNumber,
    checkpoint_index: checkpointIndex,
  });

  // Update streak
  await supabase.rpc("update_streak", { p_user_id: userId });

  // Check for first checkpoint badge
  await tryAwardBadge(userId, "first-checkpoint");

  // Check time-based badges
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 5) await tryAwardBadge(userId, "night-owl");
  if (hour >= 5 && hour < 7) await tryAwardBadge(userId, "early-bird");
  const day = new Date().getDay();
  if (day === 0 || day === 6) await tryAwardBadge(userId, "weekend-warrior");

  // Check streak badges
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak")
    .eq("id", userId)
    .single();

  if (profile) {
    if (profile.current_streak >= 3) await tryAwardBadge(userId, "streak-3");
    if (profile.current_streak >= 7) {
      await tryAwardBadge(userId, "streak-7");
      // Streak 7 milestone XP
      const { data: existing } = await supabase
        .from("xp_events")
        .select("id")
        .eq("user_id", userId)
        .eq("event_type", "streak_bonus")
        .eq("metadata->>milestone", "7")
        .maybeSingle();
      if (!existing) {
        await awardXP(userId, "streak_bonus", XP.STREAK_7, { milestone: 7 });
      }
    }
    if (profile.current_streak >= 30) {
      await tryAwardBadge(userId, "streak-30");
      const { data: existing } = await supabase
        .from("xp_events")
        .select("id")
        .eq("user_id", userId)
        .eq("event_type", "streak_bonus")
        .eq("metadata->>milestone", "30")
        .maybeSingle();
      if (!existing) {
        await awardXP(userId, "streak_bonus", XP.STREAK_30, { milestone: 30 });
      }
    }
  }

  // Check if all module checkpoints are completed
  const mod = MODULE_METADATA.find((m) => m.number === moduleNumber);
  if (!mod) return;

  const { data: checkpoints } = await supabase
    .from("checkpoint_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("module_number", moduleNumber)
    .eq("completed", true);

  if (checkpoints && checkpoints.length >= mod.checkpoints.length) {
    await handleModuleComplete(userId, moduleNumber);
  }
}

export async function handleCheckpointUncomplete(
  userId: string,
  moduleNumber: number,
  checkpointIndex: number
) {
  const supabase = await createClient();

  await supabase.from("checkpoint_progress").upsert(
    {
      user_id: userId,
      module_number: moduleNumber,
      checkpoint_index: checkpointIndex,
      completed: false,
      completed_at: null,
    },
    { onConflict: "user_id,module_number,checkpoint_index" }
  );
}

async function handleModuleComplete(userId: string, moduleNumber: number) {
  const supabase = await createClient();

  // Mark module completed
  await supabase
    .from("module_progress")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("module_number", moduleNumber);

  // Award module completion XP
  const isCapstone = moduleNumber === 16;
  await awardXP(
    userId,
    isCapstone ? "capstone" : "module_complete",
    isCapstone ? XP.CAPSTONE : XP.MODULE_COMPLETE,
    { module_number: moduleNumber }
  );

  if (isCapstone) await tryAwardBadge(userId, "capstone-shipped");

  // Unlock modules whose prerequisites are now met
  const { data: allProgress } = await supabase
    .from("module_progress")
    .select("*")
    .eq("user_id", userId);

  const completed = (allProgress ?? [])
    .filter((p: ModuleProgress) => p.status === "completed")
    .map((p: ModuleProgress) => p.module_number);

  for (const mod of MODULE_METADATA) {
    const mp = (allProgress ?? []).find(
      (p: ModuleProgress) => p.module_number === mod.number
    );
    if (mp && mp.status === "locked") {
      const prereqsMet = mod.prerequisites.every((p) => completed.includes(p));
      if (prereqsMet) {
        await supabase
          .from("module_progress")
          .update({ status: "available" })
          .eq("user_id", userId)
          .eq("module_number", mod.number);
      }
    }
  }

  // Check tier completion badges
  const foundationModules = getModulesByTier("foundations").map((m) => m.number);
  if (foundationModules.every((n) => completed.includes(n))) {
    const earned = await tryAwardBadge(userId, "foundations-complete");
    if (earned) await awardXP(userId, "tier_complete", XP.TIER_COMPLETE, { tier: "foundations" });
  }

  const intermediateModules = getModulesByTier("intermediate").map((m) => m.number);
  const completedIntermediate = intermediateModules.filter((n) => completed.includes(n));
  if (completedIntermediate.length >= 3) {
    await tryAwardBadge(userId, "intermediate-explorer");
  }

  const advancedModules = getModulesByTier("advanced").map((m) => m.number);
  const completedAdvanced = advancedModules.filter((n) => completed.includes(n));
  if (completedAdvanced.length >= 2) {
    await tryAwardBadge(userId, "advanced-achiever");
  }

  if (intermediateModules.every((n) => completed.includes(n))) {
    await awardXP(userId, "tier_complete", XP.TIER_COMPLETE, { tier: "intermediate" });
  }
  if (advancedModules.every((n) => completed.includes(n))) {
    await awardXP(userId, "tier_complete", XP.TIER_COMPLETE, { tier: "advanced" });
  }

  // Completionist
  if (completed.length === 16) {
    await tryAwardBadge(userId, "completionist");
  }

  // Speed runner check
  const mod = MODULE_METADATA.find((m) => m.number === moduleNumber);
  if (mod) {
    const { data: mp } = await supabase
      .from("module_progress")
      .select("started_at, completed_at")
      .eq("user_id", userId)
      .eq("module_number", moduleNumber)
      .single();
    if (mp?.started_at && mp?.completed_at) {
      const diff =
        new Date(mp.completed_at).getTime() - new Date(mp.started_at).getTime();
      if (diff < 24 * 60 * 60 * 1000) {
        await tryAwardBadge(userId, "speed-runner");
      }
    }
  }
}
