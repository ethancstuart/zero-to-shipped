"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Lock } from "lucide-react";
import type { Template } from "@/lib/library/templates";
import { LibraryEmailGate } from "./LibraryEmailGate";

const STORAGE_KEY = "zts_templates_unlocked";

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template.content);
    } catch {
      const el = document.createElement("textarea");
      el.value = template.content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          {!template.free && (
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{template.title}</h3>
              {template.free ? (
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                  Free
                </span>
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Email required
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{template.description}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Stack: {template.stack}</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span>Close</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>Preview</span>
            </>
          )}
        </button>
      </div>

      {/* Content */}
      {expanded && (
        <div className="border-t border-border">
          {template.free ? (
            <div className="p-5">
              <div className="mb-3 flex justify-end">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-green-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy to clipboard</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm leading-relaxed text-muted-foreground overflow-auto max-h-96">
                {template.content}
              </pre>
            </div>
          ) : (
            <div className="p-5">
              <LibraryEmailGate
                storageKey={STORAGE_KEY}
                heading="Unlock this template"
                description="Enter your email to access all 4 CLAUDE.md templates — free."
              >
                <div>
                  <div className="mb-3 flex justify-end">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-green-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy to clipboard</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm leading-relaxed text-muted-foreground overflow-auto max-h-96">
                    {template.content}
                  </pre>
                </div>
              </LibraryEmailGate>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
