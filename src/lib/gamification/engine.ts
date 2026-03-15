"use server";

import { createClient } from "@/lib/supabase/server";
import { XP, getBadgeBySlug } from "./constants";
import { MODULE_METADATA, getModulesByTier } from "@/lib/content/modules";
import type { ModuleProgress, CheckpointResult } from "@/types";

// Internal collector that accumulates awards during a checkpoint flow
class ResultCollector {
  xpAwarded = 0;
  totalXP = 0;
  previousLevel: string | null = null;
  newLevel: string | null = null;
  badgesEarned: CheckpointResult["badgesEarned"] = [];
  streakMilestone: number | null = null;
  moduleCompleted: number | null = null;

  toResult(): CheckpointResult {
    return {
      xpAwarded: this.xpAwarded,
      totalXP: this.totalXP,
      newLevel: this.newLevel,
      previousLevel: this.previousLevel,
      badgesEarned: this.badgesEarned,
      streakMilestone: this.streakMilestone,
      moduleCompleted: this.moduleCompleted,
    };
  }
}

async function awardXP(
  userId: string,
  eventType: string,
  xpAmount: number,
  metadata: Record<string, unknown> = {},
  collector?: ResultCollector
) {
  const supabase = await createClient();

  await supabase.from("xp_events").insert({
    user_id: userId,
    event_type: eventType,
    xp_amount: xpAmount,
    metadata,
  });

  // Atomic increment via RPC to prevent race conditions
  const { data: result } = await supabase.rpc("increment_xp", {
    p_user_id: userId,
    p_amount: xpAmount,
  });

  const row = result?.[0];
  const newXP = row?.new_xp ?? xpAmount;
  const oldLevel = row?.old_level ?? "Novice";
  const newLevel = row?.new_level ?? "Novice";

  if (collector) {
    collector.xpAwarded += xpAmount;
    collector.totalXP = newXP;
    if (newLevel !== oldLevel) {
      collector.previousLevel = oldLevel;
      collector.newLevel = newLevel;
    }
  }

  return newXP;
}

async function tryAwardBadge(
  userId: string,
  badgeSlug: string,
  collector?: ResultCollector
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from("badges").insert({
    user_id: userId,
    badge_slug: badgeSlug,
  });

  if (error) return false;

  const def = getBadgeBySlug(badgeSlug);
  if (def && collector) {
    collector.badgesEarned.push({
      slug: def.slug,
      name: def.name,
      description: def.description,
      icon: def.icon,
    });
  }

  await awardXP(userId, "badge_earned", 25, { badge_slug: badgeSlug }, collector);
  return true;
}

