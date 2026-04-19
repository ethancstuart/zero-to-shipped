import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "AI Workflow OS — Builder's Library — Zero to Ship",
  description:
    "How to structure your AI development world — CLAUDE.md, MCP servers, Cursor vs Claude Code, the build loop, and the top anti-patterns that break non-engineers.",
  openGraph: {
    title: "AI Workflow OS — Zero to Ship",
    description:
      "How to structure your AI development world. CLAUDE.md, MCP servers, the build loop — all in one guide.",
    url: `${siteConfig.url}/library/ai-workflow-os`,
    images: [
      {
        url: `/api/og?template=guide&title=${encodeURIComponent("AI Workflow OS")}&subtitle=${encodeURIComponent("CLAUDE.md · MCP Servers · The Build Loop — Zero to Ship")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function AIWorkflowOSPage() {
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

        <article className="prose prose-lg dark:prose-invert">
          <div className="not-prose mb-2 flex items-center gap-2">
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Workflow
            </span>
            <span className="text-xs text-muted-foreground">30 min</span>
          </div>

          <h1>AI Workflow OS</h1>

          <p className="lead">
            Most people use AI coding tools like a slightly smarter Google. They ask a question,
            get an answer, move on. That&apos;s the wrong model — and it&apos;s why most people feel
            like AI &quot;doesn&apos;t really help.&quot; This guide shows you how to structure your
            entire development world so AI actually works for you.
          </p>

          <h2>1. The philosophy</h2>
          <p>
            You&apos;re not using a chatbot. You&apos;re operating an agent.
          </p>
          <p>
            A chatbot answers questions. An agent does work — it reads files, runs commands,
            makes decisions, and iterates until the task is done. Claude Code and Cursor are agents.
            The mental model shift is this: <strong>your job is to give the agent context
            and direction, not to answer every question step-by-step.</strong>
          </p>
          <p>
            The more context an agent has — about your project, your preferences, your constraints —
            the better it performs. That&apos;s what the rest of this guide is about.
          </p>

          <h2>2. CLAUDE.md: your project&apos;s brain</h2>
          <p>
            <code>CLAUDE.md</code> is a Markdown file you put at the root of every project.
            Claude Code reads it at the start of every session. It&apos;s how you teach the
            AI about your project so you don&apos;t have to re-explain it every time.
          </p>

          <h3>What to put in it</h3>
          <ul>
            <li><strong>Project overview</strong> — what this project does, who it&apos;s for</li>
            <li><strong>Tech stack</strong> — framework, database, hosting, key libraries</li>
            <li><strong>Key commands</strong> — how to start the dev server, run tests, deploy</li>
            <li><strong>File structure</strong> — where things live and why</li>
            <li><strong>Conventions</strong> — naming rules, patterns to follow, things to avoid</li>
            <li><strong>Constraints</strong> — &quot;never modify the auth middleware directly&quot; level rules</li>
          </ul>

          <h3>Real example</h3>
          <pre><code className="language-markdown"># My Dashboard App

## Overview
Internal analytics dashboard for the product team.
Shows weekly metrics from our Postgres database.

## Tech Stack
- Next.js 15 (App Router)
- Supabase (Postgres + Auth)
- Tailwind CSS
- Vercel (hosting)

## Key Commands
- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build
- `vercel` — deploy

## File Structure
src/app/          # Pages (App Router)
src/components/   # Reusable UI components
src/lib/          # Database queries, utilities

## Conventions
- Server components by default — use "use client" only when needed
- All DB queries go through src/lib/db.ts
- Never inline SQL — always use the query functions in db.ts</code></pre>

          <h3>Guidelines</h3>
          <ul>
            <li>Keep it under 500 lines — Claude reads the whole thing every session</li>
            <li>Put the most important rules at the top</li>
            <li>Start a new project with <code>claude /init</code> — it generates a starter for you</li>
            <li>Update it whenever you make a significant architectural decision</li>
          </ul>
          <p>
            Ready to start? Grab a{" "}
            <Link href="/library/claude-md-templates">CLAUDE.md template</Link> from the library.
          </p>

          <h2>3. MCP servers: connecting your AI to the world</h2>
          <p>
            MCP (Model Context Protocol) servers extend what Claude Code can do. Without them,
            Claude works with files and your terminal. With them, it can interact with GitHub,
            browse the web, query your database, and more.
          </p>
          <p>
            These are the four you should install on day one:
          </p>

          <h3>1. Filesystem (built-in)</h3>
          <p>
            This comes with Claude Code — no setup needed. It lets Claude read and write files
            anywhere on your system. Already active.
          </p>

          <h3>2. GitHub</h3>
          <p>
            Lets Claude create branches, open PRs, read issues, and manage your repos.
          </p>
          <pre><code className="language-bash">claude mcp add github -- npx -y @modelcontextprotocol/server-github</code></pre>
          <p>
            You&apos;ll need a GitHub personal access token (Settings → Developer Settings →
            Personal access tokens). Set it as <code>GITHUB_PERSONAL_ACCESS_TOKEN</code> in
            your environment.
          </p>

          <h3>3. Browser (Puppeteer)</h3>
          <p>
            Lets Claude open web pages, fill forms, take screenshots, and test your UI.
            Essential for verifying that your app actually works.
          </p>
          <pre><code className="language-bash">claude mcp add puppeteer -- npx -y @modelcontextprotocol/server-puppeteer</code></pre>

          <h3>4. Supabase</h3>
          <p>
            Lets Claude query your database, run migrations, and inspect your schema.
            If you&apos;re building with Supabase, this one&apos;s a game-changer.
          </p>
          <pre><code className="language-bash">claude mcp add supabase -- npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_TOKEN</code></pre>
          <p>
            Get your access token at <strong>app.supabase.com</strong> →
            Account → Access Tokens.
          </p>

          <h2>4. Cursor vs. Claude Code</h2>
          <p>
            Both tools use Claude. The difference is <em>where</em> they work and what
            they&apos;re optimized for.
          </p>

          <table>
            <thead>
              <tr>
                <th></th>
                <th>Cursor</th>
                <th>Claude Code</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Where it lives</strong></td>
                <td>Inside the code editor</td>
                <td>In the terminal</td>
              </tr>
              <tr>
                <td><strong>Best for</strong></td>
                <td>In-file edits, quick changes, reading code</td>
                <td>Multi-file agents, running commands, complex tasks</td>
              </tr>
              <tr>
                <td><strong>Use it when</strong></td>
                <td>You&apos;re in a file and want to change it</td>
                <td>You&apos;re giving a multi-step task that spans files</td>
              </tr>
            </tbody>
          </table>

          <p>
            <strong>Rule of thumb:</strong> Start in Cursor for quick edits. Switch to Claude Code
            when you&apos;re saying things like &quot;add this feature across the whole codebase&quot;
            or &quot;run the tests and fix what fails.&quot;
          </p>

          <h2>5. The build loop</h2>
          <p>
            Every AI-assisted build session follows the same loop. Understanding each step
            makes you dramatically faster.
          </p>

          <ol>
            <li>
              <strong>Prompt</strong> — describe what you want. Be specific about the outcome,
              not the implementation. &quot;Add a settings page where users can update their
              display name&quot; is better than instructions about which files to create.
            </li>
            <li>
              <strong>Review</strong> — read the output before running it. Look for:
              changes that go beyond what you asked for, new files you didn&apos;t expect,
              or anything that looks off.
            </li>
            <li>
              <strong>Run</strong> — execute it. <code>npm run dev</code>, open the browser,
              click through the feature.
            </li>
            <li>
              <strong>Evaluate</strong> — does it work? Ask: does it solve the real problem?
              Are the numbers correct? Would you put your name on it?
            </li>
            <li>
              <strong>Iterate</strong> — if something&apos;s off, describe specifically what
              needs to change. &quot;The form works but the error message doesn&apos;t show&quot;
              is better than &quot;it&apos;s broken.&quot;
            </li>
          </ol>

          <p>
            Two or three iterations is normal. You&apos;re pair-programming, not ordering from
            a menu. Let it fail and fix — Claude Code can read error output and self-correct.
          </p>

          <h2>6. Anti-patterns that break non-engineers</h2>
          <p>These are the mistakes that slow everyone down. Avoid them.</p>

          <h3>1. Asking for too much at once</h3>
          <p>
            &ldquo;Build me a CRM system with email integration, Stripe billing, and an analytics
            dashboard.&rdquo; The output will be overwhelming and wrong in multiple ways at once.
            Start with one feature, ship it, then add the next.
          </p>

          <h3>2. Not reviewing before running</h3>
          <p>
            Clicking &quot;approve all&quot; on every change without reading the diff. Five minutes
            of review saves an hour of debugging.
          </p>

          <h3>3. Adding frameworks and dependencies without asking</h3>
          <p>
            If you didn&apos;t ask for a new library, you probably don&apos;t need it. AI agents
            sometimes add complexity out of habit. Add constraints to your prompt:
            &quot;do not add any new npm packages.&quot;
          </p>

          <h3>4. Not using CLAUDE.md</h3>
          <p>
            Starting every session from scratch means re-explaining your project every time.
            A CLAUDE.md cuts setup time to zero.
          </p>

          <h3>5. Ignoring the error output</h3>
          <p>
            &quot;It&apos;s broken.&quot; is not useful. &quot;Here is the error message.&quot; is.
            Paste the full error output and let Claude diagnose it.
          </p>

          <h3>6. Clearing the session too early</h3>
          <p>
            Claude Code has context about what it already tried. Clearing the session
            (/clear) when things aren&apos;t working often makes things worse. Use /compact
            to summarize and continue instead.
          </p>

          <h3>7. Building without version control</h3>
          <p>
            Run <code>git init</code> before you start. Commit after every meaningful change.
            If something breaks, you can always go back.
          </p>

          <h3>8. Asking for features instead of outcomes</h3>
          <p>
            &ldquo;Add a button that calls the API.&rdquo; is a feature.
            &ldquo;Let users save their progress.&rdquo; is an outcome. Outcome prompts
            produce better results because the AI can figure out the right implementation.
          </p>

          <h2>7. Cursor shortcuts</h2>
          <p>The 12 shortcuts you&apos;ll use every session:</p>

          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Mac</th>
                <th>Windows</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Open Agent (Composer)</td><td><kbd>Cmd+I</kbd></td><td><kbd>Ctrl+I</kbd></td></tr>
              <tr><td>Inline Edit</td><td><kbd>Cmd+K</kbd></td><td><kbd>Ctrl+K</kbd></td></tr>
              <tr><td>Accept AI suggestion</td><td><kbd>Tab</kbd></td><td><kbd>Tab</kbd></td></tr>
              <tr><td>Reject AI suggestion</td><td><kbd>Escape</kbd></td><td><kbd>Escape</kbd></td></tr>
              <tr><td>Toggle AI chat panel</td><td><kbd>Cmd+L</kbd></td><td><kbd>Ctrl+L</kbd></td></tr>
              <tr><td>Quick file open</td><td><kbd>Cmd+P</kbd></td><td><kbd>Ctrl+P</kbd></td></tr>
              <tr><td>Search across files</td><td><kbd>Cmd+Shift+F</kbd></td><td><kbd>Ctrl+Shift+F</kbd></td></tr>
              <tr><td>Toggle terminal</td><td><kbd>Ctrl+`</kbd></td><td><kbd>Ctrl+`</kbd></td></tr>
              <tr><td>Undo</td><td><kbd>Cmd+Z</kbd></td><td><kbd>Ctrl+Z</kbd></td></tr>
              <tr><td>Duplicate line</td><td><kbd>Cmd+Shift+D</kbd></td><td><kbd>Ctrl+Shift+D</kbd></td></tr>
              <tr><td>Comment / uncomment</td><td><kbd>Cmd+/</kbd></td><td><kbd>Ctrl+/</kbd></td></tr>
              <tr><td>Select all occurrences</td><td><kbd>Cmd+Shift+L</kbd></td><td><kbd>Ctrl+Shift+L</kbd></td></tr>
            </tbody>
          </table>

          <h2>8. Power moves</h2>
          <p>Once you have the basics down, these unlock the next level.</p>

          <h3>/compact</h3>
          <p>
            When a Claude Code session gets long, context fills up and responses slow down.
            <code>/compact</code> summarizes the conversation and keeps working — you don&apos;t
            lose context, you compress it.
          </p>

          <h3>/clear</h3>
          <p>
            Resets the session completely. Use when you&apos;re starting a genuinely new task
            that has nothing to do with what you were just doing.
          </p>

          <h3>Memory files</h3>
          <p>
            Create a <code>~/.claude/CLAUDE.md</code> (global) to give Claude context
            that applies across all your projects — your name, your preferred stack,
            your working style.
          </p>

          <h3>Multi-step tasks</h3>
          <p>
            Claude Code handles multi-step tasks natively. Give it the full picture:
          </p>
          <pre><code className="language-text">&quot;Add a /settings page where users can update their display name.
Wire it up to the Supabase profiles table.
Add a nav link to the sidebar.
Write a test for the update function.&quot;</code></pre>
          <p>
            It will handle all four steps in sequence, reviewing its own output as it goes.
          </p>

          <h3>@-mentioning files</h3>
          <p>
            In Cursor&apos;s Agent mode, type <code>@</code> and mention specific files to give
            the AI focused context. Instead of &quot;fix the auth&quot;, try
            &quot;look at @src/lib/auth.ts and fix the session expiry.&quot;
          </p>
        </article>

        {/* Bottom CTA */}
        <div className="mt-14 rounded-xl border border-border bg-card p-7 text-center">
          <h2 className="mb-2 text-lg font-bold">Want to build this yourself?</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Module 1 of Zero to Ship walks you through your first real build — using everything in this guide.
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
