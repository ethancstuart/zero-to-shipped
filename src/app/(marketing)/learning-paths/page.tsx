import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Learning Paths by Role — Zero to Ship",
  description:
    "Personalized learning paths for Product Managers, Business Analysts, Project Managers, and BI Engineers. Free resources + the exact modules that matter most for your role.",
  openGraph: {
    title: "Learning Paths — Zero to Ship",
    description:
      "Start with free guides. Know exactly when the paid course adds value. Four paths: PM, BA, Project Manager, BI Engineer.",
    url: `${siteConfig.url}/learning-paths`,
  },
};

const paths = [
  {
    role: "Product Manager",
    slug: "product-managers",
    emoji: "📋",
    tagline: "Ship prototypes. Write better specs. Stop waiting on engineering.",
    painPoint:
      "Every experiment you want to run is blocked on someone else's sprint. You have ideas. You have context. You just can't build — yet.",
    freeResources: [
      {
        label: "Claude Code 101",
        href: "/guides/claude-code-101",
        note: "Start here. 45 min. You'll understand what AI coding tools actually do.",
      },
      {
        label: "Prompt Patterns Cheat Sheet",
        href: "/library/prompt-patterns",
        note: "5 patterns that make Claude output dramatically better. Read before you open Cursor.",
      },
      {
        label: "Prompt Library",
        href: "/library/prompts",
        note: "Filter by 'PM'. Copy the PRD prompt, the brainstorming prompt, the stakeholder update prompt.",
      },
      {
        label: "SQL for Product Managers",
        href: "/guides/sql-for-product-managers",
        note: "The 4 queries you actually need. Feature adoption, funnel drop-off, retention, revenue.",
      },
    ],
    coreModules: [
      { number: 1, title: "Setup & First Build", why: "Ship something in 40 minutes. Before you touch any other resource." },
      { number: 2, title: "Prompt Engineering", why: "Your writing skills transfer directly. This module makes your prompts 10x more precise." },
      { number: 7, title: "Brainstorming & Ideation", why: "Use AI to stress-test product hypotheses and generate options you wouldn't reach solo." },
      { number: 9, title: "Interactive Tools", why: "Build the prototype that replaces the 3-slide Figma deck in stakeholder meetings." },
      { number: 16, title: "Capstone", why: "Ship the product feature your backlog has ignored for 6 months. With a real URL." },
    ],
    freeGate:
      "Modules 1–5 are free. That covers setup, prompt engineering, code literacy, terminal basics, and Git. A PM can get through Modules 1–2 in a weekend and have a working prototype.",
    paidValue:
      "The paid course (Modules 6–16) is where you build the tools that actually matter at work: interactive prototypes, data dashboards, automations, and a capstone project you can put in a promo packet.",
  },
  {
    role: "Business Analyst",
    slug: "business-analysts",
    emoji: "🔍",
    tagline: "Turn requirements into working prototypes. Own your data tools.",
    painPoint:
      "You write the requirements. Someone else builds the thing. By the time it ships, the context is lost and the spec didn't survive contact with reality.",
    freeResources: [
      {
        label: "SQL for Product Managers and BAs",
        href: "/guides/sql-for-product-managers",
        note: "Start here. The 4 queries that cover 90% of BA work — adoption, funnel, retention, revenue.",
      },
      {
        label: "Claude Code 101",
        href: "/guides/claude-code-101",
        note: "Understand the full picture before you decide what to build.",
      },
      {
        label: "CLAUDE.md Templates",
        href: "/library/claude-md-templates",
        note: "The Data Dashboard template is built for BAs — start there.",
      },
      {
        label: "Prompt Library",
        href: "/library/prompts",
        note: "Filter by 'BA'. Copy the data model prompt, the requirements analysis prompt.",
      },
    ],
    coreModules: [
      { number: 1, title: "Setup & First Build", why: "Build something from a plain-English spec. This is what your requirements have always been trying to do." },
      { number: 3, title: "How Code Actually Works", why: "Once you understand what's behind the UI, your requirements become more precise and testable." },
      { number: 8, title: "Planning & Research", why: "AI-assisted scoping and stress-testing of requirements. Catches ambiguities before they reach engineering." },
      { number: 12, title: "Data Products", why: "Build your own analysis tools. SQL, charts, filters, and a live URL — no more waiting on the data team." },
      { number: 16, title: "Capstone", why: "Ship a working data product or process automation that solves a real business problem you've been documenting for months." },
    ],
    freeGate:
      "Modules 1–5 are free. BAs typically move fast through these — you already think in requirements, which is most of what good prompting is.",
    paidValue:
      "The paid course is where you build the actual tools: data dashboards, interactive prototypes, automations, and a capstone that proves business impact — not just documentation skills.",
  },
  {
    role: "Project Manager",
    slug: "project-managers",
    emoji: "📊",
    tagline: "Automate the reports. Build the dashboard. Stop living in spreadsheets.",
    painPoint:
      "You spend hours every Monday compiling status. You have a RAID log, a risk tracker, a dependency map, and none of them talk to each other. All of this could be automated.",
    freeResources: [
      {
        label: "Claude Code 101",
        href: "/guides/claude-code-101",
        note: "Understand what AI coding tools can do for project management before you commit to learning.",
      },
      {
        label: "Git for PMs",
        href: "/guides/git-101",
        note: "Git is how you track changes to everything — code, but also config files, data, and scripts.",
      },
      {
        label: "Builder's Tool Stack",
        href: "/library/builder-tools",
        note: "Know which tools you'll use and what each one costs (most are free to start).",
      },
      {
        label: "Prompt Library",
        href: "/library/prompts",
        note: "Filter by 'Project Manager'. The status report automation prompt alone is worth the 10 minutes.",
      },
    ],
    coreModules: [
      { number: 1, title: "Setup & First Build", why: "Build your first tool in 40 minutes. This replaces 'I don't know where to start.'" },
      { number: 4, title: "Terminal & CLI", why: "Run your automation scripts. Check status without opening a browser." },
      { number: 5, title: "Version Control", why: "Track changes to your tools and scripts. Roll back when something breaks." },
      { number: 13, title: "Automations & Workflows", why: "This is the module for you. Build the script that runs Monday morning reporting, automatically." },
      { number: 9, title: "Interactive Tools", why: "Build a project dashboard your stakeholders actually check instead of asking you for updates." },
    ],
    freeGate:
      "Modules 1–5 are free. Module 1 is the biggest unlock — once you've shipped something in 40 minutes, 'I can't build that' stops being a constraint.",
    paidValue:
      "Modules 6–16 include the automation module (Module 13) and the full interactive tools module (Module 9). These are the ones that replace your Monday morning spreadsheet routine.",
  },
  {
    role: "BI Engineer",
    slug: "bi-engineers",
    emoji: "📈",
    tagline: "Ship data apps, not just dashboards. Own the full product stack.",
    painPoint:
      "You build beautiful dashboards. They live behind SSO, get screenshotted, and lose all interactivity. Stakeholders ask for one more filter. Forever.",
    freeResources: [
      {
        label: "SQL for Product Managers and BAs",
        href: "/guides/sql-for-product-managers",
        note: "You already know SQL. This shows you how to wrap it in an app.",
      },
      {
        label: "Claude Code 101",
        href: "/guides/claude-code-101",
        note: "The full picture: what Claude Code does, how it handles multi-file projects, when to use it.",
      },
      {
        label: "CLAUDE.md Templates",
        href: "/library/claude-md-templates",
        note: "The Data Dashboard template is your starting point — it's built for BI workflows.",
      },
      {
        label: "Agent Templates",
        href: "/agents",
        note: "4 production-ready templates. The data pipeline agent is directly applicable.",
      },
    ],
    coreModules: [
      { number: 1, title: "Setup & First Build", why: "Even experienced SQL writers need to ship a web app first. Module 1 closes that gap in 40 minutes." },
      { number: 9, title: "Interactive Tools", why: "This is where SQL meets web UI — charts, filters, drill-downs, all in a deployable app." },
      { number: 12, title: "Data Products", why: "The full data product stack. Schema design, query patterns, visualization, and production deployment." },
      { number: 13, title: "Automations & Workflows", why: "Replace your recurring reports with a script that runs itself. Log what it did." },
      { number: 16, title: "Capstone", why: "A full data app — real URL, stakeholder-ready — that proves you can own the whole stack, not just the query layer." },
    ],
    freeGate:
      "Modules 1–5 are free. BI Engineers can move through 1–3 quickly — the concepts will feel familiar. The real value starts at Module 9.",
    paidValue:
      "Modules 9, 12, and 13 are the core BI Engineer path. They take you from 'I can write queries' to 'I can ship a self-serve data product at a real URL that stakeholders use daily.'",
  },
];

