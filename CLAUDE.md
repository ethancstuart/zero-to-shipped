# Zero to Ship — AI Coding Course Platform

## Project Overview
Course platform teaching non-engineers to build real software with AI coding tools. 16-module curriculum from setup to capstone. Gamified learning with XP, streaks, skill trees, and certificates. Freemium model with premium gating. Built with Claude Code.

## Tech Stack
- Next.js 16 (App Router)
- TypeScript (strict)
- React 19
- Tailwind v4 + shadcn/ui
- Supabase (Postgres + Auth)
- Shiki (syntax highlighting)
- Framer Motion (animations)
- Vercel (hosting + analytics + speed insights)

## Architecture
- Route groups: `(marketing)` for public pages, `(app)` for authenticated, `(public)` for shared profiles
- Auth: Supabase Auth with Google OAuth, callback at /auth/callback
- Content pipeline: markdown modules in cursor-for-product-teams repo → synced via `npm run sync-content`
- Gamification engine: XP, streaks, skill tree graph, reward toasts (src/lib/gamification/)
- Premium gating: tier-based content access (src/lib/content/tiers.ts)
- Middleware: protects app routes, allows marketing and public routes

## Key Commands
- `npm run dev` — start dev server
- `npm run build` — production build (runs sync-content first)
- `npm run lint` — ESLint
- `npm run sync-content` — pull module content from cursor-for-product-teams repo
- `vercel` — deploy to Vercel

## File Structure
```
src/
  app/
    (marketing)/          # Landing page, pricing, waitlist
    (app)/                # Authenticated: dashboard, modules, skill-tree, profile, certificate, cheat-sheets
    (public)/             # Public user profiles (/u/[username])
    auth/callback/        # Supabase OAuth callback
    api/og/               # OG image generation
  components/
    layout/               # Nav, sidebar, topbar, footer, login, theme toggle
    dashboard/            # Activity feed, streak calendar, completion ring, role recommendations
    modules/              # Module content, checkpoints, tool toggle, premium gate, capstone
    profile/              # Profile form, share buttons, certificate download
    gamification/         # XP popup, skill tree graph, reward toasts
    ui/                   # shadcn/ui components
  lib/
    supabase/             # Supabase client (browser + server)
    gamification/         # XP engine, constants
    content/              # Tier definitions
    constants.ts          # App-wide constants
    utils.ts              # Utility functions
  types/                  # TypeScript interfaces
```

## Content
- 16 modules synced from `~/Projects/cursor-for-product-teams/`
- Markdown with frontmatter → rendered with remark/rehype pipeline + Shiki
- Module slugs match filenames (01-setup-and-first-build, etc.)

## Notion Context
This project is tracked in Notion under Zero to Ship.
- **Zero to Ship page:** `33945c2d-baf4-8154-a09e-f604d9bb8b18`
- **Technical Architecture:** `33945c2d-baf4-814c-822f-fb7bfc54b60a`

> ⚠️ **Pre-launch P0 (April 28 deadline):** NEXT_PUBLIC_SENTRY_DSN is blank — Sentry is installed and wired but not capturing. Create a Sentry project and add the DSN to .env.local + Vercel env vars before launch. Refund policy also missing from paywall. Both tracked in Bugs & Issues.
- **Launch Tracker:** `33945c2d-baf4-81c9-99a1-ce19d0eb395c`
- **Content Calendar:** `33945c2d-baf4-8110-90e4-f47474f388d8`
- **Bugs & Issues:** `33945c2d-baf4-8154-81ad-d0dd62c3a7ba`
- **GTM Tracker:** `33945c2d-baf4-817e-bfb4-c7c5a9fe3c4c`
- **Session Brief (global):** `33945c2d-baf4-81df-bdcf-f10616ef92cf`
- **Weekly Execution Brief (global):** `33945c2d-baf4-81d6-8e6e-e401346c03d1`
- **Prompt Library (global):** `33945c2d-baf4-81dc-9f20-c8f04a134c5f`

### Bugs & Issues Severity
- **P0 — Critical**: data loss, broken auth, payment failures, crashes in core flows. Drop everything and fix immediately.
- **P1 — High**: broken feature, bad UX blocking a key user task. Fix in current session before starting new work.
- **P2 — Normal**: cosmetic issues, edge cases, minor UX degradation. Fix in order when capacity allows.
Always label new bugs with their severity tier.

### Session start — read in this order:
1. **Weekly Execution Brief** — read the most recent week entry for priority context.
   - **Staleness check**: if the most recent entry is more than 7 days old or the page is empty, flag this immediately and ask Ethan for today's priorities before proceeding.
2. **Session Brief** — check for a same-day brief. Overrides the weekly brief if present.
3. **Bugs & Issues** — check for any OPEN items. P0 blocks all other work. P1 blocks new features unless brief says otherwise.
4. **GTM Tracker** — check launch task status. If launch is within 14 days and tasks are unchecked, surface them proactively.
5. **Launch Tracker** — read current pre-launch checklist state.
6. Then begin work.

### Session end — always:
- Append a Launch Tracker entry using this structure:
  `Last updated: YYYY-MM-DD | Days to launch: N | Completed this session: [list] | Still open: [list] | P0 blockers: [list or "none"]`
- If content was planned or published, update the Content Calendar with: title, type, target channel, publish date, status.
- If it is post-April 28 launch: replace "Days to launch" with "Days since launch: N | Signups: X | Free→Premium conversions: X | Top source: [channel]".

## Conventions
- Dark theme by default (next-themes)
- Mobile-first responsive design
- TypeScript strict, never JavaScript
- Components: PascalCase in feature folders
- Server components by default, "use client" only when needed
- Route groups for layout separation (marketing vs app vs public)

## Shared Context — home-base
This project is part of a portfolio managed from ~/Projects/home-base.
Before planning features or making architectural decisions, reference:
- `~/Projects/home-base/registry.md` — project registry, status, and cross-project alignment
- `~/Projects/home-base/apis/catalog.md` — curated API catalog (teaching APIs for course modules)
- `~/Projects/home-base/standards/quality.md` — shared quality standards
- `~/Projects/home-base/standards/design-principles.md` — shared design philosophy
- `~/Projects/home-base/standards/design-toolkit.md` — skills, component libraries, and design references
- `~/Projects/home-base/personal/CLAUDE.local.md` — who Ethan is, how he works

When designing UI, consult the design toolkit before building components from scratch.
Use `/brand-guidelines` to auto-apply this project's brand identity.
Use `/frontend-design` for intentional aesthetic direction on new UI work.

When planning new modules or features, check the API catalog for teaching-friendly APIs.

## Important Notes
- `.env.local` is gitignored — copy `.env.example` and add Supabase keys
- `CLAUDE.local.md` is gitignored — personal context
- Content lives in a separate repo (cursor-for-product-teams) and is synced at build time
- Site URL: zerotoship.app
- Sentry for error tracking (`NEXT_PUBLIC_SENTRY_DSN` env var, empty = disabled)
- Email unsubscribe: HMAC-signed tokens via `CRON_SECRET`, `/api/unsubscribe` route (CAN-SPAM compliance)
- Server action input validation: Zod v4 schemas in actions files
- Profile-not-found safety net: auto-recovers missing profiles in app layout, fallback to `/setup-error`
