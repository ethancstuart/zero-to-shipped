"use client";

import { ErrorFallback } from "@/components/layout/error-fallback";

export default function ReferralsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback message="We couldn't load your referrals." reset={reset} />;
}
