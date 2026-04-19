"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Lock } from "lucide-react";
import type { Template } from "@/lib/library/templates";
import { LibraryEmailGate } from "./LibraryEmailGate";

const STORAGE_KEY = "zts_templates_unlocked";

interface TemplateCardProps {
  template: Template;
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      const el = document.createElement("textarea");
      el.value = content;
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
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted min-h-[40px]"
      aria-label="Copy template to clipboard"
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
  );
}

function TemplateContent({ content }: { content: string }) {
  return (
    <div>
      <div className="mb-3 flex justify-end">
        <CopyButton content={content} />
      </div>
      <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm leading-relaxed text-muted-foreground overflow-auto max-h-96">
        {content}
      </pre>
    </div>
  );
}

export function TemplateCard({ template }: TemplateCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3 min-w-0">
          {!template.free && (
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
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
          className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted min-h-[40px]"
          aria-label={expanded ? `Collapse ${template.title}` : `Preview ${template.title}`}
          aria-expanded={expanded}
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
        <div className="border-t border-border p-5">
          {template.free ? (
            <TemplateContent content={template.content} />
          ) : (
            <LibraryEmailGate
              storageKey={STORAGE_KEY}
              heading="Unlock this template"
              description="One email unlocks all 4 CLAUDE.md templates — free."
            >
              <TemplateContent content={template.content} />
            </LibraryEmailGate>
          )}
        </div>
      )}
    </div>
  );
}
