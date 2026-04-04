"use client";

import { useOptimistic, useTransition, useState, useRef } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { toggleCheckpoint } from "@/app/(app)/modules/[slug]/actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { XPPopup } from "@/components/gamification/xp-popup";
import { showRewardToasts } from "@/components/gamification/reward-toasts";
import { ModuleCompleteShare } from "@/components/modules/module-complete-share";

interface CheckpointListProps {
  moduleNumber: number;
  moduleTitle: string;
  checkpoints: string[];
  completedIndexes: number[];
  totalCompletedModules: number;
}

export function CheckpointList({
  moduleNumber,
  moduleTitle,
  checkpoints,
  completedIndexes,
  totalCompletedModules,
}: CheckpointListProps) {
  const [optimisticCompleted, addOptimistic] = useOptimistic(
    completedIndexes,
    (state: number[], index: number) => {
      if (state.includes(index)) {
        return state.filter((i) => i !== index);
      }
      return [...state, index];
    }
  );
  const [isPending, startTransition] = useTransition();
  const [xpTrigger, setXpTrigger] = useState(0);
  const [showShareModal, setShowShareModal] = useState<number | null>(null);
  const togglingRef = useRef(false);

  const handleToggle = (index: number) => {
    if (togglingRef.current) return;
    togglingRef.current = true;
    const willComplete = !optimisticCompleted.includes(index);

    startTransition(async () => {
      addOptimistic(index);
      try {
        const result = await toggleCheckpoint(moduleNumber, index, willComplete);
        if (willComplete && result) {
          setXpTrigger((t) => t + 1);
          showRewardToasts(result);
          if (result.moduleCompleted) {
            setShowShareModal(result.moduleCompleted);
          }
        }
      } catch {
        toast.error("Failed to update checkpoint");
      } finally {
        togglingRef.current = false;
      }
    });
  };

  const completedCount = optimisticCompleted.length;
  const totalCount = checkpoints.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="relative rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">
          Checkpoints ({completedCount}/{totalCount})
        </h2>
        <div className="relative">
          <span className="text-sm text-muted-foreground">
            {progressPercent}%
          </span>
          <XPPopup xp={10} trigger={xpTrigger} />
        </div>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className={cn("space-y-2 transition-opacity", isPending && "opacity-70")} role="group" aria-label="Module checkpoints">
        {checkpoints.map((checkpoint, index) => {
          const isCompleted = optimisticCompleted.includes(index);
          return (
            <button
              key={index}
              role="checkbox"
              aria-checked={isCompleted}
              data-checkpoint-index={index}
              onClick={() => handleToggle(index)}
              disabled={isPending}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all",
                isCompleted
                  ? "bg-green-500/5 text-foreground"
                  : "hover:bg-muted text-muted-foreground",
                isPending && "pointer-events-none"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" />
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0" />
              )}
              <span className={isCompleted ? "line-through opacity-60" : ""}>
                {checkpoint}
              </span>
            </button>
          );
        })}
      </div>
      {showShareModal && (
        <ModuleCompleteShare
          moduleNumber={showShareModal}
          moduleTitle={moduleTitle}
          completedCount={totalCompletedModules + 1}
        />
      )}
    </div>
  );
}
