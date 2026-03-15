"use client";

import { ErrorFallback } from "@/components/layout/error-fallback";

export default function CheatSheetsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback message="We couldn't load the cheat sheets." reset={reset} />;
}
