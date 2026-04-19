"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { Prompt } from "@/lib/library/prompts";
import { CATEGORY_LABELS } from "@/lib/library/prompts";

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = prompt.prompt;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    clearTimeout(timerRef.current);
    setCopied(true);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="mb-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {CATEGORY_LABELS[prompt.category]}
          </span>
          <h3 className="font-semibold leading-snug">{prompt.title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{prompt.description}</p>
        </div>
        <button
          onClick={handleCopy}
          className="mt-1 flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted min-h-[40px]"
          aria-label={`Copy prompt: ${prompt.title}`}
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
      <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm leading-relaxed text-muted-foreground overflow-auto max-h-72">
        {prompt.prompt}
      </pre>

      {prompt.exampleOutput && (
        <div>
          <button
            onClick={() => setShowExample((v) => !v)}
            aria-expanded={showExample}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline min-h-[40px]"
          >
            {showExample ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Hide example output
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                See example output
              </>
            )}
          </button>

          {showExample && (
            <div className="mt-2 rounded-lg border border-border bg-background p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Example output
              </p>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground overflow-auto max-h-[500px]">
                {prompt.exampleOutput}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
