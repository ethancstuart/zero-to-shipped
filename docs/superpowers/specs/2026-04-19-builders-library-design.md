# Builder's Library — Design Spec
**Date:** 2026-04-19
**Target launch:** April 28, 2026
**Status:** Approved

---

## Mission

Help people become builders in this new age. The Builder's Library is a free, ungated (where appropriate) resource hub that teaches non-engineers how to build software and structure their AI world — using Cursor, Claude Code, CLAUDE.md, MCP servers, and the build loop. Everything in the library points at the same truth: you can build this, and here is how.

---

## Architecture

### URL Structure

```
/library                           ← Hub landing page (new)
/library/prompts                   ← Prompt Library (preview + email gate)
/library/dev-environment           ← Dev Environment Setup (open)
/library/ai-workflow-os            ← AI Workflow OS (open)
/library/claude-md-templates       ← CLAUDE.md Templates (1 free, rest email-gated)
/library/builder-tools             ← Builder's Tool Stack (post-launch, week 2)
/library/prompt-patterns           ← Prompt Patterns Cheat Sheet (post-launch, week 3)
```

Existing guides at `/guides/*` stay in place. The library hub links to them as part of the full picture.

The existing `/resources` page redirects to `/library` with a 301.

### Route Group

All library pages live inside the `(marketing)` route group. No auth required for any library page. Email gating is handled client-side (show/hide content after opt-in confirmed) — no middleware involvement.

### Page Structure

Each library page follows a consistent layout:
- **Hero**: title, description, time-to-read or category count, breadcrumb back to `/library`
- **Content**: full page content (open) or preview + gate (email-gated)
- **Bottom CTA**: "Want to build this yourself? Try Module 1 free →" linking to `/preview/module-1`

The hub landing page (`/library`) is a grid of all resources with category labels, descriptions, and "open" vs "email required" badges.

---

## Launch Day Resources (April 28)

### 1. Prompt Library — `/library/prompts`

**Source:** `cursor-for-product-teams/starter-prompts.md` + `prompt-patterns.md` expanded
**Format:** Interactive page — category tabs, search filter, copy-to-clipboard per prompt
**Gating:** First 10 prompts (Build + Debug categories) free. Full library (40+ prompts) behind email opt-in.

**6 Categories, 40+ prompts:**

| Category | Count | Free? |
|----------|-------|-------|
| Build — scaffold apps, components, pages, APIs | 12 | First 6 |
| Debug — explain errors, find bugs, diagnose slow code | 8 | First 4 |
| Refactor — simplify, add types, extract logic | 6 | Gated |
| Ship — READMEs, env vars, Vercel, CI checklists | 6 | Gated |
| Think — brainstorm features, write specs, pressure-test | 6 | Gated |
| PM-specific — PRDs, user stories, stakeholder updates | 6 | Gated |

**Email gate behavior:**
- Free prompts visible immediately, no interaction required
- After the 10th prompt: soft gate — "10 more categories. Enter your email to unlock the full library."
- On submit: POST `/api/toolkit-subscribe` (existing Beehiiv route, reused)
- On success: full library reveals in-place (no page reload), localStorage flag set (`zts_prompts_unlocked=true`) so it persists across sessions
- Each prompt card: title, use-case description, full prompt text in a code block, copy button
- Search: client-side filter across title + description + prompt text

**Components needed:**
- `PromptLibraryClient` (use client) — tabs, search, copy button, email gate modal
- `PromptCard` — individual prompt display
- Prompt data as a static TypeScript array in `src/lib/library/prompts.ts`

---

### 2. Dev Environment Setup — `/library/dev-environment`

**Source:** `cursor-for-product-teams/terminal-basics.md` + Module 01 content
**Format:** Long-form guide, static, fully open
**Estimated read/do time:** 45 minutes

**Sections:**
1. **What you're setting up** — brief overview, what "installed" looks like when done
2. **Mac path** — Homebrew → Node.js (LTS) → Git → Warp terminal → Cursor → Claude Code → GitHub CLI → Vercel CLI
3. **Windows path** — Chocolatey/winget → Node.js → Git for Windows → Windows Terminal → Cursor → Claude Code → GitHub CLI → Vercel CLI
4. **Verify everything works** — checklist: `node -v`, `git --version`, `claude --version`, `vercel --version`
5. **Your first 10 commands** — drawn from `terminal-basics.md`, the ones you'll use every session
6. **What's next** — link to AI Workflow OS + link to Module 1 preview

