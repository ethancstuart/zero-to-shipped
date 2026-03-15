"use client";

import { ErrorFallback } from "@/components/layout/error-fallback";

export default function LearningPathError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback message="We couldn't load your learning path." reset={reset} />;
}
