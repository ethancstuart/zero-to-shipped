import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Builder's Tool Stack — Builder's Library — Zero to Ship",
  description:
    "Every tool a modern non-engineer builder needs — Cursor, Claude Code, GitHub, Vercel, Supabase, Resend — with free tier notes and what each one actually does.",
  openGraph: {
    title: "Builder's Tool Stack — Zero to Ship",
    description:
      "The modern builder stack — Cursor, Claude Code, GitHub, Vercel, Supabase, Resend. Free tier notes and honest explanations.",
    url: `${siteConfig.url}/library/builder-tools`,
    images: [
      {
        url: `/api/og?template=guide&title=${encodeURIComponent("Builder's Tool Stack")}&subtitle=${encodeURIComponent("Cursor · Claude Code · Vercel · Supabase — Zero to Ship")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

const tools = [
  {
    name: "Cursor",
    category: "Code Editor",
    tagline: "Where you write code with AI built in",
    free: "Free tier — 2,000 AI completions/month",
    description:
      "Cursor is a code editor (built on VS Code) with Claude and GPT-4 wired directly into it. You write code, Cursor suggests what comes next, and you can highlight any block and say 'explain this' or 'refactor this' in plain English. It's the app you'll spend the most time in.",
    whyBuilders:
      "Cursor's 'Composer' mode lets you describe a feature in English and it writes the files, imports, and wiring. For non-engineers, this is where the magic happens — you direct, Cursor implements.",
    href: "https://cursor.sh",
    badge: "Primary",
  },
  {
    name: "Claude Code",
    category: "Terminal AI Agent",
    tagline: "An AI that can read and edit your whole project",
    free: "Billed per token — no free tier, but pay-as-you-go",
    description:
      "Claude Code runs in your terminal and has access to your entire codebase. Unlike Cursor (which works file-by-file), Claude Code can read multiple files, run commands, and make coordinated changes across your project. Think of it as your senior engineer who understands the whole system.",
    whyBuilders:
      "Use Claude Code for big, multi-file tasks: setting up a new feature end-to-end, migrating a database, or refactoring across components. Use Cursor for smaller, in-file edits.",
    href: "https://claude.ai/code",
    badge: "Recommended",
  },
  {
    name: "GitHub",
    category: "Version Control",
    tagline: "Where your code lives and how you save progress",
    free: "Free tier — unlimited public + private repos",
    description:
      "GitHub stores your code and tracks every change you make. It's your project's save history — if something breaks, you can go back. It also makes it possible for Vercel to auto-deploy when you push new code, which is how modern deployment works.",
    whyBuilders:
      "You don't need to understand Git deeply to start. The three commands you'll use daily: git add, git commit, git push. Everything else you can ask Claude.",
    href: "https://github.com",
    badge: "Essential",
  },
  {
    name: "Vercel",
    category: "Hosting & Deployment",
    tagline: "How your app gets on the internet",
    free: "Free tier — unlimited personal projects, 100GB bandwidth/month",
    description:
      "Vercel takes your GitHub repo and turns it into a live URL in under a minute. Every time you push code, it redeploys automatically. It also handles custom domains, environment variables (secret keys), and serverless API routes. No servers to manage.",
    whyBuilders:
      "The workflow is: write code → push to GitHub → Vercel builds and deploys → your URL updates. That loop happens in under 2 minutes. It's the fastest way to go from idea to live.",
    href: "https://vercel.com",
    badge: "Essential",
  },
  {
    name: "Supabase",
    category: "Database & Auth",
    tagline: "Your app's memory and login system",
    free: "Free tier — 500MB database, 50,000 monthly active users",
    description:
      "Supabase gives you a Postgres database, user authentication (email + Google login), and file storage — all with a dashboard that looks like a spreadsheet. You don't write SQL to get started. The JavaScript SDK handles it for you.",
    whyBuilders:
      "Most apps need two things: somewhere to store data and a way for users to log in. Supabase does both. Row-Level Security means your data is protected by default — you define who can see what.",
    href: "https://supabase.com",
    badge: "Recommended",
  },
  {
    name: "Resend",
    category: "Transactional Email",
    tagline: "How your app sends emails",
    free: "Free tier — 100 emails/day, 3,000/month",
    description:
      "Resend is an API for sending email from your app — confirmation emails, password resets, notifications, newsletters. It's developer-first (one line of JavaScript to send), with a dashboard to track opens and bounces.",
    whyBuilders:
      "If your app needs to email users at all — welcome emails, purchase confirmations, daily digests — Resend is the simplest integration. It takes about 20 minutes to set up end-to-end.",
    href: "https://resend.com",
    badge: "Recommended",
  },
  {
    name: "Warp",
    category: "Terminal",
    tagline: "A terminal that doesn't feel like 1980",
    free: "Free tier — full-featured, AI commands included",
    description:
      "Warp is a modern terminal app with AI built in. You can type natural language ('list all files modified in the last 3 days') and it translates to a shell command. It also has command history search, tab completion, and blocks instead of raw text output.",
    whyBuilders:
      "You'll run commands in the terminal daily — installing packages, running tests, deploying. Warp makes it less intimidating. The AI command lookup alone saves hours of googling obscure flags.",
    href: "https://warp.dev",
    badge: "Optional",
  },
  {
    name: "Stripe",
    category: "Payments",
    tagline: "How your app takes money",
    free: "Free to use — 2.9% + 30¢ per transaction",
    description:
      "Stripe handles everything payment-related: credit cards, subscriptions, invoices, refunds, and tax compliance. It's used by most SaaS companies. The dashboard shows all your revenue in one place.",
    whyBuilders:
      "You don't need to understand payments infrastructure to get Stripe working. Paste a few API keys, implement a checkout session (Claude will write it), and you're taking real money within a few hours.",
    href: "https://stripe.com",
    badge: "When needed",
  },
];

const badgeColors: Record<string, string> = {
  Primary: "bg-primary/10 text-primary",
  Essential: "bg-green-500/10 text-green-600 dark:text-green-400",
  Recommended: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Optional: "bg-muted text-muted-foreground",
  "When needed": "bg-muted text-muted-foreground",
};

export default function BuilderToolsPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4">
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
              Tools
            </span>
            <span className="text-xs text-muted-foreground">20 min</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Builder&apos;s Tool Stack
          </h1>
          <p className="text-lg text-muted-foreground">
            Every tool in the modern builder stack — what it does, why you need it, and what&apos;s free.
            You don&apos;t need all of these on day one. Start with the essentials and add the rest
            as your project grows.
          </p>
        </div>

        {/* Quick legend */}
        <div className="mb-8 flex flex-wrap gap-2 text-xs">
          {Object.entries(badgeColors).map(([label, cls]) => (
            <span key={label} className={`rounded-full px-2.5 py-1 font-medium ${cls}`}>
              {label}
            </span>
          ))}
        </div>

        {/* Tool cards */}
        <div className="flex flex-col gap-5">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h2 className="text-lg font-bold">{tool.name}</h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeColors[tool.badge]}`}
                    >
                      {tool.badge}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {tool.category}
                  </p>
                </div>
                <a
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                >
                  Visit
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <p className="mb-3 font-medium text-sm">&ldquo;{tool.tagline}&rdquo;</p>
              <p className="mb-3 text-sm text-muted-foreground">{tool.description}</p>

              <div className="mb-3 rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-semibold text-foreground mb-1">Why non-engineers use it:</p>
                <p className="text-xs text-muted-foreground">{tool.whyBuilders}</p>
              </div>

              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                {tool.free}
              </p>
            </div>
          ))}
        </div>

        {/* Stack recommendations */}
        <div className="mt-10 rounded-xl border border-border bg-muted/30 p-6">
          <h2 className="mb-4 text-base font-bold">Start with this, in this order</h2>
          <ol className="flex flex-col gap-3 text-sm">
            {[
              { step: "Cursor + GitHub", note: "Your editor and your save system. Get these first." },
              { step: "Vercel", note: "Connect your GitHub repo. You'll have a live URL within 10 minutes." },
              { step: "Supabase", note: "Add this when your app needs to store data or log users in." },
              { step: "Claude Code", note: "Add this when you need to make big, cross-file changes." },
              { step: "Resend", note: "Add this when your app needs to send emails." },
              { step: "Stripe", note: "Add this when you're ready to charge money." },
            ].map(({ step, note }, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div>
                  <span className="font-semibold">{step}</span>
                  <span className="text-muted-foreground"> — {note}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-xl border border-border bg-card p-7 text-center">
          <h2 className="mb-2 text-lg font-bold">Ready to put the stack to work?</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Module 1 of Zero to Ship walks you through setting up all of this and building your first real app.
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
