import Link from "next/link";
import {
  Lock,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/pricing/checkout-button";
import { PremiumGateTracker } from "./premium-gate-tracker";
import { FoundingCounter } from "@/components/marketing/founding-counter";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { ROLE_LABELS } from "@/lib/constants";
import {
  PAYWALL_VARIANT_COPY,
  type PaywallVariant,
} from "@/lib/experiments/paywall-variant";

interface PremiumGateProps {
  moduleTitle: string;
  moduleNumber: number;
  description: string;
  /** Number of checkpoints in this module */
  checkpointCount?: number;
  /** Estimated minutes to complete */
  estimatedMinutes?: number;
  /** Role keys this module is relevant to */
  relevantRoles?: (keyof typeof ROLE_LABELS)[];
  /** What this module teaches — 2-3 bullet points */
  learningOutcomes?: string[];
  /** What the learner will build (practical output) */
  buildOutput?: string;
  /** Number of free modules the user has completed */
  freeModulesCompleted?: number;
  /** Total number of free modules available */
  freeModulesTotal?: number;
  /** Paywall A/B test variant — assigned deterministically server-side from user.id */
  variant: PaywallVariant;
}

export function PremiumGate({
  moduleTitle,
  moduleNumber,
  description,
  checkpointCount = 5,
  estimatedMinutes = 45,
  relevantRoles = ["pm", "ba"],
  learningOutcomes = [
    "Apply intermediate patterns to real projects",
    "Build production-ready features end to end",
    "Debug and iterate using AI-assisted workflows",
  ],
  buildOutput = "a working feature you can add to your portfolio",
  freeModulesCompleted = 0,
  freeModulesTotal = 5,
  variant,
}: PremiumGateProps) {
  const variantCopy = PAYWALL_VARIANT_COPY[variant];
  const progressPercent =
    freeModulesTotal > 0
      ? Math.round((freeModulesCompleted / freeModulesTotal) * 100)
      : 0;

  return (
    <div className="relative">
      <PremiumGateTracker
        moduleNumber={moduleNumber}
        moduleTitle={moduleTitle}
        variant={variant}
      />

      {/* Blurred preview of background content */}
      <div className="pointer-events-none select-none blur-sm">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p>{description}</p>
          <p>
            This module covers intermediate and advanced concepts that will take
            your skills to the next level. You&apos;ll work through hands-on
            exercises and build real projects.
          </p>
        </div>
      </div>

      {/* Gate overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
        <div className="w-full max-w-lg px-3 sm:px-4">
          {/* Premium card with gradient border effect */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-px shadow-lg shadow-primary/5">
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="size-4 text-muted-foreground/60" />
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Premium Module {moduleNumber}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {relevantRoles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {ROLE_LABELS[role]}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CardTitle className="text-base sm:text-lg">{moduleTitle}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Module stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" />
                    {checkpointCount} checkpoints
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" />
                    ~{estimatedMinutes} min
                  </span>
                </div>

                {/* Learning outcomes */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    <Sparkles className="mr-1.5 inline size-4 text-primary" />
                    This module teaches you to:
                  </p>
                  <ul className="space-y-1.5 pl-6 text-sm text-muted-foreground">
                    {learningOutcomes.map((outcome) => (
                      <li key={outcome} className="list-disc">
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Build output */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
                  <p className="text-sm">
                    <Rocket className="mr-1.5 inline size-4 text-primary" />
                    <span className="font-medium">What you&apos;ll build:</span>{" "}
                    <span className="text-muted-foreground">{buildOutput}</span>
                  </p>
                </div>

                {/* Free progress */}
                <div className="space-y-1.5">
                  <Progress value={progressPercent}>
                    <ProgressLabel>
                      You&apos;ve completed {freeModulesCompleted} of{" "}
                      {freeModulesTotal} free modules
                    </ProgressLabel>
                    <ProgressValue />
                  </Progress>
                </div>

                {/* Pricing */}
                <div className="space-y-3 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-sm text-muted-foreground line-through">
                      $199
                    </span>
                    <span className="text-2xl font-bold">$99</span>
                    <span className="text-xs font-medium text-muted-foreground">
                      founding price
                    </span>
                  </div>
                  <FoundingCounter />
                  <p className="text-xs text-muted-foreground">
                    Founding members also get Season 2 (agent-building modules)
                    free
                  </p>
                </div>

                {/* Variant-specific hook — the A/B test signal */}
                <p className="text-center text-sm font-medium text-foreground/90">
                  {variantCopy.hook}
                </p>

                {/* CTA */}
                <div className="space-y-2">
                  <CheckoutButton
                    tier="full_access"
                    label={variantCopy.ctaLabel}
                    source="premium_gate"
                    variant={variant}
                    moduleNumber={moduleNumber}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    render={<Link href="/pricing" />}
                  >
                    Compare Plans
                    <ArrowRight className="ml-1 size-4" />
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-2">
                <p className="text-xs text-muted-foreground">
                  One-time payment. Lifetime access. No subscription.
                </p>
                <p className="text-xs text-muted-foreground">
                  Not satisfied?{" "}
                  <Link
                    href="/terms#refund-policy"
                    className="underline underline-offset-2 transition-colors hover:text-foreground"
                  >
                    14-day money-back guarantee
                  </Link>
                  . No questions asked.
                </p>
                <Link
                  href="/modules"
                  className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                >
                  Not ready yet? Continue with free modules &rarr;
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
