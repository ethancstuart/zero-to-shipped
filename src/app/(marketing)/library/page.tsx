import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Terminal,
  Cpu,
  FileCode,
  Wrench,
  Zap,
  Bug,
  ArrowRight,
} from "lucide-react";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Builder's Library — Zero to Ship",
  description:
    "Free resources to help non-engineers build real software with AI tools. Prompts, dev environment setup, AI workflow OS, CLAUDE.md templates, and more.",
  openGraph: {
    title: "Builder's Library — Zero to Ship",
    description:
      "Free resources to help non-engineers build real software with AI tools.",
    url: `${siteConfig.url}/library`,
  },
};

const resources = [
  {
    href: "/library/prompts",
    icon: BookOpen,
    title: "Prompt Library",
    description: "40+ copy-paste prompts for building, debugging, refactoring, and shipping",
    category: "Prompts",
    badge: "Email required",
    badgeVariant: "gated" as const,
    meta: "40+ prompts",
    live: true,
  },
  {
    href: "/library/dev-environment",
    icon: Terminal,
    title: "Dev Environment Setup",
    description: "Step-by-step Mac and Windows setup guide — Node, Git, Cursor, Claude Code, Vercel",
    category: "Setup",
    badge: "Free",
    badgeVariant: "free" as const,
    meta: "45 min",
    live: true,
  },
  {
    href: "/library/ai-workflow-os",
    icon: Cpu,
    title: "AI Workflow OS",
    description: "How to structure your AI development world — CLAUDE.md, MCP servers, the build loop",
    category: "Workflow",
    badge: "Free",
    badgeVariant: "free" as const,
    meta: "30 min",
    live: true,
  },
  {
    href: "/library/claude-md-templates",
    icon: FileCode,
    title: "CLAUDE.md Templates",
    description: "Ready-to-use project instruction files for Claude Code — 4 templates for different stacks",
    category: "Templates",
    badge: "Email required",
    badgeVariant: "gated" as const,
    meta: "4 templates",
    live: true,
  },
  {
    href: "/library/builder-tools",
    icon: Wrench,
    title: "Builder's Tool Stack",
    description: "The full modern builder stack — every tool you need, with free tier notes",
    category: "Tools",
    badge: "Free",
    badgeVariant: "free" as const,
    meta: "Coming Week 2",
    live: false,
  },
  {
    href: "/library/prompt-patterns",
    icon: Zap,
    title: "Prompt Patterns Cheat Sheet",
    description: "5 core patterns, power phrases, and an evaluation framework for every AI output",
    category: "Prompts",
    badge: "Free",
    badgeVariant: "free" as const,
    meta: "Coming Week 3",
    live: false,
  },
  {
    href: "/library/debugging",
    icon: Bug,
    title: "Debugging with AI",
    description: "The 5-step loop for when the AI breaks your code — the most shareable guide",
    category: "Workflow",
    badge: "Free",
    badgeVariant: "free" as const,
    meta: "Coming Week 4",
    live: false,
  },
];

export default function LibraryPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-5xl px-4">
        {/* Hero */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Builder&apos;s Library
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Learn to build in the AI age
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Free resources for PMs, BAs, and non-engineers who want to build real software
            with AI tools. Prompts, setup guides, workflow systems, and templates — everything
            you need to become a builder.
          </p>
        </div>

        {/* Resource grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => {
            const Icon = r.icon;
            const card = (
              <div
                className={`flex h-full flex-col rounded-xl border bg-card p-5 transition-colors ${
                  r.live
                    ? "border-border hover:border-primary/50"
                    : "border-border/50 opacity-60"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      r.badgeVariant === "free"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {r.badge}
                  </span>
                </div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {r.category}
                  </span>
                </div>
                <h2 className="mb-1.5 font-semibold leading-snug">{r.title}</h2>
                <p className="mb-4 flex-1 text-sm text-muted-foreground">{r.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{r.meta}</span>
                  {r.live && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  )}
                </div>
              </div>
            );

            return r.live ? (
              <Link key={r.href} href={r.href} className="group">
                {card}
              </Link>
            ) : (
              <div key={r.href}>{card}</div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="mb-2 text-xl font-bold">
            Ready to build your first real product?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Module 1 of Zero to Ship is completely free — no account required.
            Go from zero to a working app in one session.
          </p>
          <Link
            href="/preview/module-1"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try Module 1 Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
