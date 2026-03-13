import { CheckCircle2 } from "lucide-react";
import { LoginButton } from "@/components/layout/login-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Pricing" };

const FREE_FEATURES = [
  "Modules 1–5 (Foundations)",
  "XP, badges, and streaks",
  "Skill tree visualization",
  "Community cheat sheets",
  "Progress tracking",
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "Modules 6–16 (Intermediate, Advanced, Capstone)",
  "Role-specific capstone projects",
  "Certificate of completion",
  "Public profile with sharing",
  "Priority content updates",
];

export default function PricingPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
            Start free. Upgrade when you&apos;re ready.
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Get started with 5 foundational modules for free. Unlock the full
            curriculum to go from beginner to builder.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
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
            <LoginButton />
            <ul className="mt-6 space-y-3">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium Tier */}
          <div className="rounded-xl border-2 border-primary bg-card p-8">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-xl font-bold">Premium</h2>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Coming Soon
              </span>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Full curriculum with advanced modules and capstone.
            </p>
            <p className="mb-6">
              <span className="text-4xl font-bold">TBD</span>
              <span className="text-muted-foreground"> /one-time</span>
            </p>
            <Button
              className="w-full"
              render={<Link href="/waitlist" />}
            >
              Join the Waitlist
            </Button>
            <ul className="mt-6 space-y-3">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
