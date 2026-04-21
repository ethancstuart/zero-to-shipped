# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark, talk-about-the-course landing page with a light, content-first page that shows the product, surfaces free value immediately, and earns the pitch — targeting $2K/month by July 2026.

**Architecture:** Seven focused marketing components mounted in `page.tsx`. All components use hardcoded light Tailwind classes (slate/indigo/white) rather than CSS theme variables, so they render correctly regardless of the user's dark/light theme preference. No new API routes, no new database logic.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind v4, shadcn/ui, Lucide React, existing `FoundingCounter` + `LoginButton` + `CheckoutButton` components.

---

## File Map

**Create:**
- `src/components/marketing/hero-section.tsx` — Split hero (headline left, platform preview right)
- `src/components/marketing/what-you-build-strip.tsx` — 3-card "what you build in Module 1" strip
- `src/components/marketing/free-content-hub.tsx` — 4-column free resources grid
- `src/components/marketing/curriculum-section.tsx` — All 16 modules; locked ones show C-style preview card
- `src/components/marketing/pricing-section.tsx` — 2-card one-time pricing
- `src/components/marketing/role-tracks-section.tsx` — 4-column role grid
- `src/components/marketing/final-cta-section.tsx` — Final gradient CTA

**Modify:**
- `src/lib/content/modules.ts` — Add `ships` field to each module entry
- `src/types/index.ts` — Add `ships: string` to `ModuleMeta` interface
- `src/app/(marketing)/page.tsx` — Full rewrite using new components

---

## Task 1: Add `ships` field to ModuleMeta type and all 16 modules

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/lib/content/modules.ts`

- [ ] **Step 1: Add `ships` to the ModuleMeta interface**

Find the `ModuleMeta` interface in `src/types/index.ts` and add one field:

```typescript
ships: string; // one sentence: what the student concretely ships in this module
```

- [ ] **Step 2: Add `ships` to every module in `src/lib/content/modules.ts`**

Add the following `ships` values (insert after `description` in each entry):

```typescript
// Module 1
ships: "A working web app built from a plain-English prompt, running in a browser with a real URL.",

// Module 2
ships: "Three versions of the same app showing how prompt quality changes the output — documented and committed.",

// Module 3
ships: "Your Module 1 project with 10+ code annotations explaining what each part does.",

// Module 4
ships: "A set of CLI scripts that automate at least one task in your daily workflow.",

// Module 5
ships: "A version-controlled project on GitHub with 5+ commits, a branch, and a merged pull request.",

// Module 6
ships: "A project blueprint with rule files that make AI follow your conventions without being asked.",

// Module 7
ships: "A documented ideation session with 20+ ideas, evaluated and committed to Git.",

// Module 8
ships: "A scoped project plan with task breakdown, estimates, and a stress-tested research synthesis.",

// Module 9
ships: "A multi-component interactive tool deployed to a live URL with real user feedback.",

// Module 10
ships: "A presentation deck with charts and a standalone architecture diagram, exported and committed.",

// Module 11
ships: "A restyled project that looks noticeably more professional, with before/after documentation.",

// Module 12
ships: "A data product prototype with charts, table, summary metrics, and a production handoff doc.",

// Module 13
ships: "A working automation that runs on a schedule, logs its actions, and has a documented ROI estimate.",

// Module 14
ships: "A security-audited, documented project with test coverage — shipped to a live URL.",

// Module 15
ships: "A merged pull request on someone else's project, plus a handoff document for one of yours.",

// Module 16
ships: "A complete product solving a real problem — live URL, user documentation, and a certificate of completion.",
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/ethanstuart/Projects/zero-to-shipped && npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no TypeScript errors referencing `ships`.

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/lib/content/modules.ts
git commit -m "feat: add ships field to ModuleMeta for curriculum preview cards"
```

---

## Task 2: HeroSection component

**Files:**
- Create: `src/components/marketing/hero-section.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Link from "next/link";
import { FoundingCounter } from "@/components/marketing/founding-counter";
import { LoginButton } from "@/components/layout/login-button";

