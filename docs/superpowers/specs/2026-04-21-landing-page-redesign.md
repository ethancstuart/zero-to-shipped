# Zero to Ship — Landing Page Redesign Spec
**Date:** 2026-04-21
**Status:** Approved by Chairman
**Goal:** $2K/month by July 2026 (month 3 post-launch). Content-first funnel that earns the pitch.

---

## Context

The current zerotoship.app landing page talks about the course but doesn't show it. The dark theme feels uninviting for the target audience (analytically-minded PMs, BAs, PjMs, BI Engineers who are tech-curious but skeptical of hype). The UX flow doesn't surface free value before asking for a conversion, and locked modules give no insight into what's behind the gate.

This redesign addresses all three: visual direction, UX flow, and paid content transparency.

---

## Design Decisions Locked

### 1. Visual Direction — A3 (Light + Gradient Energy)
- **Background:** White (`#ffffff`), with `#f8fafc` for secondary sections
- **Accent:** Indigo → purple → cyan gradient (`#6366f1 → #8b5cf6 → #06b6d4`)
- **Top bar:** 3px gradient stripe at the very top of the page (visual signature)
- **Headings:** Near-black (`#0f172a`), heavy weight (800), tight letter-spacing
- **Body text:** Slate (`#475569`, `#64748b`) — readable, not harsh
- **Gradient text:** Hero headline "Start shipping." uses the full gradient
- **CTAs:** Gradient button (primary), dark outline (secondary)
- **No dark background.** The in-app dashboard stays dark (that's the product). The marketing site is light.

### 2. Hero — Split Layout (A+B combined)
**Left column (1.1fr):**
- Founding badge (purple pill with pulse dot)
- H1: "Stop learning. / Start shipping." — gradient on second line
- Subhead: "Go from 'I have an idea' to a live URL — even if you've never written a line of code."
- Role callout: "Built for PMs, Project Managers, BAs, and BI Engineers."
- Primary CTA: "Try Module 1 free →" (gradient button with shadow)
- Secondary CTA: "View curriculum" (outline)
- Helper text: "No sign-up required · 5 modules free after sign-in"

**Right column (0.9fr), background `#f8fafc`:**
- Module 1 progress card (title, 3 checkpoints — 2 done, 1 active in indigo)
- XP progress bar with label ("Module 1 of 16 · 240 XP")
- 3 badge chips: 🔥 streak / 🏆 First Build / 📦 Deployed

### 3. Below Hero — "What you build in Module 1" Strip
Background: `#fafbff`. 3-column grid.
- **A working web app** — Real URL. Runs in a browser. Built in 40 minutes from a plain-English prompt.
- **The build loop** — Prompt → review → run → evaluate → iterate. Taught in context, not theory.
- **Proof it works on you** — Before you pay for anything, you'll know if the method clicks — because you just did it.

### 4. Page Flow — Structure C (Content-first)
Sections in order:
1. Hero (split)
2. "What you build in Module 1" strip
3. Free content hub
4. Full curriculum (all 16 modules, locked ones with C-style preview card)
5. Pricing (one-time only)
6. Role tracks
7. Final CTA

### 5. Free Content Hub
Label: "Free resources — no account needed"
Subtitle: "Start learning right now. These are free, forever."
4-column grid linking to existing pages:
- 📖 **Git for PMs** → `/guides/git-101`
- ⚡ **Claude Code 101** → `/guides/claude-code-101`
- 🤖 **Agent Templates** → `/agents`
- 🗂️ **Prompt Cheat Sheet** → `/library` (prompt library)

### 6. Curriculum Section — All 16 Modules
- Free modules: green background, checkmark, "Free" badge, "Ship: [what you build]"
- Locked modules: dashed purple border, purple background, 🔒 icon
- **Locked module card (C-style):** 2-column layout inside the card:
  - Left: "What's inside" — bullet list of lesson topics (4 items)
  - Right: "You'll ship:" — one sentence describing the concrete output
- CTA below curriculum: "Unlock all 16 modules — $99 founding" (gradient button)

### 7. Pricing Section — One-Time Only
Background: `#f8fafc`. Two cards side by side.

**Free card:**
- $0 forever
- Modules 1–5, XP + streaks, progress tracking
- "Start free" button (outline)

**Full Access card (featured, indigo border):**
- "Founding" tab on top right
- $99 one-time (strikethrough $199)
- "one-time · no subscription" — explicit
- All 16 modules, Capstone, Certificate, Role tracks
- "Get founding access" button (gradient)

Footer note: "14-day money-back guarantee · No questions asked"

**Pricing model:** One-time only. No $9.99/month tier. (Council decision 2026-04-21 — unanimous reject.)

### 8. Role Tracks
4-column icon grid: Product Manager, Project Manager, Business Analyst, BI Engineer.
Links to existing `/for/[slug]` role pages.

### 9. Final CTA Section
Background: soft gradient (`#f5f3ff → #eff6ff`)
- H2: "Ready to build something?"
- Subhead: "Module 1 is free. No sign-up. You'll ship a working app in 40 minutes."
- Primary CTA: "Try Module 1 free →" (gradient button)

---

## What This Redesign Does NOT Change
- The in-app experience (dashboard, modules, gamification UI) — stays dark, stays as-is
- The pricing model — one-time only, founding $99 / full $199
- The free tier — still 5 modules
- Any backend, API, or database logic
- The `/pricing`, `/library`, `/resources`, `/guides/*` pages (out of scope for this sprint)

---

## Revenue Path
- Founding ($99): 20 sales/month = $2K/mo ✓
- Post-founding ($199): 10 sales/month = $2K/mo ✓
- Month 3 target (July 2026): $2K/month

Key conversion lever: free→paid rate from Module 1 preview. If under 3% after 2 weeks, revisit free tier gate position.

---

## Files to Create / Modify
- `src/app/(marketing)/page.tsx` — full rewrite
- `src/components/marketing/` — new components as needed (hero split, what-you-build strip, free content hub, curriculum-with-preview, pricing section)
- `src/app/globals.css` or Tailwind config — no dark theme override needed for marketing route group (already separate)

---

## Out of Scope
- Animations beyond what Tailwind/Framer Motion already supports
- A/B testing new vs old layout (launch new, iterate post-data)
- Mobile-specific design (mobile-first responsive is built-in; verify after implementation)
- Any content changes to the actual modules
