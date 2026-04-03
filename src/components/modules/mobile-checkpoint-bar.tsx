"use client";

interface MobileCheckpointBarProps {
  completedCount: number;
  totalCount: number;
}

export function MobileCheckpointBar({
  completedCount,
  totalCount,
}: MobileCheckpointBarProps) {
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const scrollToCheckpoints = () => {
    const el = document.querySelector('[aria-label="Module checkpoints"]');
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <button
      onClick={scrollToCheckpoints}
      className="fixed bottom-4 left-4 right-4 z-40 flex items-center gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm lg:hidden"
    >
      <div className="flex-1">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            {completedCount} of {totalCount} checkpoints
          </span>
          <span className="text-xs text-muted-foreground">
            {progressPercent}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </button>
  );
}
