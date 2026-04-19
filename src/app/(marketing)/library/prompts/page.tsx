import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PromptLibraryClient } from "@/components/library/PromptLibraryClient";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Prompt Library — Builder's Library — Zero to Ship",
  description:
    "40+ copy-paste prompts for building apps, debugging errors, refactoring code, shipping, thinking through problems, and PM-specific tasks.",
  openGraph: {
    title: "Prompt Library — Zero to Ship",
    description: "40+ copy-paste prompts for non-engineers building with AI tools.",
    url: `${siteConfig.url}/library/prompts`,
    images: [
      {
        url: `/api/og?template=guide&title=${encodeURIComponent("Prompt Library")}&subtitle=${encodeURIComponent("40+ Copy-Paste Prompts for Builders — Zero to Ship")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function PromptsPage() {
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
              Prompts
            </span>
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Prompt Library
          </h1>
          <p className="text-lg text-muted-foreground">
            40+ prompts across 6 categories — ready to copy, customize, and paste into
            Cursor or Claude Code. Try the first 10 free. One email unlocks everything,
            including PM-specific prompts for PRDs, stakeholder updates, and roadmap narratives.
          </p>
        </div>

        {/* Interactive prompt library */}
        <PromptLibraryClient />

        {/* Bottom CTA */}
        <div className="mt-16 rounded-xl border border-border bg-card p-7 text-center">
          <h2 className="mb-2 text-lg font-bold">Want to build this yourself?</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Module 1 of Zero to Ship walks you through building your first real app — step by step.
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
