import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReferralDashboard } from "./referral-dashboard";
import { REFERRAL_TIERS } from "@/lib/referral-rewards";

export const metadata = { title: "Referrals" };

export default async function ReferralsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, referral_code")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/");

  // Get referred users with their Module 1 completion status
  const { data: referredUsers } = await supabase
    .from("profiles")
    .select("id, display_name, created_at")
    .eq("referred_by", profile.id);

  // Check which referred users completed Module 1
  const referredWithProgress = await Promise.all(
    (referredUsers ?? []).map(async (referred) => {
      const { data: moduleProgress } = await supabase
        .from("module_progress")
        .select("status")
        .eq("user_id", referred.id)
        .eq("module_number", 1)
        .maybeSingle();

      return {
        id: referred.id,
        displayName: referred.display_name ?? "Anonymous",
        joinedAt: referred.created_at,
        completedModule1: moduleProgress?.status === "completed",
      };
    })
  );

  const qualifiedReferrals = referredWithProgress.filter(
    (r) => r.completedModule1
  ).length;

  const tiers = REFERRAL_TIERS.map((tier) => ({
    ...tier,
    unlocked: qualifiedReferrals >= tier.threshold,
  }));

  return (
    <ReferralDashboard
      referralCode={profile.referral_code ?? profile.id.slice(0, 8)}
      referredUsers={referredWithProgress}
      qualifiedReferrals={qualifiedReferrals}
      tiers={tiers}
    />
  );
}
