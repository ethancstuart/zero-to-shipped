import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MODULE_METADATA } from "@/lib/content/modules";
import { PREMIUM_MODULES } from "@/lib/content/tiers";
import type { Profile, RoleTrack } from "@/types";

export const metadata = { title: "Purchase Complete" };

export default async function PurchaseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id) redirect("/pricing");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_track, subscription_tier")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as Pick<Profile, "role_track" | "subscription_tier"> | null;

  // Suggest next module based on role
  const unlockedModules = MODULE_METADATA.filter((m) =>
    PREMIUM_MODULES.includes(m.number as (typeof PREMIUM_MODULES)[number])
  );

  const roleTrack = typedProfile?.role_track as RoleTrack | null;
  const suggestedModule = roleTrack
    ? unlockedModules.find((m) => m.roleRelevance[roleTrack] === "core") ??
      unlockedModules[0]
    : unlockedModules[0];

  return (
    <div className="py-20">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <div className="mb-8 inline-flex size-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="size-10 text-green-500" />
        </div>

        <h1 className="mb-4 text-3xl font-bold">You&apos;re in!</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Full Access unlocked. You now have access to all 16 modules, capstone
          templates, certificates, and more.
        </p>

        {/* Unlocked modules preview */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6 text-left">
          <h2 className="mb-4 font-semibold">Modules Unlocked</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {unlockedModules.map((mod) => (
              <div
                key={mod.number}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Rocket className="size-3 shrink-0 text-primary" />
                <span>
                  {mod.number}. {mod.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          {suggestedModule && (
            <Button
              size="lg"
              render={<Link href={`/modules/${suggestedModule.slug}`} />}
            >
              Start Module {suggestedModule.number}: {suggestedModule.title}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          )}
          <Button variant="outline" render={<Link href="/dashboard" />}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