export async function handleCheckpointComplete(
  userId: string,
  moduleNumber: number,
  checkpointIndex: number
): Promise<CheckpointResult> {
  const supabase = await createClient();
  const collector = new ResultCollector();

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

  // Award checkpoint XP (idempotent — skip if already awarded for this checkpoint)
  const { data: existingCheckpointXP } = await supabase
    .from("xp_events")
    .select("id")
    .eq("user_id", userId)
    .eq("event_type", "checkpoint")
    .eq("metadata->>module_number", String(moduleNumber))
    .eq("metadata->>checkpoint_index", String(checkpointIndex))
    .maybeSingle();

  if (!existingCheckpointXP) {
    await awardXP(userId, "checkpoint", XP.CHECKPOINT, {
      module_number: moduleNumber,
      checkpoint_index: checkpointIndex,
    }, collector);
  }

  // Update streak
  await supabase.rpc("update_streak", { p_user_id: userId });

  // Check for first checkpoint badge
  await tryAwardBadge(userId, "first-checkpoint", collector);

  // Check time-based badges
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 5) await tryAwardBadge(userId, "night-owl", collector);
  if (hour >= 5 && hour < 7) await tryAwardBadge(userId, "early-bird", collector);
  const day = new Date().getDay();
  if (day === 0 || day === 6) await tryAwardBadge(userId, "weekend-warrior", collector);

  // Check streak badges + milestones
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak")
    .eq("id", userId)
    .single();

  if (profile) {
    if (profile.current_streak >= 3) {
      const earned = await tryAwardBadge(userId, "streak-3", collector);
      if (earned && !collector.streakMilestone) collector.streakMilestone = 3;
    }
    if (profile.current_streak >= 7) {
      const earned = await tryAwardBadge(userId, "streak-7", collector);
      if (earned && !collector.streakMilestone) collector.streakMilestone = 7;
      const { data: existing } = await supabase
        .from("xp_events")
        .select("id")
        .eq("user_id", userId)
        .eq("event_type", "streak_bonus")
        .eq("metadata->>milestone", "7")
        .maybeSingle();
      if (!existing) {
        await awardXP(userId, "streak_bonus", XP.STREAK_7, { milestone: 7 }, collector);
      }
    }
    if (profile.current_streak >= 30) {
      const earned = await tryAwardBadge(userId, "streak-30", collector);
      if (earned && !collector.streakMilestone) collector.streakMilestone = 30;
      const { data: existing } = await supabase
        .from("xp_events")
        .select("id")
        .eq("user_id", userId)
        .eq("event_type", "streak_bonus")
        .eq("metadata->>milestone", "30")
        .maybeSingle();
      if (!existing) {
        await awardXP(userId, "streak_bonus", XP.STREAK_30, { milestone: 30 }, collector);
      }
    }
  }

  // Check if all module checkpoints are completed
  const mod = MODULE_METADATA.find((m) => m.number === moduleNumber);
  if (mod) {
    const { data: checkpoints } = await supabase
      .from("checkpoint_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("module_number", moduleNumber)
      .eq("completed", true);

    if (checkpoints && checkpoints.length >= mod.checkpoints.length) {
      await handleModuleComplete(userId, moduleNumber, collector);
    }
  }

  return collector.toResult();
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

async function handleModuleComplete(
  userId: string,
  moduleNumber: number,
  collector: ResultCollector
) {
  const supabase = await createClient();

  // Mark module completed
  collector.moduleCompleted = moduleNumber;
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
    { module_number: moduleNumber },
    collector
  );

  if (isCapstone) await tryAwardBadge(userId, "capstone-shipped", collector);

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
    const earned = await tryAwardBadge(userId, "foundations-complete", collector);
    if (earned) await awardXP(userId, "tier_complete", XP.TIER_COMPLETE, { tier: "foundations" }, collector);
  }

  const intermediateModules = getModulesByTier("intermediate").map((m) => m.number);
  const completedIntermediate = intermediateModules.filter((n) => completed.includes(n));
  if (completedIntermediate.length >= 3) {
    await tryAwardBadge(userId, "intermediate-explorer", collector);
  }

  const advancedModules = getModulesByTier("advanced").map((m) => m.number);
  const completedAdvanced = advancedModules.filter((n) => completed.includes(n));
  if (completedAdvanced.length >= 2) {
    await tryAwardBadge(userId, "advanced-achiever", collector);
  }

  if (intermediateModules.every((n) => completed.includes(n))) {
    await awardXP(userId, "tier_complete", XP.TIER_COMPLETE, { tier: "intermediate" }, collector);
  }
  if (advancedModules.every((n) => completed.includes(n))) {
    await awardXP(userId, "tier_complete", XP.TIER_COMPLETE, { tier: "advanced" }, collector);
  }

  // Completionist
  if (completed.length === 16) {
    await tryAwardBadge(userId, "completionist", collector);
  }

  // Referral XP award on Module 1 completion
  if (moduleNumber === 1) {
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", userId)
      .single();

    if (userProfile?.referred_by) {
      // Check if referral bonus was already awarded
      const { data: existingBonus } = await supabase
        .from("xp_events")
        .select("id")
        .eq("user_id", userId)
        .eq("event_type", "referral_bonus")
        .maybeSingle();

      if (!existingBonus) {
        // Award 100 XP to referred user
        await awardXP(userId, "referral_bonus", XP.REFERRAL_BONUS, {
          referrer_id: userProfile.referred_by,
        }, collector);

        // Award 100 XP to referrer
        await awardXP(userProfile.referred_by, "referral_reward", XP.REFERRAL_BONUS, {
          referred_user_id: userId,
        });

        // Check if referrer qualifies for referral-champion badge (3 referrals)
        const { count } = await supabase
          .from("xp_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userProfile.referred_by)
          .eq("event_type", "referral_reward");

        if (count && count >= 3) {
          await tryAwardBadge(userProfile.referred_by, "referral-champion");
        }
      }
    }
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
        await tryAwardBadge(userId, "speed-runner", collector);
      }
    }
  }
}
