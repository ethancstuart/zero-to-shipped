import { CheckCircle2 } from "lucide-react";
import { LoginButton } from "@/components/layout/login-button";
import { CheckoutButton } from "@/components/pricing/checkout-button";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Pricing" };

const FREE_FEATURES = [
  "Modules 1–5 (Foundations)",
  "XP, badges, and streaks",
  "Skill tree visualization",
  "Free cheat sheets",
  "Progress tracking",
];

const FULL_ACCESS_FEATURES = [
  "Everything in Free",
  "Modules 6–16 (Intermediate, Advanced, Capstone)",
  "Role-specific learning paths",
  "Capstone templates",
  "Certificate of completion",
  "Public profile with sharing",
];


export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!user;

  return (
    <div className="py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
            Start free. Upgrade when you&apos;re ready.
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Get started with 5 foundational modules for free. Unlock the full
            curriculum to go from beginner to builder.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {/* Free Tier */}
          <div className="rounded-xl border border-border bg-card p-8">
            <h2 className="mb-1 text-xl font-bold">Free</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Learn the foundations at your own pace.
            </p>
            <p className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground"> forever</span>
            </p>
            {isLoggedIn ? (
              <div className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-center text-sm font-medium text-muted-foreground">
                Current Plan
              </div>
            ) : (
              <LoginButton />
            )}
            <ul className="mt-6 space-y-3">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Full Access */}
          <div className="rounded-xl border-2 border-primary bg-card p-8">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-xl font-bold">Full Access</h2>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Popular
              </span>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Full curriculum with advanced modules and capstone.
            </p>
            <p className="mb-1">
              <span className="text-4xl font-bold">$79</span>
              <span className="text-muted-foreground"> /one-time</span>
            </p>
            <p className="mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500">
                🎉 First 100 students: $49
              </span>
            </p>
            {isLoggedIn ? (
              <CheckoutButton tier="full_access" label="Get Full Access" />
            ) : (
              <LoginButton />
            )}
            <ul className="mt-6 space-y-3">
              {FULL_ACCESS_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Easy to Expense */}
        <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="mb-2 text-xl font-bold">Easy to expense</h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            $79 is under most L&amp;D approval thresholds. We&apos;ll send you
            a receipt you can submit to your company.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-12 space-y-6">
          <h2 className="text-center text-2xl font-bold">FAQ</h2>
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-1 font-semibold">What do I get with Full Access?</h3>
              <p className="text-sm text-muted-foreground">
                All 16 modules, a capstone project, certificate of completion,
                public profile, and leaderboard access. Everything you need to
                go from zero to shipped.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-1 font-semibold">Is this &quot;learn to code&quot;?</h3>
              <p className="text-sm text-muted-foreground">
                No. This is &quot;learn to ship.&quot; You&apos;ll use AI coding
                tools to build real products in your actual role — PM, BA,
                Project Manager, or BI Engineer.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-1 font-semibold">Who built this?</h3>
              <p className="text-sm text-muted-foreground">
                Built by a product leader who uses AI tools daily to ship at
                scale. Every module is based on real workflows, not theory.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