export function HeroSection() {
  return (
    <section className="border-b border-slate-100">
      {/* 3px gradient top bar */}
      <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />

      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: Headline + CTA */}
        <div className="px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
          {/* Founding badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5">
            <span className="size-2 animate-pulse rounded-full bg-purple-500" />
            <span className="text-xs font-semibold text-purple-700">
              Founding: $99 — 200 spots remaining
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl" style={{ letterSpacing: "-0.03em", lineHeight: "1.1" }}>
            Stop learning.
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Start shipping.
            </span>
          </h1>

          {/* Subhead */}
          <p className="mb-2 text-base text-slate-600 sm:text-lg" style={{ lineHeight: "1.6" }}>
            Go from &ldquo;I have an idea&rdquo; to a live URL — even if you&apos;ve
            never written a line of code.
          </p>
          <p className="mb-8 text-sm text-slate-400">
            Built for PMs, Project Managers, BAs, and BI Engineers.
          </p>

          {/* CTAs */}
          <div className="mb-4 flex flex-wrap gap-3">
            <Link
              href="/preview/module-1"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-opacity hover:opacity-90"
            >
              Try Module 1 free →
            </Link>
            <Link
              href="#curriculum"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              View curriculum
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            No sign-up required · 5 modules free after sign-in
          </p>
        </div>

        {/* Right: Platform preview */}
        <div className="flex flex-col gap-3 bg-slate-50 p-6 sm:p-8 lg:p-10">
          {/* Module card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Module 1 · The Build Loop</span>
              <span className="text-xs font-semibold text-green-600">Free</span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { done: true, label: "Set up your dev environment" },
                { done: true, label: "Write your first prompt" },
                { done: false, label: "Ship your first working app", active: true },
              ].map(({ done, label, active }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`flex size-4 shrink-0 items-center justify-center rounded-full text-white ${
                      active ? "bg-indigo-500" : done ? "bg-green-500" : "bg-slate-200"
                    }`}
                  >
                    <span className="text-[8px] font-bold">{active ? "→" : done ? "✓" : ""}</span>
                  </div>
                  <span
                    className={`text-xs ${active ? "font-semibold text-indigo-600" : done ? "text-slate-700" : "text-slate-400"}`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* XP progress */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Your progress</span>
              <span className="text-xs font-semibold text-purple-600">240 XP</span>
            </div>
            <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[35%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            </div>
            <p className="text-[11px] text-slate-400">Module 1 of 16 · Keep your streak going</p>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { emoji: "🔥", label: "3 day streak" },
              { emoji: "🏆", label: "First Build" },
              { emoji: "📦", label: "Deployed" },
            ].map(({ emoji, label }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                <div className="mb-1 text-xl">{emoji}</div>
                <div className="text-[11px] font-bold text-slate-900">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/ethanstuart/Projects/zero-to-shipped && npx tsc --noEmit 2>&1 | grep "hero-section" | head -10
```

Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/hero-section.tsx
git commit -m "feat: add HeroSection component — split layout with platform preview"
```

---

## Task 3: WhatYouBuildStrip, FreeContentHub, and FinalCtaSection components

**Files:**
- Create: `src/components/marketing/what-you-build-strip.tsx`
- Create: `src/components/marketing/free-content-hub.tsx`
- Create: `src/components/marketing/final-cta-section.tsx`

- [ ] **Step 1: Create WhatYouBuildStrip**

```tsx
// src/components/marketing/what-you-build-strip.tsx
export function WhatYouBuildStrip() {
  const items = [
    {
      title: "A working web app",
      body: "Real URL. Runs in a browser. Built from a plain-English prompt in under 40 minutes.",
    },
    {
      title: "The build loop",
      body: "Prompt → review → run → evaluate → iterate. Taught in context, not theory.",
    },
    {
      title: "Proof it works on you",
      body: "Before you pay for anything, you'll know if the method clicks — because you just did it.",
    },
  ];

  return (
    <section className="border-b border-slate-100 bg-[#fafbff] px-6 py-10 sm:px-10">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-purple-600">
        What you build in Module 1 — free, no sign-up
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map(({ title, body }) => (
          <div key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-1.5 font-bold text-slate-900">{title}</p>
            <p className="text-sm text-slate-500" style={{ lineHeight: "1.6" }}>{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create FreeContentHub**

```tsx
// src/components/marketing/free-content-hub.tsx
import Link from "next/link";

const FREE_RESOURCES = [
  {
    emoji: "📖",
    title: "Git for PMs",
    body: "The 5 commands you actually need. Nothing else.",
    href: "/guides/git-101",
  },
  {
    emoji: "⚡",
    title: "Claude Code 101",
    body: "Get from idea to running code in one session.",
    href: "/guides/claude-code-101",
  },
  {
    emoji: "🤖",
    title: "Agent Templates",
    body: "4 open-source templates. Clone and run.",
    href: "/agents",
  },
  {
    emoji: "🗂️",
    title: "Prompt Cheat Sheet",
    body: "40+ prompts for PMs who build.",
    href: "/library",
  },
];

export function FreeContentHub() {
  return (
    <section className="border-b border-slate-100 px-6 py-12 sm:px-10">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-purple-600">
        Free resources — no account needed
      </p>
      <p className="mb-6 text-sm text-slate-500">Start learning right now. These are free, forever.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FREE_RESOURCES.map(({ emoji, title, body, href }) => (
          <Link
            key={title}
            href={href}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >
            <div className="mb-3 text-2xl">{emoji}</div>
            <p className="mb-1 font-bold text-slate-900 group-hover:text-indigo-600">{title}</p>
            <p className="text-xs text-slate-500" style={{ lineHeight: "1.5" }}>{body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create FinalCtaSection**

```tsx
// src/components/marketing/final-cta-section.tsx
import Link from "next/link";

export function FinalCtaSection() {
  return (
    <section className="px-6 py-20 text-center sm:px-10" style={{ background: "linear-gradient(135deg, #f5f3ff, #eff6ff)" }}>
      <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-950" style={{ letterSpacing: "-0.02em" }}>
        Ready to build something?
      </h2>
      <p className="mb-8 text-base text-slate-500">
        Module 1 is free. No sign-up. You&apos;ll ship a working app in 40 minutes.
      </p>
      <Link
        href="/preview/module-1"
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-opacity hover:opacity-90"
      >
        Try Module 1 free →
      </Link>
    </section>
  );
}
```

- [ ] **Step 4: Verify no TypeScript errors**

```bash
cd /Users/ethanstuart/Projects/zero-to-shipped && npx tsc --noEmit 2>&1 | grep -E "what-you-build|free-content|final-cta" | head -10
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/what-you-build-strip.tsx src/components/marketing/free-content-hub.tsx src/components/marketing/final-cta-section.tsx
git commit -m "feat: add WhatYouBuildStrip, FreeContentHub, FinalCtaSection components"
```

---

## Task 4: CurriculumSection with C-style locked module cards

**Files:**
- Create: `src/components/marketing/curriculum-section.tsx`

This is the most complex component. Free modules (1–5) show a simple green row. Locked modules (6–16) show a 2-column card: "What's inside" (4 bullet points from checkpoints) + "You'll ship:" (the `ships` field).

- [ ] **Step 1: Create CurriculumSection**

```tsx
// src/components/marketing/curriculum-section.tsx
import Link from "next/link";
import { MODULE_METADATA } from "@/lib/content/modules";

const FREE_MODULE_NUMBERS = [1, 2, 3, 4, 5];

export function CurriculumSection() {
  return (
    <section id="curriculum" className="border-b border-slate-100 px-6 py-14 sm:px-10">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-purple-600">
        The full curriculum
      </p>
      <p className="mb-8 text-sm text-slate-500">16 modules. Every one produces something real.</p>

      <div className="flex flex-col gap-3">
        {MODULE_METADATA.map((mod) => {
          const isFree = FREE_MODULE_NUMBERS.includes(mod.number);

          if (isFree) {
            return (
              <div
                key={mod.number}
                className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4"
              >
                <div className="flex size-5 shrink-0 items-center justify-center rounded bg-green-500 text-white">
                  <span className="text-[10px] font-bold">✓</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      Module {mod.number} — {mod.title}
                    </span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                      Free
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">Ship: {mod.ships}</p>
                </div>
              </div>
            );
          }

          // Locked module — C-style card
          const lessonTopics = mod.checkpoints.slice(0, 4);

          return (
            <div
              key={mod.number}
              className="rounded-xl border border-dashed border-purple-200 bg-purple-50/50 p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  Module {mod.number} — {mod.title}
                </span>
                <span className="text-sm">🔒</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-purple-100 bg-white p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    What&apos;s inside
                  </p>
                  <ul className="flex flex-col gap-1">
                    {lessonTopics.map((topic) => (
                      <li key={topic} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <span className="mt-0.5 shrink-0 text-purple-500">→</span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-purple-100 bg-white p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-purple-700">
                    You&apos;ll ship:
                  </p>
                  <p className="text-xs text-slate-700" style={{ lineHeight: "1.6" }}>
                    {mod.ships}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-opacity hover:opacity-90"
        >
          Unlock all 16 modules — $99 founding →
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/ethanstuart/Projects/zero-to-shipped && npx tsc --noEmit 2>&1 | grep "curriculum-section" | head -10
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/curriculum-section.tsx
git commit -m "feat: add CurriculumSection with C-style locked module preview cards"
```

---

## Task 5: PricingSection and RoleTracksSection components

**Files:**
- Create: `src/components/marketing/pricing-section.tsx`
- Create: `src/components/marketing/role-tracks-section.tsx`

- [ ] **Step 1: Create PricingSection**

```tsx
// src/components/marketing/pricing-section.tsx
import Link from "next/link";
import { CheckoutButton } from "@/components/pricing/checkout-button";
import { FoundingCounter } from "@/components/marketing/founding-counter";
import { LoginButton } from "@/components/layout/login-button";

export function PricingSection() {
  return (
    <section className="border-b border-slate-100 bg-slate-50 px-6 py-14 sm:px-10">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-purple-600">Pricing</p>
      <p className="mb-8 text-sm text-slate-500">Start free. Upgrade when you&apos;re ready.</p>

      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        {/* Free card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-1 font-bold text-slate-900">Free</p>
          <p className="mb-1 text-3xl font-extrabold text-slate-950">$0</p>
          <p className="mb-5 text-xs text-slate-400">forever</p>
          <ul className="mb-6 flex flex-col gap-2 text-sm text-slate-600">
            {["Modules 1–5 (Foundations)", "XP, badges, and streaks", "Progress tracking"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {f}
              </li>
            ))}
          </ul>
          <LoginButton source="landing_pricing" />
        </div>

        {/* Full access card */}
        <div className="relative rounded-2xl border-2 border-indigo-500 bg-white p-6 shadow-md">
          <div className="absolute -top-px right-4 rounded-b-lg bg-indigo-500 px-3 py-1 text-[10px] font-bold text-white">
            Founding
          </div>
          <p className="mb-1 font-bold text-slate-900">Full Access</p>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-950">$99</span>
            <span className="text-sm text-slate-400 line-through">$199</span>
          </div>
          <p className="mb-1 text-xs text-slate-400">one-time · no subscription</p>
          <FoundingCounter />
          <ul className="my-4 flex flex-col gap-2 text-sm text-slate-600">
            {[
              "Everything in Free",
              "Modules 6–16 (Intermediate → Capstone)",
              "Role-specific learning paths",
              "Capstone project templates",
              "Certificate of completion",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-indigo-500">✓</span> {f}
              </li>
            ))}
          </ul>
          <CheckoutButton tier="premium" source="landing_pricing" className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition-opacity hover:opacity-90" />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        14-day money-back guarantee · No questions asked
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Create RoleTracksSection**

```tsx
// src/components/marketing/role-tracks-section.tsx
import Link from "next/link";
import { MODULE_METADATA } from "@/lib/content/modules";
import { ROLE_LABELS } from "@/lib/constants";
import { getRoleLandingSlugByRoleKey } from "@/lib/content/role-landing";
import type { RoleTrack } from "@/types";

const ROLE_EMOJIS: Record<RoleTrack, string> = {
  pm: "📋",
  pjm: "📊",
  ba: "🔍",
  bi: "📈",
};

export function RoleTracksSection() {
  return (
    <section className="border-b border-slate-100 px-6 py-14 sm:px-10">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-purple-600">
        Pick your track
      </p>
      <p className="mb-8 text-sm text-slate-500">
        Every module is available to everyone. Your track surfaces the most relevant ones first.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(ROLE_LABELS) as RoleTrack[]).map((role) => {
          const coreCount = MODULE_METADATA.filter(
            (m) => m.roleRelevance[role] === "core"
          ).length;
          const slug = getRoleLandingSlugByRoleKey(role);
          return (
            <Link
              key={role}
              href={`/for/${slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="mb-3 text-2xl">{ROLE_EMOJIS[role]}</div>
              <p className="mb-1 font-bold text-slate-900 group-hover:text-indigo-600">
                {ROLE_LABELS[role]}
              </p>
              <p className="text-xs text-slate-400">{coreCount} core modules</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify no TypeScript errors**

```bash
cd /Users/ethanstuart/Projects/zero-to-shipped && npx tsc --noEmit 2>&1 | grep -E "pricing-section|role-tracks" | head -10
```

Expected: no output.

- [ ] **Step 4: Check CheckoutButton props**

Before committing, verify the `CheckoutButton` component accepts a `className` prop:

```bash
grep -n "className" /Users/ethanstuart/Projects/zero-to-shipped/src/components/pricing/checkout-button.tsx | head -5
```

If it does not accept `className`, replace the `CheckoutButton` in PricingSection with:

```tsx
<div className="w-full">
  <CheckoutButton tier="premium" source="landing_pricing" />
</div>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/pricing-section.tsx src/components/marketing/role-tracks-section.tsx
git commit -m "feat: add PricingSection and RoleTracksSection components"
```

---

## Task 6: Rewrite page.tsx

**Files:**
- Modify: `src/app/(marketing)/page.tsx`

This task replaces the entire page with the new components. Keep the JSON-LD schema and `searchParams` error handling.

- [ ] **Step 1: Rewrite page.tsx**

```tsx
// src/app/(marketing)/page.tsx
import { siteConfig } from "@/lib/constants";
import { HeroSection } from "@/components/marketing/hero-section";
import { WhatYouBuildStrip } from "@/components/marketing/what-you-build-strip";
import { FreeContentHub } from "@/components/marketing/free-content-hub";
import { CurriculumSection } from "@/components/marketing/curriculum-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { RoleTracksSection } from "@/components/marketing/role-tracks-section";
import { FinalCtaSection } from "@/components/marketing/final-cta-section";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Zero to Ship",
  description:
    "A gamified learning platform teaching PMs, Project Managers, BAs, and BI Engineers to build real products with AI coding tools.",
  provider: {
    "@type": "Organization",
    name: "Zero to Ship",
    url: siteConfig.url,
  },
  numberOfCredits: 16,
  educationalLevel: "Beginner to Advanced",
  isAccessibleForFree: true,
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "Online",
    courseWorkload: "PT70H",
  },
};

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {error === "auth" && (
        <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-center text-sm text-red-700">
          Sign in failed. Please try again.
        </div>
      )}

      <HeroSection />
      <WhatYouBuildStrip />
      <FreeContentHub />
      <CurriculumSection />
      <PricingSection />
      <RoleTracksSection />
      <FinalCtaSection />
    </div>
  );
}
```

- [ ] **Step 2: Run full build**

```bash
cd /Users/ethanstuart/Projects/zero-to-shipped && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` with no TypeScript or lint errors.

- [ ] **Step 3: Fix any build errors before continuing**

Common issues to check:
- `CheckoutButton` missing `className` prop → wrap in a div instead (see Task 5 Step 4)
- `FoundingCounter` placement inside PricingSection causing hydration issues → move below the price line
- Import paths wrong → all imports use `@/` alias

- [ ] **Step 4: Commit**

```bash
git add src/app/(marketing)/page.tsx
git commit -m "feat: rewrite landing page with content-first light design"
```

---

## Task 7: Visual QA — run dev server and verify

**Files:** None created. This is a manual review step.

- [ ] **Step 1: Start dev server**

```bash
cd /Users/ethanstuart/Projects/zero-to-shipped && npm run dev
```

Open `http://localhost:3000` in a browser.

- [ ] **Step 2: Check every section top to bottom**

| Section | What to verify |
|---|---|
| Top gradient bar | 3px gradient stripe visible at very top |
| Hero — left | Badge, headline with gradient "Start shipping.", subhead, two CTAs, helper text |
| Hero — right | Module 1 card with 2 checked + 1 active checkpoint, XP bar, 3 badge chips |
| What you build strip | 3 cards on light blue background, correct copy |
| Free content hub | 4 cards with emoji + correct href links |
| Curriculum | Modules 1–5 green rows; Modules 6–16 purple dashed cards with 2-column preview |
| Pricing | Free card + Full Access card with Founding tab, gradient CTA button |
| Role tracks | 4 cards linking to /for/[slug] |
| Final CTA | Gradient background, headline, single CTA button |

- [ ] **Step 3: Check mobile (375px)**

Open DevTools → toggle device toolbar → iPhone SE (375px width). Verify:
- Hero stacks to single column
- "What you build" cards stack to single column
- Free content hub stacks to 2×2
- Curriculum cards readable on mobile
- Pricing cards stack to single column

- [ ] **Step 4: Run lint + build one more time**

```bash
cd /Users/ethanstuart/Projects/zero-to-shipped && npm run lint && npm run build 2>&1 | tail -5
```

Expected: lint clean, build succeeds.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: landing page redesign complete — light theme, content-first, C-style module previews"
```

- [ ] **Step 6: Push**

```bash
git push
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Visual direction A3 — white bg, gradient accent, top bar | Task 2 (HeroSection has top bar), Task 6 (page.tsx has `bg-white`) |
| Hero split layout — headline left, platform preview right | Task 2 |
| Founding badge with pulse dot | Task 2 |
| Gradient headline "Start shipping." | Task 2 |
| Platform preview — module card, XP bar, 3 badges | Task 2 |
| "What you build in Module 1" 3-card strip | Task 3 |
| Free content hub — 4 resources | Task 3 |
| Curriculum — all 16 modules | Task 4 |
| Free modules green, locked modules dashed purple | Task 4 |
| C-style locked card: "What's inside" + "You'll ship:" | Task 4 |
| `ships` field on MODULE_METADATA | Task 1 |
| Pricing section — one-time only, 2 cards | Task 5 |
| No $9.99/mo tier | Task 5 (only 2 cards: Free + Full Access) |
| Role tracks section | Task 5 |
| Final CTA section | Task 3 |
| Auth error handling preserved | Task 6 |
| JSON-LD schema preserved | Task 6 |
| Mobile responsive | Task 7 |

**No gaps found.**

**Placeholder scan:** No TBD, TODO, or "implement later" in any task. All code blocks complete.

**Type consistency:** `mod.ships` defined in Task 1 and used in Task 4. `FREE_MODULE_NUMBERS` array in Task 4 correctly matches modules 1–5 which are the free tier.
