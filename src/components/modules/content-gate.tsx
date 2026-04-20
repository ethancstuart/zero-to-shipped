import Link from "next/link";
import { Lock } from "lucide-react";
import { LoginButton } from "@/components/layout/login-button";

interface ContentGateProps {
  moduleTitle: string;
  gatedHtml: string;
}

export function ContentGate({ moduleTitle, gatedHtml }: ContentGateProps) {
  return (
    <div className="relative mt-12">
      {/* Blurred teaser of gated content */}
      <div
        className="pointer-events-none max-h-64 select-none overflow-hidden blur-[6px]"
        aria-hidden="true"
      >
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: gatedHtml }} />
        </div>
      </div>

      {/* Gradient fade over blurred content */}
      <div className="absolute inset-0 bg-gradient-to-t from-background from-30% to-transparent" />

      {/* Sign-in prompt */}
      <div className="absolute inset-x-0 bottom-0 pb-4 text-center">
        <div className="mx-auto max-w-md">
          <Lock className="mx-auto mb-3 size-10 text-primary/60" />
          <h2 className="mb-2 text-xl font-bold">
            Keep reading {moduleTitle}
          </h2>
          <p className="mb-1 text-sm text-muted-foreground">
            You just read the first 3 parts. Sign in to unlock the rest of this
            module plus all 5 foundation modules — completely free.
          </p>
          <p className="mb-5 text-xs text-muted-foreground">
            No credit card required. Just a Google account.
          </p>
          <LoginButton source="preview_gate" />
          <p className="mt-4 text-xs text-muted-foreground">
            Ready to go all in?{" "}
            <Link
              href="/pricing"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Get all 16 modules — $99
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
