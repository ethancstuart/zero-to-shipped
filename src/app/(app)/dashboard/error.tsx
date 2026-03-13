"use client";

import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <AlertCircle className="mx-auto mb-4 size-12 text-destructive/60" />
      <h1 className="mb-2 text-xl font-bold">Something went wrong</h1>
      <p className="mb-6 text-muted-foreground">
        We couldn&apos;t load your dashboard. This is usually temporary.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button onClick={reset} variant="outline">
          <RefreshCw className="mr-2 size-4" />
          Try Again
        </Button>
        <Button render={<Link href="/dashboard" />}>
          <Home className="mr-2 size-4" />
          Dashboard
        </Button>
      </div>
    </div>
  );
}
