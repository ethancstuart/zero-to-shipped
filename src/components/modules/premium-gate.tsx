import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <h2 className="mb-2 text-xl font-bold">Premium Content</h2>
          <p className="mb-6 text-muted-foreground">
            Module {moduleNumber}: {moduleTitle} is part of the premium
            curriculum. Join the waitlist to get access when it launches.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button render={<Link href="/pricing" />}>
              View Pricing
              <ArrowRight className="ml-1 size-4" />
            </Button>
            <Button variant="outline" render={<Link href="/modules" />}>
              Back to Modules
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
