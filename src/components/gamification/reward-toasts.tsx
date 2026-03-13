"use client";

import { toast } from "sonner";
import type { CheckpointResult } from "@/types";

export function showRewardToasts(result: CheckpointResult) {
  // Badge toasts
  for (const badge of result.badgesEarned) {
    toast(
      <div className="flex items-center gap-3">
        <span className="text-2xl">{badge.icon}</span>
        <div>
          <p className="font-semibold">Badge Earned: {badge.name}</p>
          <p className="text-sm text-muted-foreground">{badge.description}</p>
        </div>
      </div>,
      { duration: 5000 }
    );
  }

  // Level-up toast
  if (result.newLevel) {
    toast(
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎉</span>
        <div>
          <p className="font-semibold">Level Up!</p>
          <p className="text-sm text-muted-foreground">
            {result.previousLevel} → {result.newLevel}
          </p>
        </div>
      </div>,
      { duration: 5000 }
    );
  }

  // Streak milestone toast
  if (result.streakMilestone) {
    const emoji = result.streakMilestone >= 30 ? "🏆" : result.streakMilestone >= 7 ? "💪" : "🔥";
    toast(
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="font-semibold">{result.streakMilestone}-Day Streak!</p>
          <p className="text-sm text-muted-foreground">
            Keep the momentum going!
          </p>
        </div>
      </div>,
      { duration: 4000 }
    );
  }
}
