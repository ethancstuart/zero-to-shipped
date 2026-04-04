"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

const COMMON_ISSUES = [
  {
    problem: "Terminal says 'command not found'",
    solution:
      "Close and reopen your terminal, then try again. The command should work after a fresh start.",
  },
  {
    problem: "Permission denied errors",
    solution:
      "On Mac, prefix the command with sudo. On Windows, right-click your terminal and select \"Run as Administrator.\"",
  },
  {
    problem: "The AI gave me an error",
    solution:
      "Copy the full error message and paste it back to the AI. Say \"fix this error.\" It will almost always know what to do.",
  },
  {
    problem: "My app won't start",
    solution:
      "Check that you saved all files (Cmd+S / Ctrl+S), then try npm run dev again in your terminal.",
  },
] as const;

export function StuckHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-50 lg:bottom-6">
      {/* Expanded panel */}
      {isOpen && (
        <div className="mb-3 w-80 rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Common Issues</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close help panel"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {COMMON_ISSUES.map((issue) => (
              <div key={issue.problem} className="px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  {issue.problem}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {issue.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pill button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ml-auto flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-lg transition-colors hover:border-primary/50 hover:text-primary"
        aria-label={isOpen ? "Close help" : "Get help if you're stuck"}
      >
        <HelpCircle className="size-4" />
        Stuck?
      </button>
    </div>
  );
}