**Rendering:** Static MDX-style content rendered as a Next.js page. No markdown file needed — content lives inline in the page component as structured JSX with code blocks (Shiki for syntax highlighting via the existing pipeline).

---

### 3. AI Workflow OS — `/library/ai-workflow-os`

**Source:** `claude-code-skills.md` + `anti-patterns.mdc` + `cursor-shortcuts.md` + real CLAUDE.md files from across the portfolio
**Format:** Long-form guide, static, fully open
**Mission:** "This is how you structure your AI development world."

**Sections:**
1. **The philosophy** — you're not using a chatbot; you're operating an agent. What that means.
2. **CLAUDE.md: your project's brain** — what it is, why it matters, what to put in it (from `claude-code-skills.md` CLAUDE.md section). Shows a real example.
3. **MCP servers: connecting your AI to the world** — 4 essentials: filesystem (built-in), GitHub, browser (Puppeteer), Supabase. Install instructions for each.
4. **Cursor vs. Claude Code** — when to use which. Cursor for in-editor flow; Claude Code for multi-file agents and terminal-heavy tasks.
5. **The build loop** — prompt → review → run → evaluate → iterate. Each step with what to look for.
6. **Anti-patterns that break non-engineers** — drawn from `anti-patterns.mdc`. Top 8 mistakes with what to do instead.
7. **Cursor shortcuts** — the 12 you'll use every session, from `cursor-shortcuts.md`
8. **Power moves** — `/compact`, `/clear`, custom slash commands, memory files, agent orchestration for multi-step tasks

---

### 4. CLAUDE.md Templates — `/library/claude-md-templates`

**Source:** `home-base/templates/CLAUDE.md.default` + real CLAUDE.md files from `zero-to-shipped`, `ridgecap`, `nexus-watch`, `meridian`
**Format:** Page with template cards — click to expand, copy button
**Gating:** 1 template free, 3 behind email opt-in

**4 Templates:**

| Template | Free? | Stack |
|----------|-------|-------|
| **Blank Canvas** — universal starter, any project | ✅ Free | Any |
| **Next.js + Supabase** — the ZTS production stack | Email gate | Next.js, Supabase, Stripe, Vercel |
| **Data Dashboard** — for BAs and BI Engineers | Email gate | Python, Streamlit, SQLite/Postgres |
| **Automation Project** — scripts, crons, pipelines | Email gate | Python, Node.js, cron, Resend |

**Email gate behavior:**
- Blank Canvas visible and copyable immediately
- Click any gated template: inline email form appears within that card
- Same Beehiiv API endpoint, same localStorage flag (`zts_templates_unlocked=true`)
- On success: all 3 gated templates unlock

---

## Post-Launch Resources (Weeks 2–4)

Each one ships as a page + becomes a LinkedIn post the day it goes live.

**Week 2: Builder's Tool Stack** `/library/builder-tools`
Full modern builder stack: Warp, Arc/Chrome DevTools, Cursor, Claude Code, GitHub, Vercel, Supabase, Resend, Linear/Notion. Each tool: what it is, why builders use it, free tier notes. Source: `recommended-tools.md` expanded.

**Week 3: Prompt Patterns Cheat Sheet** `/library/prompt-patterns`
5 core patterns (Role Assignment, Plan Before Build, Step-by-Step Decomposition, The Improve Pattern, Anti-Obvious Brainstorming), power phrases, and the 5-question evaluation framework. Source: `prompt-patterns.md`. Fully open — designed to be screenshot and shared.

**Week 4: Debugging with AI** `/library/debugging`
The 5-step loop for when the AI breaks your code. Most shareable post-launch piece.

---

## Hub Landing Page — `/library`

Grid layout. Each resource card shows:
- Icon + title
- 1-line description
- Category tag (Prompts / Setup / Workflow / Templates / Tools)
- Badge: "Free" or "Email required"
- Estimated time or item count

