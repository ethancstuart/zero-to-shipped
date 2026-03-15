"use client";

import { ErrorFallback } from "@/components/layout/error-fallback";

export default function CheatSheetError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback message="We couldn't load this cheat sheet." reset={reset} />;
}
