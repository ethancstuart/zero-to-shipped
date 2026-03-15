"use client";

import { ErrorFallback } from "@/components/layout/error-fallback";

export default function BuildLogError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback message="We couldn't load your build log." reset={reset} />;
}
