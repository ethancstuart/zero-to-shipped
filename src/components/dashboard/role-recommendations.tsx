import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MODULE_METADATA } from "@/lib/content/modules";
import type { RoleTrack, ModuleProgress } from "@/types";

// Prioritized module numbers per role track (after foundations)
const ROLE_PRIORITIES: Record<RoleTrack, number[]> = {
  pm: [8, 7, 9, 15, 11],
  pjm: [8, 9, 14, 15, 13],
  ba: [7, 9, 10, 12, 8],
  bi: [9, 12, 13, 6, 14],
};

interface RoleRecommendationsProps {
  roleTrack: RoleTrack;
  progress: ModuleProgress[];
}

export function RoleRecommendations({
  roleTrack,
  progress,
}: RoleRecommendationsProps) {
  const completedNumbers = progress
    .filter((p) => p.status === "completed")
    .map((p) => p.module_number);
  const availableNumbers = progress
    .filter((p) => p.status === "available" || p.status === "in_progress")
    .map((p) => p.module_number);

  const priorities = ROLE_PRIORITIES[roleTrack] ?? [];
  const recommended = priorities
    .filter(
      (n) => !completedNumbers.includes(n) && availableNumbers.includes(n)
    )
    .slice(0, 3)
    .map((n) => MODULE_METADATA.find((m) => m.number === n))
    .filter(Boolean);

  if (recommended.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 font-semibold">Recommended for Your Track</h2>
      <div className="space-y-3">
        {recommended.map((mod) => (
          <div key={mod!.number} className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {mod!.number}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium">{mod!.title}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {mod!.estimatedHours} hours
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              render={<Link href={`/modules/${mod!.slug}`} />}
            >
              <ArrowRight className="size-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
