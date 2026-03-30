"use server";

import { createClient } from "@/lib/supabase/server";
import { XP, getBadgeBySlug } from "./constants";
import { MODULE_METADATA, getModulesByTier } from "@/lib/content/modules";
import type { CheckpointResult } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

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
  supabase: SupabaseClient,
  userId: string,
  eventType: string,
  xpAmount: number,
  metadata: Record<string, unknown> = {},
  collector?: ResultCollector
) {
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
  supabase: SupabaseClient,
  userId: string,
  badgeSlug: string,
  collector?: ResultCollector
): Promise<boolean> {
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

  await awardXP(supabase, userId, "badge_earned", 25, { badge_slug: badgeSlug }, collector);
  return true;
}

// Award multiple candidate badges in batch: fetch existing, insert only new ones
async function batchAwardBadges(
  supabase: SupabaseClient,
  userId: string,
  candidateSlugs: string[],
  collector: ResultCollector
): Promise<string[]> {
  if (candidateSlugs.length === 0) return [];

  const { data: existing } = await supabase
    .from("badges")
    .select("badge_slug")
    .eq("user_id", userId)
    .in("badge_slug", candidateSlugs);

  const existingSet = new Set((existing ?? []).map((b: { badge_slug: string }) => b.badge_slug));
  const newSlugs = candidateSlugs.filter((s) => !existingSet.has(s));

  const earned: string[] = [];
  for (const slug of newSlugs) {
    const awarded = await tryAwardBadge(supabase, userId, slug, collector);
    if (awarded) earned.push(slug);
  }
  return earned;
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

  // Consolidated idempotency: fetch all relevant xp_events for this user once
  const { data: existingEvents } = await supabase
    .from("xp_events")
    .select("event_type, metadata")
    .eq("user_id", userId)
    .in("event_type", ["checkpoint", "streak_bonus", "referral_bonus"]);

  const events = existingEvents ?? [];

  // Check if checkpoint XP already awarded
  const hasCheckpointXP = events.some(
    (e) =>
      e.event_type === "checkpoint" &&
      e.metadata?.module_number === moduleNumber &&
      e.metadata?.checkpoint_index === checkpointIndex
  );

  if (!hasCheckpointXP) {
    await awardXP(supabase, userId, "checkpoint", XP.CHECKPOINT, {
      module_number: moduleNumber,
      checkpoint_index: checkpointIndex,
    }, collector);
  }

  // Update streak
  await supabase.rpc("update_streak", { p_user_id: userId });

  // Batch badge checks: collect all candidate badges
  const candidateBadges: string[] = ["first-checkpoint"];
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 5) candidateBadges.push("night-owl");
  if (hour >= 5 && hour < 7) candidateBadges.push("early-bird");
  const day = new Date().getDay();
  if (day === 0 || day === 6) candidateBadges.push("weekend-warrior");

  // Check streak badges + milestones
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak")
    .eq("id", userId)
    .single();

  if (profile) {
    if (profile.current_streak >= 3) candidateBadges.push("streak-3");
    if (profile.current_streak >= 7) candidateBadges.push("streak-7");
    if (profile.current_streak >= 30) candidateBadges.push("streak-30");
  }

  const earnedBadges = await batchAwardBadges(supabase, userId, candidateBadges, collector);

  // Set streak milestones based on newly earned streak badges
  if (profile) {
    if (earnedBadges.includes("streak-3") && !collector.streakMilestone) collector.streakMilestone = 3;
    if (earnedBadges.includes("streak-7") && !collector.streakMilestone) collector.streakMilestone = 7;
    if (earnedBadges.includes("streak-30") && !collector.streakMilestone) collector.streakMilestone = 30;

    // Streak bonus XP (idempotent via consolidated events check)
    if (profile.current_streak >= 7) {
      const hasStreak7Bonus = events.some(
        (e) => e.event_type === "streak_bonus" && String(e.metadata?.milestone) === "7"
      );
      if (!hasStreak7Bonus) {
        await awardXP(supabase, userId, "streak_bonus", XP.STREAK_7, { milestone: 7 }, collector);
      }
    }
    if (profile.current_streak >= 30) {
      const hasStreak30Bonus = events.some(
        (e) => e.event_type === "streak_bonus" && String(e.metadata?.milestone) === "30"
      );
      if (!hasStreak30Bonus) {
        await awardXP(supabase, userId, "streak_bonus", XP.STREAK_30, { milestone: 30 }, collector);
      }
    }
  }

  // Check if all module checkpoints are completed
  const mod = MODULE_METADATA.find((m) => m.number === moduleNumber);
  if (mod) {
    const { data: checkpoints } = await supabase
      .from("checkpoint_progress")
      .select("checkpoint_index")
      .eq("user_id", userId)
      .eq("module_number", moduleNumber)
      .eq("completed", true);

    if (checkpoints && checkpoints.length >= mod.checkpoints.length) {
      await handleModuleComplete(supabase, userId, moduleNumber, events, collector);
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
  supabase: SupabaseClient,
  userId: string,
  moduleNumber: number,
  existingEvents: { event_type: string; metadata: Record<string, unknown> }[],
  collector: ResultCollector
) {
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
    supabase,
    userId,
    isCapstone ? "capstone" : "module_complete",
    isCapstone ? XP.CAPSTONE : XP.MODULE_COMPLETE,
    { module_number: moduleNumber },
    collector
  );

  if (isCapstone) await tryAwardBadge(supabase, userId, "capstone-shipped", collector);

  // Unlock modules whose prerequisites are now met
  const { data: allProgress } = await supabase
    .from("module_progress")
    .select("module_number, status")
    .eq("user_id", userId);

  const completed = (allProgress ?? [])
    .filter((p) => p.status === "completed")
    .map((p) => p.module_number);

  for (const mod of MODULE_METADATA) {
    const mp = (allProgress ?? []).find(
      (p) => p.module_number === mod.number
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

  // Batch check tier completion badges
  const tierBadgeCandidates: string[] = [];

  const foundationModules = getModulesByTier("foundations").map((m) => m.number);
  if (foundationModules.every((n) => completed.includes(n))) {
    tierBadgeCandidates.push("foundations-complete");
  }

  const intermediateModules = getModulesByTier("intermediate").map((m) => m.number);
  const completedIntermediate = intermediateModules.filter((n) => completed.includes(n));
  if (completedIntermediate.length >= 3) {
    tierBadgeCandidates.push("intermediate-explorer");
  }

  const advancedModules = getModulesByTier("advanced").map((m) => m.number);
  const completedAdvanced = advancedModules.filter((n) => completed.includes(n));
  if (completedAdvanced.length >= 2) {
    tierBadgeCandidates.push("advanced-achiever");
  }

  if (completed.length === 16) {
    tierBadgeCandidates.push("completionist");
  }

  const earnedTierBadges = await batchAwardBadges(supabase, userId, tierBadgeCandidates, collector);

  // Tier completion XP
  if (earnedTierBadges.includes("foundations-complete")) {
    await awardXP(supabase, userId, "tier_complete", XP.TIER_COMPLETE, { tier: "foundations" }, collector);
  }
  if (intermediateModules.every((n) => completed.includes(n))) {
    await awardXP(supabase, userId, "tier_complete", XP.TIER_COMPLETE, { tier: "intermediate" }, collector);
  }
  if (advancedModules.every((n) => completed.includes(n))) {
    await awardXP(supabase, userId, "tier_complete", XP.TIER_COMPLETE, { tier: "advanced" }, collector);
  }

  // Referral XP award on Module 1 completion
  if (moduleNumber === 1) {
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", userId)
      .single();

    if (userProfile?.referred_by) {
      const hasReferralBonus = existingEvents.some(
        (e) => e.event_type === "referral_bonus"
      );

      if (!hasReferralBonus) {
        // Award 100 XP to referred user
        await awardXP(supabase, userId, "referral_bonus", XP.REFERRAL_BONUS, {
          referrer_id: userProfile.referred_by,
        }, collector);

        // Award 100 XP to referrer
        await awardXP(supabase, userProfile.referred_by, "referral_reward", XP.REFERRAL_BONUS, {
          referred_user_id: userId,
        });

        // Check if referrer qualifies for referral-champion badge (3 referrals)
        const { count } = await supabase
          .from("xp_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userProfile.referred_by)
          .eq("event_type", "referral_reward");

        if (count && count >= 3) {
          await tryAwardBadge(supabase, userProfile.referred_by, "referral-champion");
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
        await tryAwardBadge(supabase, userId, "speed-runner", collector);
      }
    }
  }
}
