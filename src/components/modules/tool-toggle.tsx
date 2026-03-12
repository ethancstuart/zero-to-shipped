"use client";

import { useTransition } from "react";
import { updateToolPreference } from "@/app/(app)/modules/[slug]/actions";
import { cn } from "@/lib/utils";
import type { ToolPreference } from "@/types";
import { TOOL_LABELS } from "@/lib/constants";

export function ToolToggle({ current }: { current: ToolPreference }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (tool: ToolPreference) => {
    if (tool === current) return;
    startTransition(() => updateToolPreference(tool));
  };

  return (
    <div className="inline-flex rounded-lg border border-border bg-muted p-1">
      {(["claude-code", "cursor"] as ToolPreference[]).map((tool) => (
        <button
          key={tool}
          onClick={() => handleToggle(tool)}
          disabled={isPending}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            current === tool
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {TOOL_LABELS[tool]}
        </button>
      ))}
    </div>
  );
}
