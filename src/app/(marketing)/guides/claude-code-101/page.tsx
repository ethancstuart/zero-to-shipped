import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailGate } from "@/components/guides/email-gate";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Claude Code for Non-Engineers — A Beginner's Guide",
  description:
    "Learn how to use Claude Code to build real software without writing code yourself. A practical guide for PMs, BAs, and non-engineers who want to ship products with AI.",
  openGraph: {
    title: "Claude Code for Non-Engineers — A Beginner's Guide",
    description:
      "Build real software without writing code yourself. A practical guide for PMs, BAs, and non-engineers.",
    url: `${siteConfig.url}/guides/claude-code-101`,
    images: [
      {
        url: `/api/og?template=guide&title=${encodeURIComponent("Claude Code for Non-Engineers")}&subtitle=${encodeURIComponent("A Beginner's Guide — Zero to Ship")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function ClaudeCode101Page() {
  return (
    <div className="py-20">
      <article className="prose prose-lg mx-auto max-w-3xl px-4 dark:prose-invert">
        <h1>Claude Code for Non-Engineers — A Beginner&apos;s Guide</h1>
        <p className="lead">
          Claude Code is the tool that makes Zero to Ship possible. It&apos;s an AI
          coding assistant that lives in your terminal and can build entire features
          from a plain-English description. Here&apos;s how to go from &ldquo;I have
          an idea&rdquo; to &ldquo;here&apos;s the live URL&rdquo; — even if you&apos;ve
          never opened a terminal before.
        </p>

        {/* Part 1: Visible */}
        <h2>What is Claude Code?</h2>
        <p>
          Claude Code is Anthropic&apos;s AI coding tool. You type what you want in
          plain English, and it writes the code, edits your files, runs commands, and
          helps you ship a working product. It&apos;s not a chatbot that gives you code
          to copy-paste — it actually makes the changes directly in your project.
        </p>
        <p>
          Think of it as having a senior software engineer sitting next to you who
          never gets tired, never judges your questions, and works at the speed of
          thought.
        </p>
        <p>
          <strong>Why should you care?</strong> If you&apos;re a PM, BA, Project
          Manager, or BI Engineer, Claude Code is the difference between &ldquo;I need
          engineering to build this&rdquo; and &ldquo;I built it this afternoon.&rdquo;
          Internal tools, dashboards, prototypes, automations — all things you can
          now ship yourself.
        </p>

        <h2>Getting Started (5 Minutes)</h2>

        <h3>Step 1: Install Claude Code</h3>
        <p>Open your terminal and paste this:</p>
        <pre><code>curl -fsSL https://claude.ai/install.sh | bash</code></pre>
        <p>
          On Windows, use PowerShell:
        </p>
        <pre><code>irm https://claude.ai/install.ps1 | iex</code></pre>
        <p>
          That&apos;s it. It installs in about 30 seconds and auto-updates in the
          background.
        </p>

        <h3>Step 2: Navigate to Your Project</h3>
        <pre><code>{`cd ~/Projects/my-first-app
claude`}</code></pre>
        <p>
          The first time you run <code>claude</code>, it asks you to log in. After
          that, you&apos;re in an interactive session where you can type anything.
        </p>

        <h3>Step 3: Start Building</h3>
        <p>
          Once Claude Code is running, just describe what you want. Here are real
          examples:
        </p>
        <pre><code>{`> Create a Next.js app with a landing page that has a hero section,
  pricing cards, and a contact form

> Add a dashboard page that shows a bar chart of monthly revenue

> Fix the mobile layout — the nav menu overlaps the content on small screens

> Set up Supabase authentication with Google OAuth`}</code></pre>
        <p>
          Claude Code reads your project, understands the context, makes the changes,
          and tells you what it did. You review the changes and keep going.
        </p>

        <h2>5 Things You Can Build Today</h2>
        <p>
          These aren&apos;t hypothetical. These are projects that non-engineers have
          built with Claude Code in a single afternoon:
        </p>
        <ol>
          <li>
            <strong>An internal status dashboard</strong> — Pull data from an API,
            display it in charts, auto-refresh every 5 minutes. Total time: ~2 hours.
          </li>
          <li>
            <strong>A customer feedback tool</strong> — Form submission, Supabase
            database, email notifications. Total time: ~3 hours.
          </li>
          <li>
            <strong>A landing page for your side project</strong> — Hero, features,
            pricing, deployed to Vercel. Total time: ~1 hour.
          </li>
          <li>
            <strong>An automated report generator</strong> — Connect to a data source,
            format the output, schedule it with a cron job. Total time: ~2 hours.
          </li>
          <li>
            <strong>A prototype to pitch to your eng team</strong> — Working app that
            demonstrates the feature you&apos;ve been requesting for 3 sprints. Total
            time: ~4 hours.
          </li>
        </ol>

        {/* Email gate */}
        <EmailGate>
          {/* Part 2: Gated */}
          <h2>The CLAUDE.md File — Your Secret Weapon</h2>
          <p>
            This is the single most important concept in Claude Code. A{" "}
            <code>CLAUDE.md</code> file lives in your project root and tells Claude
            everything it needs to know about your project: the tech stack, file
            structure, coding conventions, and key commands.
          </p>
          <p>
            Think of it as a briefing document. Without it, Claude Code works fine.
            With it, Claude Code works <em>like it built your project from scratch</em>.
          </p>
          <pre><code>{`# My Dashboard App

## Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (database + auth)

## Key Commands
- npm run dev — start dev server
- npm run build — production build

## Conventions
- Server components by default
- Use @/ path alias for imports
- Mobile-first responsive design

## File Structure
src/
  app/          # Pages and API routes
  components/   # React components
  lib/          # Utilities and helpers`}</code></pre>
          <p>
            With this file in place, every prompt you give Claude Code produces code
            that matches your project perfectly. No more &ldquo;that&apos;s not how we
            do it here.&rdquo;
          </p>

          <h2>6 Power Moves for Non-Engineers</h2>

          <h3>1. &ldquo;Give me an overview of this codebase&rdquo;</h3>
          <p>
            When you inherit a project or open someone else&apos;s code, start here.
            Claude Code reads every file and gives you a plain-English explanation of
            how the app works, what the key files are, and how data flows through the
            system. You&apos;ll understand more in 2 minutes than you would in 2 hours
            of reading code.
          </p>

          <h3>2. &ldquo;Explain this file like I&apos;m a PM&rdquo;</h3>
          <p>
            Point Claude Code at any file and ask for a role-specific explanation. It
            skips the computer science and tells you what the code <em>does for
            users</em>.
          </p>

          <h3>3. Use slash commands for repeated tasks</h3>
          <p>
            If you find yourself asking Claude Code the same thing repeatedly, create
            a slash command. It&apos;s just a markdown file in your project:
          </p>
          <pre><code>{`# .claude/commands/add-feature.md
---
description: Add a new feature to the app
argument-hint: [feature description]
---

Build the following feature: $ARGUMENTS

Follow the existing patterns in the codebase.
Use server components by default.
Add to the sidebar navigation if it's a new page.`}</code></pre>
          <p>
            Now you type <code>/add-feature user settings page</code> and Claude Code
            knows exactly what to do.
          </p>

          <h3>4. &ldquo;Commit and push this&rdquo;</h3>
          <p>
            Claude Code handles Git for you. It writes clear commit messages, stages
            the right files, and pushes to GitHub. No memorizing Git commands.
          </p>

          <h3>5. &ldquo;Make this work on mobile&rdquo;</h3>
          <p>
            Point Claude Code at any page and ask it to fix the mobile layout. It reads
            the CSS, identifies the breakpoint issues, and fixes them. This alone saves
            hours on every project.
          </p>

          <h3>6. &ldquo;What would you change about this?&rdquo;</h3>
          <p>
            Ask Claude Code to review your project. It&apos;ll flag performance issues,
            security vulnerabilities, accessibility problems, and opportunities to
            simplify the code. It&apos;s like a free code review from a senior engineer.
          </p>

          <h2>Common Mistakes (and How to Avoid Them)</h2>

          <h3>Prompting too broadly</h3>
          <p>
            <strong>Bad:</strong> &ldquo;Build me a dashboard.&rdquo;<br />
            <strong>Good:</strong> &ldquo;Create a dashboard page at /dashboard that
            shows three stat cards (total users, revenue this month, active projects)
            and a line chart of signups over the past 30 days. Use the existing Card
            component from @/components/ui/card.&rdquo;
          </p>
          <p>
            Specific prompts produce specific results. Vague prompts produce vague
            results that need 5 rounds of revisions.
          </p>

          <h3>Not testing between changes</h3>
          <p>
            After every change Claude Code makes, open your browser and check the
            result. If you stack 10 changes without testing, you won&apos;t know
            which one broke things.
          </p>

          <h3>Skipping the CLAUDE.md</h3>
          <p>
            Spend 10 minutes writing a CLAUDE.md before you start building. It saves
            hours of correcting Claude Code&apos;s assumptions about your tech stack and
            conventions.
          </p>

          <h3>Not committing frequently</h3>
          <p>
            Commit after every working feature. If something breaks later, you can
            always go back. Tell Claude Code: &ldquo;commit this with a clear
            message&rdquo; — it handles the rest.
          </p>

          <h2>What&apos;s Next: From Tool User to Builder</h2>
          <p>
            Claude Code is the starting point. Once you&apos;re comfortable with it,
            the next steps are:
          </p>
          <ul>
            <li>
              <strong>MCP servers</strong> — Connect Claude Code to external tools
              (databases, APIs, Slack) so it can read and write to your real systems.
            </li>
            <li>
              <strong>Building agents</strong> — Create automated workflows where
              Claude Code handles recurring tasks without you prompting it each time.
            </li>
            <li>
              <strong>Context engineering</strong> — The art of structuring your
              project so AI tools understand it deeply. This is the skill that
              separates people who use AI from people who build with AI.
            </li>
          </ul>
          <p>
            These are topics we&apos;re building into Zero to Ship&apos;s upcoming
            modules. If you want to go deeper, the course takes you from
            &ldquo;first terminal command&rdquo; to &ldquo;shipped capstone
            project.&rdquo;
          </p>
        </EmailGate>

        {/* CTA */}
        <div className="not-prose mt-12 rounded-xl border border-border bg-card p-8 text-center">
          <h3 className="mb-2 text-xl font-bold">Ready to build something real?</h3>
          <p className="mb-6 text-muted-foreground">
            Zero to Ship takes you from Claude Code basics to shipping a live product.
            16 modules, hands-on projects, and a certificate.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button render={<Link href="/pricing" />} size="lg">
              See Pricing
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button render={<Link href="/guides/git-101" />} variant="outline" size="lg">
              Read Git 101 Guide
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