export default function LearningPathsPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-4xl px-4">
        {/* Hero */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
            Learning Paths
          </p>
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Start free. Know exactly when to go paid.
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground">
            Four paths — one per role. Each shows you where to start for free,
            which modules matter most for your work, and what the paid course
            adds that the free content can&apos;t.
          </p>
        </div>

        {/* Role navigation */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {paths.map((p) => (
            <a
              key={p.slug}
              href={`#${p.slug}`}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {p.emoji} {p.role}
            </a>
          ))}
        </div>

        {/* Paths */}
        <div className="flex flex-col gap-16">
          {paths.map((p) => (
            <div key={p.slug} id={p.slug} className="scroll-mt-8">
              {/* Role header */}
              <div className="mb-6 flex items-center gap-3">
                <span className="text-3xl">{p.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold">{p.role}</h2>
                  <p className="text-sm text-muted-foreground">{p.tagline}</p>
                </div>
              </div>

              {/* Pain point */}
              <div className="mb-6 rounded-xl border-l-4 border-primary/40 bg-primary/5 py-3 pl-5 pr-4">
                <p className="text-sm text-muted-foreground italic">{p.painPoint}</p>
              </div>

              {/* Free resources */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Start here — free
                </h3>
                <div className="flex flex-col gap-2">
                  {p.freeResources.map((r) => (
                    <Link
                      key={r.href}
                      href={r.href}
                      className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-primary/5"
                    >
                      <span className="mt-0.5 text-primary">→</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm group-hover:text-primary">
                          {r.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.note}
                        </p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Free tier gate */}
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                  Free tier
                </p>
                <p className="text-sm text-green-800 dark:text-green-300">
                  {p.freeGate}
                </p>
              </div>

              {/* Core modules */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Your core modules (paid course)
                </h3>
                <div className="flex flex-col gap-2">
                  {p.coreModules.map((m) => (
                    <div
                      key={m.number}
                      className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
                    >
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {m.number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm">{m.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {m.why}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paid value prop */}
              <div className="mb-6 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
                <p className="text-xs font-semibold text-primary mb-1">
                  What the paid course adds
                </p>
                <p className="text-sm text-muted-foreground">{p.paidValue}</p>
              </div>

              {/* Role CTA */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/preview/module-1"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Try Module 1 free →
                </Link>
                <Link
                  href={`/for/${p.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  {p.role} page
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="mb-2 text-xl font-bold">Not sure which path? Start with Module 1.</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Module 1 is the same for every role. It takes 40 minutes and you&apos;ll ship
            something real. After that, you&apos;ll know whether this approach works for you —
            before you pay for anything.
          </p>
          <Link
            href="/preview/module-1"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try Module 1 free — no sign-up
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
