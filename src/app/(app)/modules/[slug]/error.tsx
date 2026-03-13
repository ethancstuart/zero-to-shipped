"use client";

import { AlertCircle, RefreshCw, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ModuleReaderError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <AlertCircle className="mx-auto mb-4 size-12 text-destructive/60" />
      <h1 className="mb-2 text-xl font-bold">Failed to load module</h1>
      <p className="mb-6 text-muted-foreground">
        We couldn&apos;t load this module. Try again or head back to the module
        browser.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button onClick={reset} variant="outline">
          <RefreshCw className="mr-2 size-4" />
          Try Again
        </Button>
        <Button render={<Link href="/modules" />}>
          <BookOpen className="mr-2 size-4" />
          All Modules
        </Button>
      </div>
    </div>
  );
}
