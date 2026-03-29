import { createClient } from "@/lib/supabase/server";

export interface ReferralTier {
  threshold: number;
  title: string;
  description: string;
  reward: string;
  slug: string;
}

export const REFERRAL_TIERS: ReferralTier[] = [
  {
    threshold: 1,
    title: "First Referral",
    description: "1 referral completes Module 1",
    reward: "Bonus cheat sheet: AI Coding Workflow",
    slug: "ai-coding-workflow",
  },
  {
    threshold: 3,
    title: "Referral Champion",
    description: "3 referrals complete Module 1",
    reward: "Referral Champion badge + bonus template pack",
    slug: "referral-champion",
  },
  {
    threshold: 5,
    title: "Community Builder",
    description: "5 referrals complete Module 1",
    reward: "Early access to new content (Season 2)",
    slug: "early-access",
  },
];

export interface ReferralRewardsResult {
  qualifiedReferrals: number;
  unlockedTiers: ReferralTier[];
  lockedTiers: ReferralTier[];
  nextTier: ReferralTier | null;
}

export async function getReferralRewards(
  userId: string
): Promise<ReferralRewardsResult> {
  const supabase = await createClient();

  // Count referred users who have completed Module 1
  const { data: referredUsers } = await supabase
    .from("profiles")
    .select("id")
    .eq("referred_by", userId);

  let qualifiedCount = 0;
  for (const referred of referredUsers ?? []) {
    const { data: progress } = await supabase
      .from("module_progress")
      .select("status")
      .eq("user_id", referred.id)
      .eq("module_number", 1)
      .eq("status", "completed")
      .maybeSingle();

    if (progress) qualifiedCount++;
  }

  const unlockedTiers = REFERRAL_TIERS.filter(
    (t) => qualifiedCount >= t.threshold
  );
  const lockedTiers = REFERRAL_TIERS.filter(
    (t) => qualifiedCount < t.threshold
  );
  const nextTier = lockedTiers[0] ?? null;

  return {
    qualifiedReferrals: qualifiedCount,
    unlockedTiers,
    lockedTiers,
    nextTier,
  };
}
