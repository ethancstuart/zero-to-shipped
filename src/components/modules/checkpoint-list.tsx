"use client";

import { useOptimistic, useTransition } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { toggleCheckpoint } from "@/app/(app)/modules/[slug]/actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CheckpointListProps {
  moduleNumber: number;
  checkpoints: string[];
  completedIndexes: number[];
}

export function CheckpointList({
  moduleNumber,
  checkpoints,
  completedIndexes,
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

  const handleToggle = (index: number) => {
    const willComplete = !optimisticCompleted.includes(index);

    startTransition(async () => {
      addOptimistic(index);
      try {
        await toggleCheckpoint(moduleNumber, index, willComplete);
        if (willComplete) {
          toast.success("Checkpoint completed! +10 XP");
        }
      } catch {
        toast.error("Failed to update checkpoint");
      }
    });
  };

  const completedCount = optimisticCompleted.length;
  const totalCount = checkpoints.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">
          Checkpoints ({completedCount}/{totalCount})
        </h2>
        <span className="text-sm text-muted-foreground">
          {progressPercent}%
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="space-y-2">
        {checkpoints.map((checkpoint, index) => {
          const isCompleted = optimisticCompleted.includes(index);
          return (
            <button
              key={index}
              onClick={() => handleToggle(index)}
              disabled={isPending}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                isCompleted
                  ? "bg-green-500/5 text-foreground"
                  : "hover:bg-muted text-muted-foreground"
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
    </div>
  );
}
