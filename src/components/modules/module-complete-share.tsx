"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/profile/share-buttons";

interface ModuleCompleteShareProps {
  moduleNumber: number;
  moduleTitle: string;
  completedCount: number;
}

export function ModuleCompleteShare({
  moduleNumber,
  moduleTitle,
  completedCount,
}: ModuleCompleteShareProps) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/og?template=module-complete&title=${encodeURIComponent(moduleTitle)}&number=${moduleNumber}&completed=${completedCount}`;
  const shareTitle = `I just completed Module ${moduleNumber}: ${moduleTitle} on Zero to Shipped! ${completedCount}/16 done.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="size-6 text-green-500" />
          </div>
          <div>
            <h2 className="font-bold">Module Complete!</h2>
            <p className="text-sm text-muted-foreground">
              Module {moduleNumber}: {moduleTitle}
            </p>
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          You&apos;ve completed {completedCount} of 16 modules. Share your progress!
        </p>

        <ShareButtons
          url={shareUrl}
          title={shareTitle}
        />
      </div>
    </div>
  );
}