The hub is fully static (no data fetching). All 8 slots visible on launch day — post-launch resources show "Coming [week]" badges until live.

Redirect: `/resources` → `/library` (permanent 301 in `next.config.ts`)

---

## Email Gate — Technical Design

**Endpoint:** `POST /api/toolkit-subscribe` (already exists, reused as-is)
**Requires:** `BEEHIIV_API_KEY` + `BEEHIIV_PUBLICATION_ID` set in Vercel

**Client flow:**
1. User hits gate → inline email form renders (no modal/page change)
2. POST to `/api/toolkit-subscribe` with `{ email }`
3. Success → localStorage key set → gated content reveals with a fade-in transition
4. On subsequent visits → localStorage check → content shows immediately, no opt-in required
5. Error → "Something went wrong. Try again." inline message (same as `/toolkit` pattern)

**Fallback if Beehiiv not configured:** Gate still shows but `/api/toolkit-subscribe` returns 500. User sees error message. Content stays hidden. No crash.

**Note:** `/api/toolkit-subscribe` currently has no validation beyond `email.includes('@')`. That's sufficient — Beehiiv handles deliverability.

---

## Components

New components needed (all in `src/components/library/`):
- `PromptLibraryClient.tsx` — interactive prompt browser with tabs, search, gate
- `PromptCard.tsx` — individual prompt with copy button
- `TemplateCard.tsx` — CLAUDE.md template with expand + email gate
- `LibraryEmailGate.tsx` — reusable inline email gate form used by both Prompts and Templates

New pages (all in `src/app/(marketing)/library/`):
- `page.tsx` — hub landing
- `prompts/page.tsx` — Prompt Library
- `dev-environment/page.tsx` — Dev Environment Setup
- `ai-workflow-os/page.tsx` — AI Workflow OS
- `claude-md-templates/page.tsx` — CLAUDE.md Templates
- `builder-tools/page.tsx` — Builder's Tool Stack (placeholder or full content)
- `prompt-patterns/page.tsx` — Prompt Patterns (placeholder or full content)

New data files:
- `src/lib/library/prompts.ts` — 40+ prompts as typed array
- `src/lib/library/templates.ts` — 4 CLAUDE.md templates as typed array

---

## Redirect

Add to `next.config.ts`:
```ts
async redirects() {
  return [{ source: '/resources', destination: '/library', permanent: true }]
}
```

---

## Error Handling

- Email gate API failure → inline error, content stays hidden, no crash
- Email gate localStorage read → wrapped in try/catch (SSR safety)
- Copy button → clipboard API with fallback to manual select (unsupported browsers)
- Missing Beehiiv env vars → gate renders but shows "Email unavailable — check back soon" fallback message

---

## Testing

No new test files required. Existing 86 tests must still pass. Manual QA checklist:
- [ ] Hub page loads, all 8 resource cards visible
- [ ] Free prompts visible without any interaction
- [ ] Email gate form submits and reveals gated content
- [ ] localStorage flag persists across page refresh (gated content stays open)
- [ ] Copy button copies correct prompt text
- [ ] Dev Environment guide renders code blocks with syntax highlighting
- [ ] CLAUDE.md Templates: Blank Canvas copyable immediately
- [ ] `/resources` redirects to `/library`
- [ ] Bottom CTA on every library page links to `/preview/module-1`

---

## Content Sources

| Resource | Primary Source | Expand With |
|----------|---------------|-------------|
| Prompt Library | `cursor-for-product-teams/starter-prompts.md` | Write new: Refactor, Ship, Think, PM-specific categories |
| Dev Environment | `cursor-for-product-teams/terminal-basics.md` + Module 01 | Write Mac + Windows paths in full |
| AI Workflow OS | `claude-code-skills.md` + `anti-patterns.mdc` + `cursor-shortcuts.md` | Write philosophy + build loop sections |
| CLAUDE.md Templates | `home-base/templates/CLAUDE.md.default` + real project CLAUDE.mds | Adapt 4 templates for each audience |
| Builder's Tool Stack | `recommended-tools.md` | Expand with why + free tier notes |
| Prompt Patterns | `prompt-patterns.md` | Minor expansion, mostly already done |
