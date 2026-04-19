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
    "Free resources to go from idea to working product — without an engineering background. Prompt library, dev environment setup, AI workflow guide, and CLAUDE.md templates.",
  openGraph: {
    title: "Builder's Library — Zero to Ship",
    description:
      "Free resources to go from idea to working product — without an engineering background.",
    url: `${siteConfig.url}/library`,
    images: [
      {
        url: `/api/og?template=guide&title=${encodeURIComponent("Builder's Library")}&subtitle=${encodeURIComponent("Free resources for non-engineers — Zero to Ship")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

const resources = [
  {
    href: "/library/prompts",
    icon: BookOpen,
    title: "Prompt Library",
    description: "40+ copy-paste prompts for building, debugging, writing specs, and shipping. Includes PM-specific prompts for PRDs, stakeholder updates, and roadmap narratives.",
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
    description: "Mac and Windows step-by-step guide — Node.js, Git, Cursor, Claude Code, and Vercel CLI. Everything you need to go from zero to ready-to-build.",
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
    description: "How to structure your AI development world — CLAUDE.md, MCP servers, the build loop, anti-patterns, and the mental model shift from chatbot to agent.",
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
    description: "Project instruction files for Claude Code. Four templates: Blank Canvas, Next.js + Supabase, Data Dashboard, and Automation Project.",
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
    description: "Every tool a modern non-engineer builder needs — Cursor, Claude Code, GitHub, Vercel, Supabase, Resend — with free tier notes for each.",
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
    description: "5 core patterns that separate good AI output from great. Role Assignment, Plan Before Build, Step-by-Step, The Improve Pattern, and Anti-Obvious Brainstorm.",
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
    description: "The 5-step loop for when the AI breaks your code. How to read error messages, isolate the problem, and get back on track fast.",
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
            Go from idea to shipped product
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Free resources for PMs, BAs, and BI Engineers who want to build real software
            with AI tools — no engineering background required. Prompts, guides, and
            templates that work in the real world.
          </p>
        </div>

        {/* Start here card */}
        <div className="mb-10 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <p className="mb-3 text-sm font-semibold text-primary">New here? Start in this order:</p>
          <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
            {[
              { num: "1", label: "Prompt Library", sub: "try the first 10 free", href: "/library/prompts" },
              { num: "2", label: "AI Workflow OS", sub: "understand the system", href: "/library/ai-workflow-os" },
              { num: "3", label: "Dev Environment", sub: "get ready to build", href: "/library/dev-environment" },
            ].map((step, i) => (
              <div key={step.num} className="flex items-center gap-0">
                <Link
                  href={step.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {step.num}
                  </span>
                  <span>
                    <span className="font-medium">{step.label}</span>
                    <span className="ml-1 text-muted-foreground">— {step.sub}</span>
                  </span>
                </Link>
                {i < 2 && (
                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                )}
              </div>
            ))}
          </ol>
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
                    <Icon className="h-5 w-5 text-primary" />
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
                <div className="mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {r.category}
                  </span>
                </div>
                <h2 className="mb-1.5 font-semibold leading-snug">{r.title}</h2>
                <p className="mb-4 flex-1 text-sm text-muted-foreground">{r.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{r.meta}</span>
                  {r.live && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
