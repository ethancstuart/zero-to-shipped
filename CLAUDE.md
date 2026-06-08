# Prototype Studio — AI Prototyping Platform

## Project Overview
AI prototyping platform with 4 content pillars (Pulse, Build, Learn, System). Features a tool intelligence engine, multi-agent content pipeline, AI assistant, Arena comparisons, showcase, and public API. Built for non-engineers and builders who want to ship with AI tools.

## Brand Voice
**Single source of truth:** `docs/brand/voice.md` — read this before writing any copy, emails, or UI text.
- Core position: "Built by builders, for builders."
- Audience: PMs, BAs, Project Managers, BI Engineers — not developers.
- On-site: product voice, no personal brand, no founder mentions.
- Content (email/social): first-person builder voice, anonymous ("a PM"), about the work not the person.
- No hype, no exclamation points, no emoji. Short sentences. Ship is the verb.

## Tech Stack
- Next.js 16 (App Router), TypeScript (strict), React 19
- Tailwind v4 + shadcn/ui
- Supabase (Postgres + Auth + pgvector + RLS)
- Claude API (pipeline agents, assistant, classifier)
- Gemini API (embeddings)
- StackBlitz SDK (sandboxes)
- next-mdx-remote (content rendering)
- Vercel (hosting + crons)
- Sentry (error tracking)
- Vitest (testing)

