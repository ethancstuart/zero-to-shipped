import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { MODULE_METADATA } from "@/lib/content/modules";
import { getXPProgress, getBadgeBySlug, BADGES } from "@/lib/gamification/constants";
import { ROLE_LABELS, siteConfig } from "@/lib/constants";
import { ShareButtons } from "@/components/profile/share-buttons";
import type { Profile, ModuleProgress, Badge } from "@/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const decoded = decodeURIComponent(username);
  const ogUrl = `${siteConfig.url}/api/og?name=${encodeURIComponent(decoded)}`;
  return {
    title: `${decoded}'s Profile`,
    openGraph: {
      title: `${decoded} — Zero to Shipped`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${decoded} — Zero to Shipped`,
      images: [ogUrl],
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const decodedName = decodeURIComponent(username);

  const supabase = createAdminClient();

  // Find public profile by display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("public_profile", true)
    .ilike("display_name", decodedName)
    .single();

  if (!profile) notFound();

  const typedProfile = profile as Profile;

  const [progressRes, badgesRes] = await Promise.all([
    supabase
      .from("module_progress")
      .select("*")
      .eq("user_id", typedProfile.id),
    supabase.from("badges").select("*").eq("user_id", typedProfile.id),
  ]);

  const progress = (progressRes.data ?? []) as ModuleProgress[];
  const badges = (badgesRes.data ?? []) as Badge[];
  const completedModules = progress.filter((p) => p.status === "completed");
  const { current, progressPercent } = getXPProgress(typedProfile.xp);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-6 py-12">
        {/* Profile Header */}
        <div className="text-center">
          {typedProfile.avatar_url ? (
            <img
              src={typedProfile.avatar_url}
              alt=""
              className="mx-auto mb-4 size-20 rounded-full"
            />
          ) : (
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {typedProfile.display_name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <h1 className="text-2xl font-bold">{typedProfile.display_name}</h1>
          {typedProfile.role_track && (
            <p className="text-sm text-muted-foreground">
              {ROLE_LABELS[typedProfile.role_track]} Track
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold">{completedModules.length}</p>
            <p className="text-xs text-muted-foreground">Modules</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold">{current.title}</p>
            <p className="text-xs text-muted-foreground">
              Level {current.level}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold">{typedProfile.longest_streak}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium">
              {typedProfile.xp} XP
            </span>
            <span className="text-muted-foreground">
              {current.title}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold">Badges Earned</h2>
            <div className="flex flex-wrap gap-3">
              {badges.map((badge) => {
                const def = getBadgeBySlug(badge.badge_slug);
                if (!def) return null;
                return (
                  <div
                    key={badge.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2"
                    title={def.description}
                  >
                    <span className="text-lg">{def.icon}</span>
                    <span className="text-xs font-medium">{def.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Modules */}
        {completedModules.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold">Completed Modules</h2>
            <div className="space-y-2">
              {completedModules.map((mp) => {
                const mod = MODULE_METADATA.find(
                  (m) => m.number === mp.module_number
                );
                if (!mod) return null;
                return (
                  <div
                    key={mp.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="flex size-6 items-center justify-center rounded-full bg-green-500/10 text-[10px] font-bold text-green-500">
                      {mod.number}
                    </div>
                    <span>{mod.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Share */}
        <div className="flex justify-center">
          <ShareButtons
            url={`${siteConfig.url}/u/${encodeURIComponent(username)}`}
            title={`Check out ${typedProfile.display_name}'s progress on Zero to Shipped!`}
          />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Powered by Zero to Shipped
        </p>
      </div>
    </div>
  );
}
