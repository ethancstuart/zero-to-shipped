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
- `~/Projects/home-base/personal/CLAUDE.local.md` — who Ethan is, how he works

When planning new modules or features, check the API catalog for teaching-friendly APIs.

## Important Notes
- `.env.local` is gitignored — copy `.env.example` and add Supabase keys
- `CLAUDE.local.md` is gitignored — personal context
- Content lives in a separate repo (cursor-for-product-teams) and is synced at build time
- Site URL: zerotoship.app
