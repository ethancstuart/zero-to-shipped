import { cn } from "@/lib/utils";

interface StreakCalendarProps {
  /** Map of ISO date string (YYYY-MM-DD) to activity count */
  activityMap: Record<string, number>;
}

export function StreakCalendar({ activityMap }: StreakCalendarProps) {
  // Build 12 weeks (84 days) ending today
  const days: { date: string; count: number }[] = [];
  const today = new Date();

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push({ date: key, count: activityMap[key] ?? 0 });
  }

  // Group by week (columns of 7)
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div>
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} activities`}
                className={cn(
                  "size-3 rounded-sm",
                  day.count === 0
                    ? "bg-muted"
                    : day.count <= 2
                    ? "bg-primary/30"
                    : day.count <= 5
                    ? "bg-primary/60"
                    : "bg-primary"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
