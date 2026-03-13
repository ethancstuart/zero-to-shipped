import { CheckCircle2 } from "lucide-react";
import { LoginButton } from "@/components/layout/login-button";
import { CheckoutButton } from "@/components/pricing/checkout-button";

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

const EXTRAS_FEATURES = [
  "Everything in Full Access",
  "Premium cheat sheets",
  "Prompt library",
  "Priority content updates",
];

export default function PricingPage() {
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

        <div className="grid gap-6 sm:grid-cols-3">
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
            <p className="mb-6">
              <span className="text-4xl font-bold">$149</span>
              <span className="text-muted-foreground"> /one-time</span>
            </p>
            <CheckoutButton
              tier="full_access"
              label="Get Full Access"
            />
            <ul className="mt-6 space-y-3">
              {FULL_ACCESS_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Full Access + Extras */}
          <div className="rounded-xl border border-border bg-card p-8">
            <h2 className="mb-1 text-xl font-bold">Full Access + Extras</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Everything plus premium resources and priority updates.
            </p>
            <p className="mb-6">
              <span className="text-4xl font-bold">$249</span>
              <span className="text-muted-foreground"> /one-time</span>
            </p>
            <CheckoutButton
              tier="extras"
              label="Get Full Access + Extras"
            />
            <ul className="mt-6 space-y-3">
              {EXTRAS_FEATURES.map((feature) => (
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
