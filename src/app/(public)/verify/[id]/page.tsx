import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CheckCircle2, Calendar } from "lucide-react";
import { MODULE_METADATA } from "@/lib/content/modules";
import type { ModuleProgress, Profile } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", id)
    .eq("public_profile", true)
    .single();

  if (!profile) return { title: "Certificate Not Found" };
  return {
    title: `${(profile as Pick<Profile, "display_name">).display_name} — Zero to Shipped Certificate`,
  };
}

export default async function VerifyPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [profileRes, progressRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url, xp, level, role_track, public_profile")
      .eq("id", id)
      .eq("public_profile", true)
      .single(),
    supabase
      .from("module_progress")
      .select("*")
      .eq("user_id", id)
      .eq("status", "completed"),
  ]);

  if (!profileRes.data) notFound();

  const profile = profileRes.data as Pick<
    Profile,
    "id" | "display_name" | "avatar_url" | "xp" | "level" | "role_track" | "public_profile"
  >;
  const completedModules = (progressRes.data ?? []) as ModuleProgress[];

  // Find the latest completion date
  const completionDates = completedModules
    .map((m) => m.completed_at)
    .filter(Boolean)
    .sort();
  const latestCompletion = completionDates[completionDates.length - 1];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-20">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
            Zero to Shipped
          </p>
          <h1 className="text-3xl font-bold">Certificate Verification</h1>
        </div>

        <div className="rounded-xl border border-border bg-card p-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="size-8 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.display_name}</h2>
              <p className="text-sm text-muted-foreground">
                {profile.level} · {profile.xp} XP
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 font-semibold">Completed Modules ({completedModules.length}/16)</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {completedModules.map((mp) => {
                const meta = MODULE_METADATA.find((m) => m.number === mp.module_number);
                if (!meta) return null;
                return (
                  <div
                    key={mp.module_number}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <CheckCircle2 className="size-3.5 shrink-0 text-green-500" />
                    <span>
                      {meta.number}. {meta.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {latestCompletion && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span>
                Last completed:{" "}
                {new Date(latestCompletion).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Verified by Zero to Shipped · User ID: {id.slice(0, 8)}...
        </p>
      </div>
    </div>
  );
}
