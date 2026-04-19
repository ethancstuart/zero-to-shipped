import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TEMPLATES } from "@/lib/library/templates";
import { TemplateCard } from "@/components/library/TemplateCard";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "CLAUDE.md Templates — Builder's Library — Zero to Ship",
  description:
    "Ready-to-use CLAUDE.md project instruction files for Claude Code. Blank Canvas (free), Next.js + Supabase, Data Dashboard, and Automation Project templates.",
  openGraph: {
    title: "CLAUDE.md Templates — Zero to Ship",
    description:
      "4 CLAUDE.md templates for different project types. Blank Canvas is free — the rest unlock with your email.",
    url: `${siteConfig.url}/library/claude-md-templates`,
  },
};

export default function ClaudeMdTemplatesPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4">
        {/* Breadcrumb */}
        <Link
          href="/library"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Builder&apos;s Library
        </Link>

        {/* Hero */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Templates
            </span>
            <span className="text-xs text-muted-foreground">4 templates</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            CLAUDE.md Templates
          </h1>
          <p className="text-lg text-muted-foreground">
            CLAUDE.md is the instruction file you put at the root of every project — it
            tells Claude Code everything it needs to know so you don&apos;t re-explain it every
            session. These templates are production-ready starting points. Pick the one that
            matches your stack, fill in the gaps, and you&apos;re set.
          </p>
        </div>

        {/* What is CLAUDE.md explainer */}
        <div className="mb-8 rounded-xl border border-border bg-muted/30 p-5">
          <h2 className="mb-2 font-semibold">How to use these templates</h2>
          <ol className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground">
            <li>Copy the template that matches your project type</li>
            <li>Create a file called <code className="rounded bg-muted px-1 py-0.5 text-xs">CLAUDE.md</code> at the root of your project</li>
            <li>Paste and fill in the <code className="rounded bg-muted px-1 py-0.5 text-xs">[TODO]</code> sections</li>
            <li>Open Claude Code with <code className="rounded bg-muted px-1 py-0.5 text-xs">claude</code> — it reads the file automatically</li>
          </ol>
        </div>

        {/* Template cards */}
        <div className="flex flex-col gap-4">
          {TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 rounded-xl border border-border bg-card p-7 text-center">
          <h2 className="mb-2 text-lg font-bold">Want to build this yourself?</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Module 1 of Zero to Ship walks you through setting up CLAUDE.md for your first real project.
          </p>
          <Link
            href="/preview/module-1"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try Module 1 Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
