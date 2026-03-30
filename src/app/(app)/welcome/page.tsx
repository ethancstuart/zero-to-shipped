import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Rocket, Star, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types";

export const metadata = { title: "Welcome to Zero to Ship" };

export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, subscription_tier, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as Pick<
    Profile,
    "display_name" | "subscription_tier" | "stripe_customer_id"
  > | null;

  const name = typedProfile?.display_name?.split(" ")[0] ?? "there";
  const isPremium = typedProfile?.subscription_tier === "premium";

  return (
    <div className="mx-auto max-w-2xl py-12 text-center">
      {/* Celebration header */}
      <div className="mb-8">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
          <Rocket className="size-10 text-primary" />
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">
          Welcome to Zero to Ship{name !== "there" ? `, ${name}` : ""}!
        </h1>
        <p className="text-lg text-muted-foreground">
          You&apos;re in. Let&apos;s build something real.
        </p>
      </div>

      {/* Founding member badge */}
      {isPremium && (
        <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
          <Star className="size-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            Founding Member
          </span>
        </div>
      )}

      {/* Path overview */}
      <div className="mb-10 rounded-xl border border-border bg-card p-8 text-left">
        <h2 className="mb-4 text-lg font-semibold">
          Here&apos;s your path
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">16 hands-on modules</p>
              <p className="text-sm text-muted-foreground">
                From setup to shipping a capstone project — each module ends
                with something you built.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Star className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">XP, streaks, and badges</p>
              <p className="text-sm text-muted-foreground">
                Complete checkpoints to earn XP, maintain your streak, and
                unlock badges along the way.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Trophy className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">Certificate of completion</p>
              <p className="text-sm text-muted-foreground">
                Finish all 16 modules and earn a shareable certificate for your
                LinkedIn profile.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button
        render={<Link href="/modules/01-setup-and-first-build" />}
        size="lg"
        className="px-8 text-base"
      >
        Start Module 1
      </Button>

      <p className="mt-4 text-sm text-muted-foreground">
        Module 1 takes about 3 hours. You&apos;ll have your first build by the
        end.
      </p>
    </div>
  );
}
