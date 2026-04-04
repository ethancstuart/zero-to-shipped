"use client";

import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContinueBannerProps {
  completedIndexes: number[];
  totalCheckpoints: number;
}

function scrollToFirstUnchecked(totalCheckpoints: number, completedIndexes: number[]) {
  for (let i = 0; i < totalCheckpoints; i++) {
    if (!completedIndexes.includes(i)) {
      const el = document.querySelector(`[data-checkpoint-index="${i}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
  }
}

export function ContinueBanner({
  completedIndexes,
  totalCheckpoints,
}: ContinueBannerProps) {
  const hasPartialProgress =
    completedIndexes.length > 0 && completedIndexes.length < totalCheckpoints;

  useEffect(() => {
    if (!hasPartialProgress) return;

    const timer = setTimeout(() => {
      scrollToFirstUnchecked(totalCheckpoints, completedIndexes);
    }, 500);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hasPartialProgress) return null;

  return (
    <div className="mb-6 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
      <p className="text-sm text-foreground">
        You&apos;ve completed{" "}
        <span className="font-semibold">
          {completedIndexes.length} of {totalCheckpoints}
        </span>{" "}
        checkpoints.
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => scrollToFirstUnchecked(totalCheckpoints, completedIndexes)}
        className="shrink-0 gap-1 text-primary"
      >
        Continue
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
