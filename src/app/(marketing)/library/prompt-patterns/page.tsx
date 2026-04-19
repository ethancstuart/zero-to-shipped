import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Prompt Patterns Cheat Sheet — Builder's Library — Zero to Ship",
  description:
    "5 core patterns that separate good AI output from great — Role Assignment, Plan Before Build, Step-by-Step, The Improve Pattern, and Anti-Obvious Brainstorm — plus power phrases and an evaluation framework.",
  openGraph: {
    title: "Prompt Patterns Cheat Sheet — Zero to Ship",
    description:
      "5 core prompt patterns, power phrases, and a 5-question evaluation framework for non-engineers building with AI.",
    url: `${siteConfig.url}/library/prompt-patterns`,
    images: [
      {
        url: `/api/og?template=guide&title=${encodeURIComponent("Prompt Patterns Cheat Sheet")}&subtitle=${encodeURIComponent("5 Patterns · Power Phrases · Evaluation Framework — Zero to Ship")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

const patterns = [
  {
    number: 1,
    name: "Role Assignment",
    tagline: "Tell Claude who it is before you tell it what to do",
    when: "Always. Use this at the start of any prompt that needs expertise.",
    template:
      'You are an expert [role] who specializes in [domain]. Your task is to [goal]. [Additional constraints here.]',
    example:
      'You are an expert Next.js developer who specializes in building SaaS apps for non-technical founders. Your task is to write a Supabase query that returns all users who signed up in the last 30 days and have not yet completed onboarding. Return only the SQL, no explanation.',
    why:
      "Claude plays the role you assign. 'Expert Next.js developer' gets you expert output. No role assignment gets you average output. This single change is responsible for 80% of quality improvement for most users.",
  },
  {
    number: 2,
    name: "Plan Before Build",
    tagline: "Make Claude think before it codes",
    when: "Any task that involves writing more than ~20 lines of code.",
    template:
      'Before writing any code, write out your plan: what files you will create or edit, what each function does, and any edge cases you anticipate. Then write the code.',
    example:
      "Before writing any code, write out your plan for adding email verification to our Next.js app using Supabase Auth. List: which files you'll create or modify, what each route does, and any edge cases. Then implement it.",
    why:
      "When you ask Claude to plan first, it catches design problems before they become code problems. Planning takes 10 seconds. Debugging bad architecture takes hours.",
  },
  {
    number: 3,
    name: "Step-by-Step Decomposition",
    tagline: "Break big tasks into numbered steps",
    when: "Complex multi-file changes, setup tasks, debugging sessions.",
    template:
      'Break this into numbered steps. After each step, pause and confirm before continuing.',
    example:
      "Break adding Stripe subscription payments into numbered steps. Include: schema changes needed, API routes to create, frontend components, and webhook handling. After listing all steps, implement step 1 only.",
    why:
      "Big requests produce big walls of code. Decomposed requests produce testable, debuggable chunks. You can stop after any step, verify it works, and continue — which is how real engineers work.",
  },
  {
    number: 4,
    name: "The Improve Pattern",
    tagline: "Show Claude what you have, ask what's wrong",
    when: "Reviewing code, writing, specs, or any artifact you want to make better.",
    template:
      "Here is my current [thing]. What's wrong with it and how would you improve it? Be specific about what to change and why.",
    example:
      "Here is my current PRD for the notification system. What's wrong with it and how would you improve it? Be specific — I want to know what's missing, what's vague, and what would confuse an engineer reading this.",
    why:
      "Asking 'is this good?' gets you a polite 'yes, but...'. Asking 'what's wrong?' gets you a real critique. The Improve Pattern unlocks Claude's critical thinking. Use it on everything before you ship.",
  },
  {
    number: 5,
    name: "Anti-Obvious Brainstorm",
    tagline: "Explicitly ask Claude to skip the generic ideas",
    when: "Ideation, naming, feature brainstorming, marketing copy.",
    template:
      "Give me [N] ideas for [X]. Avoid the obvious ones everyone else would suggest. I want ideas that are specific, surprising, or counterintuitive.",
    example:
      "Give me 8 name ideas for a SaaS tool that helps product managers track feature adoption. Avoid generic names like 'ProdMetrics' or 'FeatureFlow.' I want names that feel specific, memorable, and a little unexpected.",
    why:
      "Left to its own devices, Claude will give you the median response — the average of everything it's seen. Explicitly banning the obvious forces it to explore the edges, which is where the interesting ideas live.",
  },
];

const powerPhrases = [
  { phrase: "Think step by step.", effect: "Forces structured reasoning instead of guessing" },
  { phrase: "Be specific.", effect: "Eliminates vague advice like 'handle edge cases'" },
  { phrase: "Show your work.", effect: "Surfaces assumptions you can catch and correct" },
  { phrase: "What are you uncertain about?", effect: "Surfaces the gaps Claude is filling in with assumptions" },
  { phrase: "Assume I have no engineering background.", effect: "Gets you explanations you can actually follow" },
  { phrase: "Don't write code yet.", effect: "Forces planning before implementation" },
  { phrase: "What would make this worse?", effect: "Pre-mortem thinking — catches failure modes early" },
  { phrase: "Give me the short version.", effect: "Stops Claude from writing an essay when you need a sentence" },
  { phrase: "What am I missing?", effect: "Opens the door to things you didn't know to ask about" },
  { phrase: "Here's what I've already tried:", effect: "Prevents Claude from suggesting things you've ruled out" },
];

const evaluationQuestions = [
  "Did it answer the question I actually asked, or a slightly different one?",
  "Is there anything in this response I can't verify or don't understand?",
  "What assumption is this response making that might be wrong?",
  "If this advice is wrong, what's the worst that happens?",
  "What would a skeptical senior engineer say about this?",
];

export default function PromptPatternsPage() {
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
              Prompts
            </span>
            <span className="text-xs text-muted-foreground">15 min</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Prompt Patterns Cheat Sheet
          </h1>
          <p className="text-lg text-muted-foreground">
            Most people use AI like a search engine — type a question, get an answer.
            These 5 patterns change the dynamic: you&apos;re directing an expert, not querying a
            database. The difference in output quality is immediate and significant.
          </p>
        </div>

        {/* 5 Patterns */}
        <div className="flex flex-col gap-6 mb-12">
          {patterns.map((p) => (
            <div key={p.number} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {p.number}
                </span>
                <div>
                  <h2 className="font-bold leading-none">{p.name}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.tagline}</p>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Template
                  </p>
                  <div className="rounded-lg bg-muted px-4 py-3 font-mono text-xs leading-relaxed text-foreground">
                    {p.template}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Example
                  </p>
                  <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground italic">
                    &ldquo;{p.example}&rdquo;
                  </div>
                </div>

                <div className="rounded-lg bg-primary/5 px-4 py-3">
                  <p className="text-xs font-semibold text-primary mb-1">Why it works</p>
                  <p className="text-xs text-muted-foreground">{p.why}</p>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">When to use:</span> {p.when}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Power phrases */}
        <div className="mb-12">
          <h2 className="mb-1 text-xl font-bold">Power Phrases</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Short phrases you can add to any prompt to dramatically improve the output.
          </p>
          <div className="rounded-xl border border-border overflow-hidden">
            {powerPhrases.map((item, i) => (
              <div
                key={item.phrase}
                className={`flex items-start gap-4 px-5 py-3.5 ${
                  i < powerPhrases.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <code className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs font-mono text-foreground">
                  {item.phrase}
                </code>
                <p className="text-xs text-muted-foreground">{item.effect}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation framework */}
        <div className="mb-12">
          <h2 className="mb-1 text-xl font-bold">5-Question Evaluation Framework</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Before you copy-paste AI output into your code or share it with a stakeholder,
            run it through these 5 questions. They catch 90% of the problems.
          </p>
          <div className="flex flex-col gap-3">
            {evaluationQuestions.map((q, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <p className="text-sm">{q}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The one meta-pattern */}
        <div className="mb-12 rounded-xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="mb-2 text-base font-bold">The meta-pattern behind all of these</h2>
          <p className="text-sm text-muted-foreground">
            Every pattern on this page does the same thing: it gives Claude more context about
            who you are, what you want, and what you don&apos;t want. AI output quality is almost
            entirely a function of how well you specify the problem. Better prompts don&apos;t require
            technical knowledge — they require clarity about what you actually want.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-xl border border-border bg-card p-7 text-center">
          <h2 className="mb-2 text-lg font-bold">See these patterns in action</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            The Prompt Library has 44 copy-paste prompts built on these exact patterns —
            organized by role and use case.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/library/prompts"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Prompt Library
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
