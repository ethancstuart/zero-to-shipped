import {
  Activity,
  CheckCircle2,
  BookOpen,
  Flame,
  Award,
  Layers,
  Rocket,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { XPEvent } from "@/types";

const EVENT_CONFIG: Record<
  string,
  { icon: typeof CheckCircle2; label: string; color: string }
> = {
  checkpoint: {
    icon: CheckCircle2,
    label: "Completed checkpoint",
    color: "text-green-500",
  },
  module_complete: {
    icon: BookOpen,
    label: "Finished module",
    color: "text-primary",
  },
  tier_complete: {
    icon: Layers,
    label: "Tier completed",
    color: "text-yellow-500",
  },
  streak_bonus: {
    icon: Flame,
    label: "Streak bonus",
    color: "text-orange-500",
  },
  badge_earned: {
    icon: Award,
    label: "Badge earned",
    color: "text-purple-500",
  },
  capstone: {
    icon: Rocket,
    label: "Capstone completed",
    color: "text-primary",
  },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface ActivityFeedProps {
  events: XPEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="Start Module 1 to see your progress here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const config = EVENT_CONFIG[event.event_type] ?? EVENT_CONFIG.checkpoint;
        const Icon = config.icon;
        return (
          <div
            key={event.id}
            className="flex items-center gap-3 text-sm"
          >
            <Icon className={`size-4 shrink-0 ${config.color}`} />
            <span className="flex-1 text-muted-foreground">{config.label}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {timeAgo(event.created_at)}
            </span>
            <span className="shrink-0 font-medium text-primary">
              +{event.xp_amount}
            </span>
          </div>
        );
      })}
    </div>
  );
}
