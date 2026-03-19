"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <AlertCircle className="mx-auto mb-4 size-12 text-destructive/60" />
      <h1 className="mb-2 text-xl font-bold">Something went wrong</h1>
      <p className="mb-6 text-muted-foreground">
        This is usually temporary. Try refreshing or head back to the homepage.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button onClick={reset} variant="outline">
          <RefreshCw className="mr-2 size-4" />
          Try Again
        </Button>
        <Button render={<Link href="/" />}>
          <Home className="mr-2 size-4" />
          Home
        </Button>
      </div>
    </div>
  );
}
