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

  // Count referred users who have completed Module 1 (single batch query)
  const { data: referredUsers } = await supabase
    .from("profiles")
    .select("id")
    .eq("referred_by", userId);

  const referredIds = (referredUsers ?? []).map((u) => u.id);
  let qualifiedCount = 0;

  if (referredIds.length > 0) {
    const { count } = await supabase
      .from("module_progress")
      .select("user_id", { count: "exact", head: true })
      .in("user_id", referredIds)
      .eq("module_number", 1)
      .eq("status", "completed");

    qualifiedCount = count ?? 0;
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
