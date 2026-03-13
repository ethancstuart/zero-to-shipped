"use client";

import { useState } from "react";
import { Terminal, MousePointer, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ToolPreference } from "@/types";
import { TOOL_LABELS } from "@/lib/constants";

interface ToolSetupBannerProps {
  toolPreference: ToolPreference;
}

export function ToolSetupBanner({ toolPreference }: ToolSetupBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed) return null;

  const isClaude = toolPreference === "claude-code";

  return (
    <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {isClaude ? (
            <Terminal className="mt-0.5 size-5 text-primary" />
          ) : (
            <MousePointer className="mt-0.5 size-5 text-primary" />
          )}
          <div>
            <p className="font-medium">
              Ready to build with {TOOL_LABELS[toolPreference]}?
            </p>
            <p className="text-sm text-muted-foreground">
              From this module on, you&apos;ll work inside your AI coding tool.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            Setup Guide
            {expanded ? (
              <ChevronUp className="ml-1 size-3" />
            ) : (
              <ChevronDown className="ml-1 size-3" />
            )}
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-2 border-t border-primary/20 pt-4 text-sm">
          {isClaude ? (
            <ol className="list-inside list-decimal space-y-1.5 text-muted-foreground">
              <li>
                Install Claude Code:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  npm install -g @anthropic-ai/claude-code
                </code>
              </li>
              <li>Open your terminal and navigate to your project folder</li>
              <li>
                Run{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  claude
                </code>{" "}
                to start an interactive session
              </li>
              <li>Follow along with the module exercises in the terminal</li>
            </ol>
          ) : (
            <ol className="list-inside list-decimal space-y-1.5 text-muted-foreground">
              <li>
                Download Cursor from{" "}
                <span className="font-medium text-foreground">cursor.com</span>
              </li>
              <li>Open your project folder in Cursor</li>
              <li>
                Use <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">Cmd+K</kbd>{" "}
                (Mac) or <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">Ctrl+K</kbd>{" "}
                (Windows) to open the AI prompt
              </li>
              <li>Follow along with the module exercises in the editor</li>
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
