import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/pricing/checkout-button";

interface PremiumGateProps {
  moduleTitle: string;
  moduleNumber: number;
  description: string;
}

export function PremiumGate({
  moduleTitle,
  moduleNumber,
  description,
}: PremiumGateProps) {
  return (
    <div className="relative">
      {/* Blurred preview */}
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
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-md text-center">
          <Lock className="mx-auto mb-4 size-12 text-muted-foreground/40" />
          <h2 className="mb-2 text-xl font-bold">You&apos;ve learned the foundations</h2>
          <p className="mb-6 text-muted-foreground">
            Upgrade to build your capstone and earn your certificate.
            Module {moduleNumber}: {moduleTitle} is part of the premium curriculum.
          </p>
          <div className="flex flex-col items-center gap-3">
            <div className="w-full max-w-xs">
              <CheckoutButton tier="full_access" label="Get Full Access — $79" />
            </div>
            <p className="text-sm font-medium text-green-500">
              Founding member price: $49
            </p>
            <Button variant="outline" render={<Link href="/pricing" />}>
              Compare Plans
              <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
