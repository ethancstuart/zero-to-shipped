"use client";

import { toast } from "sonner";
import type { CheckpointResult } from "@/types";
import { siteConfig } from "@/lib/constants";

function ShareButton({ text, url }: { text: string; url: string }) {
  const twitterText = encodeURIComponent(`${text}\n\n${url}`);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="mt-2 flex gap-2">
      <button
        onClick={() => window.open(linkedinUrl, "_blank", "width=600,height=600")}
        className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20"
      >
        Share on LinkedIn
      </button>
      <button
        onClick={() => window.open(twitterUrl, "_blank", "width=600,height=400")}
        className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20"
      >
        Share on X
      </button>
    </div>
  );
}

export function showRewardToasts(result: CheckpointResult) {
  const shareUrl = siteConfig.url;

  // Badge toasts
  for (const badge of result.badgesEarned) {
    toast(
      <div>
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label={badge.name}>{badge.icon}</span>
          <div>
            <p className="font-semibold">Badge Earned: {badge.name}</p>
            <p className="text-sm text-muted-foreground">{badge.description}</p>
          </div>
        </div>
        <ShareButton
          text={`I just earned the ${badge.name} badge on Zero to Ship!`}
          url={shareUrl}
        />
      </div>,
      { duration: 8000 }
    );
  }

  // Level-up toast
  if (result.newLevel) {
    toast(
      <div>
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="Level up celebration">🎉</span>
          <div>
            <p className="font-semibold">Level Up!</p>
            <p className="text-sm text-muted-foreground">
              {result.previousLevel} → {result.newLevel}
            </p>
          </div>
        </div>
        <ShareButton
          text={`I just leveled up to ${result.newLevel} on Zero to Ship!`}
          url={shareUrl}
        />
      </div>,
      { duration: 8000 }
    );
  }

  // Streak milestone toast
  if (result.streakMilestone) {
    const emoji = result.streakMilestone >= 30 ? "🏆" : result.streakMilestone >= 7 ? "💪" : "🔥";
    toast(
      <div>
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label={`${result.streakMilestone}-day streak`}>{emoji}</span>
          <div>
            <p className="font-semibold">{result.streakMilestone}-Day Streak!</p>
            <p className="text-sm text-muted-foreground">
              Keep the momentum going!
            </p>
          </div>
        </div>
        <ShareButton
          text={`${result.streakMilestone}-day learning streak on Zero to Ship!`}
          url={shareUrl}
        />
      </div>,
      { duration: 8000 }
    );
  }
}
