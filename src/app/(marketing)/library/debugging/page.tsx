import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Debugging with AI — Builder's Library — Zero to Ship",
  description:
    "The 5-step loop for when the AI breaks your code. How to read error messages, isolate the problem, and get back on track — without an engineering background.",
  openGraph: {
    title: "Debugging with AI — Zero to Ship",
    description:
      "The 5-step debugging loop for non-engineers. How to read errors, isolate the problem, and get back on track fast.",
    url: `${siteConfig.url}/library/debugging`,
    images: [
      {
        url: `/api/og?template=guide&title=${encodeURIComponent("Debugging with AI")}&subtitle=${encodeURIComponent("The 5-Step Loop for Non-Engineers — Zero to Ship")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

const steps = [
  {
    number: 1,
    title: "Read the error message. Actually read it.",
    description:
      "This sounds obvious. It isn't. Most beginners see a red wall of text and immediately ask Claude to fix it without reading a word. The error message almost always tells you what's wrong — often with a file name and line number. Before you do anything else: read the last 5–10 lines of the error. Find the sentence that starts with 'Error:' or the line that says 'Cannot find module' or 'TypeError: x is not a function.'",
    prompt:
      "Explain this error message to me in plain English. What went wrong and where? Error: [paste the full error]",
    tip: "The first 'Error:' in the stack trace is usually the real one. Everything after it is where it bubbled up through.",
  },
  {
    number: 2,
    title: "Give Claude the full error — not a description of it",
    description:
      "One of the most common debugging mistakes: telling Claude 'I'm getting a TypeScript error on the login page' instead of pasting the actual error. Claude needs the exact error text, the stack trace, and ideally the file it points to. The more specific you are, the faster you get unstuck.",
    prompt:
      "Here is the full error I'm seeing: [paste error]\n\nHere is the code it's pointing to: [paste relevant code]\n\nWhat's causing this and how do I fix it?",
    tip: "Open your browser's developer console (F12 or Cmd+Option+I) and copy the full red error text. Don't screenshot it — paste it.",
  },
  {
    number: 3,
    title: "Add context: what changed right before this broke?",
    description:
      "Bugs almost always appear right after something changes — you installed a package, edited a file, renamed a variable, or followed an AI suggestion. If you can tell Claude 'this was working, then I [did X], and now I'm seeing [error]' — you've given it 80% of what it needs. The most useful question in debugging: 'What changed?'",
    prompt:
      "My app was working fine. I then [describe what you changed or did]. Now I'm seeing this error: [paste error]. What's most likely causing this given what I changed?",
    tip: "If you used version control (git), run 'git diff' to see exactly what changed. Paste that diff into Claude.",
  },
  {
    number: 4,
    title: "Ask Claude to explain before it fixes",
    description:
      "If Claude just gives you code to copy-paste and you apply it without understanding, you'll hit the same class of bug again in 3 days. Ask it to explain what went wrong and why the fix works. This takes an extra 30 seconds and saves you hours over the next month. You don't need to become an expert — but understanding the shape of the bug stops you from reintroducing it.",
    prompt:
      "Before you fix it, explain: what exactly went wrong here, and why does your fix solve it? I want to understand this so I don't hit the same issue again.",
    tip: "If the explanation confuses you, say 'explain that as if I'm not a developer.' Keep going until you get it.",
  },
  {
    number: 5,
    title: "Verify the fix didn't break something else",
    description:
      "Patches cause regressions. Always test the thing you fixed — but also test the two or three things that are related. If you fixed the login flow, check that signup still works. If you fixed a database query, check that the UI that reads that data still renders correctly. Claude can help you write a quick verification checklist.",
    prompt:
      "I applied your fix for [describe the bug]. What should I test to make sure this fix didn't break anything else? Give me a 5-point checklist.",
    tip: "If you have tests, run them now: npm test or npx vitest. A passing test suite after a fix is the fastest confidence check.",
  },
];

const antiPatterns = [
  {
    label: "Asking Claude to 'just fix it'",
    problem: "Claude may apply a fix that works for the error but breaks the underlying logic. Always ask for explanation.",
    fix: "Ask what the bug is before asking for the fix.",
  },
  {
    label: "Applying multiple fixes at once",
    problem: "If Claude suggests 3 changes and you apply all 3 at once, and something breaks, you don't know which one caused it.",
    fix: "Apply one change at a time. Test after each one.",
  },
  {
    label: "Restarting the conversation when stuck",
    problem: "Starting a new chat loses all context. Claude doesn't know what you've already tried.",
    fix: "Stay in the same conversation. If really stuck, say 'let's approach this differently' and redirect.",
  },
  {
    label: "Ignoring warnings",
    problem: "Warnings aren't errors — they won't stop your app — but they predict future errors. Especially TypeScript warnings.",
    fix: "Fix warnings early. Run 'npm run typecheck' or 'npx tsc --noEmit' and resolve what you can.",
  },
  {
    label: "Asking Claude to fix code it hasn't seen",
    problem: "'My button doesn't work' gives Claude nothing to work with. It will guess — and guess wrong.",
    fix: "Always paste the relevant code, the error, and what behavior you expected vs. what you got.",
  },
];

export default function DebuggingPage() {
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
              Workflow
            </span>
            <span className="text-xs text-muted-foreground">15 min</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Debugging with AI
          </h1>
          <p className="text-lg text-muted-foreground">
            Something broke. The AI gave you code that doesn&apos;t work. You&apos;re staring at
            a red error message that means nothing to you. Here&apos;s exactly what to do —
            step by step, no engineering background required.
          </p>
        </div>

        {/* The 5-step loop */}
        <h2 className="mb-5 text-xl font-bold">The 5-Step Debugging Loop</h2>
        <div className="flex flex-col gap-5 mb-12">
          {steps.map((step) => (
            <div key={step.number} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {step.number}
                </span>
                <h3 className="font-semibold leading-snug">{step.title}</h3>
              </div>

              <div className="p-5">
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                <div className="mb-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Prompt to use
                  </p>
                  <div className="rounded-lg bg-muted px-4 py-3 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                    {step.prompt}
                  </div>
                </div>

                <div className="rounded-lg border-l-2 border-primary/40 bg-primary/5 pl-4 py-2 pr-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Tip: </span>
                    {step.tip}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* When the loop doesn't work */}
        <div className="mb-12 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-base font-bold">When the 5-step loop isn&apos;t working</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Sometimes you go through all 5 steps and you&apos;re still stuck. Here&apos;s what to do next:
          </p>
          <ol className="flex flex-col gap-3 text-sm">
            {[
              { action: "Start a fresh conversation", detail: "Sometimes Claude gets confused by a long back-and-forth. Start fresh with a clean problem statement." },
              { action: "Reproduce it from scratch", detail: "Create a minimal example of the broken thing — the fewest lines of code that show the problem. This often reveals the issue." },
              { action: "Ask Claude what it would need to solve it", detail: "\"What additional information would help you diagnose this?\" — Claude will tell you what's missing." },
              { action: "Search the error message", detail: "Paste the error into Google. Stack Overflow answers from real humans often catch edge cases Claude misses." },
              { action: "Roll back the change", detail: "If you used git, git stash or git revert your last change and try a different approach." },
            ].map(({ action, detail }, i) => (
              <li key={action} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <div>
                  <span className="font-semibold">{action}:</span>{" "}
                  <span className="text-muted-foreground">{detail}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Anti-patterns */}
        <div className="mb-12">
          <h2 className="mb-1 text-xl font-bold">5 Anti-Patterns That Keep You Stuck</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            These are the habits that make debugging take 4 hours instead of 20 minutes.
          </p>
          <div className="flex flex-col gap-3">
            {antiPatterns.map((ap) => (
              <div key={ap.label} className="rounded-xl border border-border bg-card p-5">
                <p className="mb-1 font-semibold text-sm">{ap.label}</p>
                <p className="mb-2 text-xs text-muted-foreground">{ap.problem}</p>
                <p className="text-xs">
                  <span className="font-medium text-primary">Instead: </span>
                  <span className="text-foreground">{ap.fix}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* The mindset section */}
        <div className="mb-12 rounded-xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="mb-2 text-base font-bold">The debugging mindset shift</h2>
          <p className="text-sm text-muted-foreground">
            Most non-engineers treat bugs as proof they shouldn&apos;t be building. That&apos;s backwards.
            Every engineer — senior, junior, 10 years in — hits bugs daily. The difference is speed:
            experienced builders have a loop and they run it. Now you have the loop. Run it.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-xl border border-border bg-card p-7 text-center">
          <h2 className="mb-2 text-lg font-bold">Get the full Prompt Library</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            The Debug category has 8 copy-paste prompts built on this exact loop —
            including prompts for TypeScript errors, API failures, and database issues.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/library/prompts"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Debug Prompts
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/preview/module-1"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Try Module 1 Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
