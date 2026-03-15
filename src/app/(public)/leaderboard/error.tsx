"use client";

import { ErrorFallback } from "@/components/layout/error-fallback";

export default function LeaderboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback message="We couldn't load the leaderboard." reset={reset} />;
}
