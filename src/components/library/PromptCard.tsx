"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Prompt } from "@/lib/library/prompts";
import { CATEGORY_LABELS } from "@/lib/library/prompts";

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
    } catch {
      const el = document.createElement("textarea");
      el.value = prompt.prompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="mb-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {CATEGORY_LABELS[prompt.category]}
          </span>
          <h3 className="font-semibold leading-snug">{prompt.title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{prompt.description}</p>
        </div>
        <button
          onClick={handleCopy}
          className="mt-1 flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          aria-label="Copy prompt"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm leading-relaxed text-muted-foreground">
        {prompt.prompt}
      </pre>
    </div>
  );
}
