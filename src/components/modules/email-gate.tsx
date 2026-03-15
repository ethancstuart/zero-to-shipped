import { Mail } from "lucide-react";
import { LoginButton } from "@/components/layout/login-button";

interface EmailGateProps {
  moduleTitle: string;
  description: string;
}

export function EmailGate({ moduleTitle, description }: EmailGateProps) {
  return (
    <div className="relative">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-sm">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p>{description}</p>
          <p>
            In this module, you&apos;ll install your tools, write your first
            prompt, and build a working application — all in one sitting. No
            prior coding experience required.
          </p>
          <h2>What you&apos;ll learn</h2>
          <ul>
            <li>Set up your AI coding environment</li>
            <li>Build a working app from a natural language prompt</li>
            <li>Master the build loop: prompt, review, run, evaluate, iterate</li>
            <li>Debug your first issue using the debugging protocol</li>
          </ul>
        </div>
      </div>

      {/* Gate overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-md text-center">
          <Mail className="mx-auto mb-4 size-12 text-primary/60" />
          <h2 className="mb-2 text-xl font-bold">
            Get free access to Module 1
          </h2>
          <p className="mb-2 text-muted-foreground">
            <span className="font-medium text-foreground">{moduleTitle}</span>{" "}
            — {description}
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            Sign in with Google to unlock all 5 foundation modules for free. No
            credit card required.
          </p>
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
