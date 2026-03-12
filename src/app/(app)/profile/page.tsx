import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { BADGES, getBadgeBySlug, getXPProgress } from "@/lib/gamification/constants";
import type { Profile, Badge } from "@/types";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [profileRes, badgesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("badges").select("*").eq("user_id", user.id),
  ]);

  const profile = profileRes.data as Profile;
  const badges = (badgesRes.data ?? []) as Badge[];
  const { current, progressPercent } = getXPProgress(profile.xp);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Stats */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="size-16 rounded-full"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {profile.display_name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold">{profile.display_name}</h2>
            <p className="text-sm text-muted-foreground">
              Level {current.level}: {current.title} &middot; {profile.xp} XP
              &middot; {profile.current_streak}d streak
            </p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold">Badges</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {BADGES.map((def) => {
            const earned = badges.find((b) => b.badge_slug === def.slug);
            return (
              <div
                key={def.slug}
                className={`flex flex-col items-center gap-1 rounded-lg border border-border p-3 text-center ${
                  earned ? "" : "opacity-30"
                }`}
                title={def.description}
              >
                <span className="text-2xl">{def.icon}</span>
                <span className="text-[10px] font-medium leading-tight">
                  {def.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <ProfileForm profile={profile} />
    </div>
  );
}
