"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorFallback({
  message = "Something went wrong. This is usually temporary.",
  reset,
}: {
  message?: string;
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <AlertCircle className="mx-auto mb-4 size-12 text-destructive/60" />
      <h1 className="mb-2 text-xl font-bold">Something went wrong</h1>
      <p className="mb-6 text-muted-foreground">{message}</p>
      <Button onClick={reset} variant="outline">
        <RefreshCw className="mr-2 size-4" />
        Try Again
      </Button>
    </div>
  );
}