## Architecture
- Content model: MDX files in /content/ (4 pillars: pulse, build, learn, system)
- Dynamic data: Supabase (tools, releases, ecosystem, pipeline, users, analytics)
- Route groups: `(marketing)` for public, `(app)` for authenticated, `(public)` for shared profiles
- Multi-agent pipeline: Watcher → Analyst → Writer → Fact-Checker → Publisher
- AI assistant: Gemini embeddings + pgvector RAG + Claude generation
- Public API: /api/v1/* (tools, compare, capabilities, pulse, showcase, stats, benchmarks)
- Auth: Supabase Auth with Google OAuth, callback at /auth/callback
- Middleware: protects app routes, allows marketing and public routes

## Key Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npx vitest run` — run tests
- `npx tsx scripts/seed-tools.ts` — seed AI tool data
- `npx tsx scripts/seed-ecosystem.ts` — seed ecosystem capabilities
- `npx tsx scripts/sync-content-index.ts` — sync MDX frontmatter to Supabase
- `npx tsx scripts/generate-embeddings.ts` — generate Gemini embeddings
- `npx tsx scripts/populate-graph.ts` — populate knowledge graph

## Content System
- MDX files in /content/{pillar}/{type}/{slug}.mdx
- Frontmatter schema: title, slug, pillar, type, format, tools, toolVersions, difficulty, estimatedMinutes, tags, isPremium, isFeatured, status, publishedAt
- Content loader: src/lib/content/loader.ts
- Custom MDX components: Callout, ToolBadge, CodeBlock, AgentReplay, Sandbox, CostTicker

## Database (Supabase)
18 migrations in supabase/migrations/
Key tables: tools, tool_releases, ecosystem_status, pipeline_runs, pipeline_steps, content_index, content_analytics, content_embeddings, knowledge_nodes, knowledge_edges, arena_challenges, arena_entries, arena_votes, showcase_projects, benchmarks, benchmark_results, user_context, bookmarks, platform_costs, profiles

## File Structure
```
src/
  app/
    (marketing)/          # Public: pulse, build, learn, system, tools, compare, showcase, arena, guides, library, pricing, waitlist
    (app)/                # Authenticated: dashboard, skill-tree, profile, build-log, cheat-sheets, admin
    (public)/             # Public user profiles, leaderboard, certificate verify
    auth/callback/        # Supabase OAuth callback
    api/
      v1/                 # Public API: tools, compare, capabilities, pulse, showcase, stats, benchmarks
      cron/               # Scheduled jobs: tool-intelligence, benchmarks, email sequences
      assistant/          # AI assistant endpoint
      arena/              # Arena voting
      stripe/             # Payments (checkout, webhook)
      og/                 # OG image generation
  components/
    layout/               # Nav, sidebar, topbar, footer, theme toggle
    tools/                # Tool cards, comparison UI
    assistant/            # AI assistant chat
    arena/                # Arena challenge UI
    observatory/          # Ecosystem observatory
    content/              # Content rendering
    mdx/                  # Custom MDX component overrides
    dashboard/            # Activity feed, streak calendar, completion ring
    profile/              # Profile form, share buttons
    gamification/         # XP popup, skill tree, reward toasts
    ui/                   # shadcn/ui components
  lib/
    supabase/             # Supabase client (browser + server)
    content/              # Content loader, tier definitions
    intelligence/         # Tool intelligence engine
    assistant/            # RAG + Claude assistant
    graph/                # Knowledge graph
    gamification/         # XP engine, constants
    api/                  # Public API helpers
    actions/              # Server actions
    email/                # Resend email templates
    experiments/          # A/B testing
    personalization/      # User personalization
  types/                  # TypeScript interfaces
  data/                   # Static reference data
scripts/
  seed-tools.ts
  seed-ecosystem.ts
  sync-content-index.ts
  generate-embeddings.ts
  populate-graph.ts
content/                  # MDX content files by pillar
supabase/
  migrations/             # 18 SQL migrations
```

## Environment Variables
Required:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY` (pipeline agents, assistant, classifier)
- `GEMINI_API_KEY` (embeddings)
- `CRON_SECRET` (cron auth)
- `RESEND_API_KEY` (emails)

Optional:
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (payments, currently dormant)
- `GITHUB_TOKEN` (higher GitHub API rate limits)
- `NEXT_PUBLIC_SENTRY_DSN` (error tracking)

## Notion Context
This project is tracked in Notion under Zero to Ship.
- **Zero to Ship page:** `33945c2d-baf4-8154-a09e-f604d9bb8b18`
- **Technical Architecture:** `33945c2d-baf4-814c-822f-fb7bfc54b60a`
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

## Conventions

### Design
- Light theme default, dark equally supported
- Typography: Space Grotesk (display), DM Sans (body), JetBrains Mono (data/code only)
- Animation: GSAP + ScrollTrigger for scroll-driven motion. All motion respects prefers-reduced-motion.
- Monospace for data only — never for brand identity, nav, or labels
- Mobile-first responsive design

### Code
- TypeScript strict, never JavaScript
- Server components by default, `use client` only for interactivity
- MDX for all content, never hardcoded pages
- Tailwind v4 prose classes for content rendering
- Components: PascalCase in feature folders

### Reliability
- Error boundaries wrap all major page sections (see `src/components/error-boundary.tsx`)
- Circuit breakers on all external service calls — use `supabaseBreaker`, `claudeBreaker`, `geminiBreaker` from `src/lib/circuit-breaker.ts`
- All cron jobs wrapped with `withCronMonitoring()` from `src/lib/cron-monitor.ts`
- Rate limiting via `apiLimiter`/`assistantLimiter`/`authLimiter` from `src/lib/rate-limit.ts` (Upstash Redis with in-memory fallback)
- Structured JSON logging via `src/lib/logger.ts` — never raw `console.log` in API routes
- Request tracing via `x-request-id` header set in middleware

### Quality gates
- E2E tests in `e2e/` — Playwright runs against dev server, mobile + desktop projects
- Content validation: `npm run validate-content` runs in CI, fails on bad MDX frontmatter
- Bundle size enforcement: `npm run check-bundle` fails CI if total JS grows >15% from baseline
- Secret leakage audit: `npm run audit-secrets` checks build output for known secret patterns
- Lighthouse CI: 4 pages audited per build, performance/a11y/SEO thresholds enforced

### Documentation
- Operational runbook at `docs/runbook.md` — incident response, scaling, secret rotation
- API documentation at `docs/api/openapi.yaml`, rendered at `/api/docs`
- Performance baselines at `docs/performance/`
- Brand voice at `docs/brand/voice.md`

## Shared Context — home-base
This project is part of a portfolio managed from ~/Projects/home-base.
Before planning features or making architectural decisions, reference:
- `~/Projects/home-base/registry.md` — project registry, status, and cross-project alignment
- `~/Projects/home-base/apis/catalog.md` — curated API catalog
- `~/Projects/home-base/standards/quality.md` — shared quality standards
- `~/Projects/home-base/standards/design-principles.md` — shared design philosophy
- `~/Projects/home-base/standards/design-toolkit.md` — skills, component libraries, and design references
- `~/Projects/home-base/personal/CLAUDE.local.md` — who Ethan is, how he works

When designing UI, consult the design toolkit before building components from scratch.
Use `/brand-guidelines` to auto-apply this project's brand identity.
Use `/frontend-design` for intentional aesthetic direction on new UI work.

## Important Notes
- `.env.local` is gitignored — copy `.env.local.example` and add keys
- `CLAUDE.local.md` is gitignored — personal context
- Email unsubscribe: HMAC-signed tokens via `CRON_SECRET`, `/api/unsubscribe` route (CAN-SPAM compliance)
- Server action input validation: Zod v4 schemas in actions files
- Profile-not-found safety net: auto-recovers missing profiles in app layout, fallback to `/setup-error`
- Sentry for error tracking (`NEXT_PUBLIC_SENTRY_DSN` env var, empty = disabled)
