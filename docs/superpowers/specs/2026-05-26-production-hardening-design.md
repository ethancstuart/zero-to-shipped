# Prototype Studio — Production Hardening Sprint

**Status:** Approved
**Date:** 2026-05-26
**Scope:** 11 workstreams to harden the codebase for production traffic

## Context

The visual design overhaul is complete (17 tasks, 226 tests, 125 pages, both themes). The code is production-grade but the infrastructure and operational posture need hardening before driving traffic. This sprint addresses: E2E testing, performance, security, infrastructure scaling, graceful degradation, CI pipeline, API documentation, monitoring, content validation, database optimization, and operational runbook.

## Workstream 1: E2E Tests (Playwright)

**Install:** `@playwright/test`

**Test suites (~35 tests):**

**Homepage journey:**
- Page loads, hero visible, `// prototype.studio` comment renders
- Generative mesh canvas exists on desktop viewport (hidden on mobile)
- Word reveal headline contains "Build Real Products."
- Scroll to pinned pillars section — all 4 pillar tabs render
- Number theater stats section renders with correct stat labels
- Bento grid renders 5 tiles
- Horizontal showcase scrollable, 4 cards visible
- Gradient break text visible

**Content flow:**
- Navigate to /pulse hub — header, filter pills, content cards render
- Click a filter pill — grid updates
- Click a content card — detail page loads
- Detail page: title, pills (pillar + type), prose area, ToC sidebar (desktop)
- Scroll progress bar advances as page scrolls
- Mobile: ToC becomes collapsible top bar

**Tools flow:**
- /tools page loads with tool cards
- Category filter works
- Click tool card → detail page with tabs
- Tabs switch content (Overview/Releases/Capabilities)

**Auth flow (mocked):**
- Login button visible when not authenticated
- Dashboard button visible when authenticated (mock session)
- Protected routes redirect to home without auth

**Mobile (375px viewport):**
- Hamburger menu visible, desktop nav hidden
- Tap hamburger → overlay opens with nav links
- Close overlay → returns to page
- All grids stack to 1 column
- Horizontal showcase touch-scrollable

**Dark mode:**
- Toggle theme — body gets .dark class
- Key elements (nav, cards, footer) use dark tokens
- Toggle back — .dark removed

**Reduced motion:**
- With prefers-reduced-motion: reduce — all content visible immediately
- No GSAP animations fire
- Pinned pillars renders as static grid
- Number theater shows final values

**Accessibility (axe-core):**
- Automated a11y scan on: homepage, /pulse, /learn, /tools, one content detail page
- Zero critical violations, zero serious violations

**Config:**
- `playwright.config.ts`: dev server auto-start, parallel execution, HTML report
- Chromium only (add Firefox/WebKit later if needed)
- Timeout: 30s per test

## Workstream 2: Performance Audit

**Lighthouse CI:**
- Install `@lhci/cli`
- Config at `lighthouserc.js`: run against production build
- Assertions: performance ≥ 85, accessibility ≥ 90, best-practices ≥ 90, SEO ≥ 90
- Run in CI after E2E tests pass
- Upload results to temporary public storage (or local JSON)

**Bundle analysis:**
- Install `@next/bundle-analyzer`
- Add `ANALYZE=true npm run build` script
- Commit baseline snapshot to `docs/performance/bundle-baseline.md`
- Document: total JS, per-page JS, largest chunks, GSAP contribution

**Font audit:**
- Verify all 3 fonts (Space Grotesk, DM Sans, JetBrains Mono) use `display: swap`
- Verify `preconnect` headers to Google Fonts (next/font handles this)
- No flash of invisible text (FOIT)

**Core Web Vitals baseline:**
- Document current LCP, CLS, INP from Vercel Speed Insights
- Save to `docs/performance/web-vitals-baseline.md`

## Workstream 3: Security Hardening

**Security headers** in `next.config.ts`:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Content Security Policy:**
- `default-src 'self'`
- `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com` (Vercel Analytics)
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com`
- `connect-src 'self' https://*.supabase.co https://api.anthropic.com wss://*.supabase.co https://va.vercel-scripts.com`
- `font-src 'self'` (next/font self-hosts)
- Report-only mode initially, then enforce after verification

**CORS on API routes:**
- `/api/v1/*` endpoints: Allow `Access-Control-Allow-Origin` from configured domains
- Default: same-origin only
- Add `CORS_ALLOWED_ORIGINS` env var for future API consumers

**npm audit in CI:**
- Add `npm audit --audit-level=high` to CI pipeline
- Fail build on critical or high severity vulnerabilities

**Auth rate limiting:**
- 5 OAuth attempts per IP per minute via Redis rate limiter
- Apply to `/auth/callback` route

**Dependabot:**
- `.github/dependabot.yml`: weekly checks for npm, monthly for GitHub Actions
- Auto-assign PRs to Ethan

## Workstream 4: Infrastructure Upgrades

**Upstash Redis rate limiting:**
- Install `@upstash/ratelimit` and `@upstash/redis`
- Replace `src/lib/rate-limit.ts` with Upstash-backed implementation
- Sliding window algorithm, 100 req/hour for public API, 50 req/hour for assistant
- Graceful fallback: if `UPSTASH_REDIS_REST_URL` not set, use existing in-memory limiter
- Env vars: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

**Supabase connection pooling:**
- Document in runbook: enable PgBouncer in Supabase dashboard
- Add `SUPABASE_DB_POOLER_URL` to `.env.local.example`
- No code change needed — Supabase JS client uses HTTP, not direct connections

**Per-user AI query limits:**
- New Supabase table: `user_ai_usage` (user_id, date, query_count)
- RLS: users can only read/update their own row
- Assistant endpoint: check usage before calling Claude, increment after
- Free tier: 10 queries/day per user, unauthenticated: 5 queries/day per IP
- Chat widget shows: "8 of 10 questions remaining today"
- Limit reached: "You've used your free questions for today. Resets at midnight UTC."

## Workstream 5: Graceful Degradation

**Service health module** at `src/lib/health.ts`:
- `checkSupabase()`: simple query, returns boolean
- `checkClaude()`: lightweight ping, returns boolean
- `checkGemini()`: lightweight ping, returns boolean
- Cache results for 60s to avoid hammering services

**Circuit breaker** at `src/lib/circuit-breaker.ts`:
- Track consecutive failures per service
- After 3 failures: open circuit for 60s, return fallback immediately
- After cooldown: half-open (try one request), close if success
- Per-service: supabase, claude, gemini

**Fallback states:**
- Supabase down → marketing pages serve ISR cache (already works), dynamic pages show "temporarily unavailable" message
- Claude down → assistant shows "The assistant is temporarily unavailable. Browse our content directly." with links to pillar hubs
- Gemini down → skip embedding generation in crons, log warning, continue

**React error boundaries:**
- Wrap each major homepage section (hero, pinned pillars, bento grid, showcase) in an error boundary
- Wrap content detail prose area in an error boundary
- Fallback UI: subtle "Something went wrong" message with link to reload
- Report to Sentry on catch

## Workstream 6: CI Pipeline Upgrade

**Updated GitHub Actions workflow** (`.github/workflows/ci.yml`):

```yaml
jobs:
  lint-and-test:
    steps:
      - npm ci
      - npm audit --audit-level=high
      - npm run lint
      - npx tsc --noEmit
      - npx vitest run
      - npx playwright install --with-deps chromium
      - npx playwright test
      - npx lhci autorun
```

**Bundle size gate:**
- Track total JS bundle size
- Fail CI if JS grows >15% from committed baseline
- Script: `scripts/check-bundle-size.ts`

**Test reporting:**
- Playwright HTML report archived as artifact
- Vitest coverage report (informational, not gated)
- Lighthouse JSON results archived

## Workstream 7: API Documentation

**OpenAPI 3.0 spec** at `docs/api/openapi.yaml`:
- All 12 v1 endpoints documented
- Request parameters, response schemas (JSON Schema)
- Auth requirements (none for public API, Bearer for crons)
- Rate limit headers documented (X-RateLimit-Limit, X-RateLimit-Remaining)
- Error response format documented

**API docs route** at `/api/docs`:
- Serve the OpenAPI spec via Scalar (lightweight, modern Swagger UI alternative)
- Or: static page that renders the YAML

**Endpoints to document:**
- GET /api/v1/tools
- GET /api/v1/tools/[slug]
- GET /api/v1/tools/[slug]/releases
- GET /api/v1/compare
- GET /api/v1/capabilities
- GET /api/v1/pulse
- GET /api/v1/pulse/weekly
- GET /api/v1/showcase
- GET /api/v1/stats
- GET /api/v1/benchmarks
- GET /api/v1/benchmarks/[slug]/results

## Workstream 8: Monitoring & Alerting

**Health endpoint** at `/api/health`:
- Checks: Supabase reachable, required env vars loaded, content loader returns items
- Returns: `{ status: "healthy" | "degraded" | "unhealthy", checks: {...}, uptime: N }`
- Degraded = one non-critical service down. Unhealthy = Supabase down.

**Sentry configuration:**
- Performance monitoring: sample rate 0.1 (10% of requests)
- Alert: p95 response time > 3s on any route
- Alert: >5 unhandled errors in 1 hour
- Alert: any error in cron routes (these should never error)

**Cron monitoring:**
- New table: `cron_runs` (cron_name, started_at, completed_at, status, duration_ms, error_message)
- Each cron writes a row on start and updates on completion
- Query: any cron with `started_at` > 2x its expected interval and no `completed_at` = missed
- Surface in /transparency page or admin dashboard

## Workstream 9: Content Safety Net

**Build-time MDX validation:**
- Zod schema for MDX frontmatter (same as ContentFrontmatter type but as runtime validation)
- Runs during `npm run build` via a custom script or Next.js plugin
- Required fields: title, slug, pillar, type, difficulty, status, publishedAt
- Fail build with clear message: "content/learn/lessons/broken.mdx: missing required field 'pillar'"
- Warn on: estimatedMinutes = 0, missing tags, empty tools array for build/learn content

**Content lint script:**
- `scripts/validate-content.ts` — run standalone or as part of build
- Checks frontmatter schema + warns on quality issues
- Add to CI pipeline

## Workstream 10: Database Hardening

**Index audit — create migration:**
- `tools(slug)` — unique index (likely exists, verify)
- `tool_releases(tool_id, release_date DESC)` — for release timeline queries
- `ecosystem_status(tool_id, capability)` — for capability matrix
- `content_index(pillar, status)` — for pillar hub queries
- `content_index(is_featured, status)` — for homepage "start here" query
- `content_embeddings` — verify ivfflat vs HNSW, document recommendation
- `user_ai_usage(user_id, date)` — for the new AI limits table

**Vector index evaluation:**
- Current: ivfflat with lists=100
- Document: at <10K embeddings, ivfflat is fine. Switch to HNSW at >50K embeddings.
- No action needed now — document the threshold.

**Backup documentation:**
- Document in runbook: Supabase Pro includes daily automatic backups with 7-day retention
- Document point-in-time recovery process
- Document manual pg_dump procedure for ad-hoc backups

## Workstream 11: Operational Runbook

**File:** `docs/runbook.md`

**Sections:**
1. **Architecture overview** — services diagram, what depends on what
2. **Deployment** — auto-deploy on push to main, manual rollback via Vercel dashboard, preview deploys for PRs
3. **Content management** — add MDX file → run `scripts/validate-content.ts` → run `scripts/sync-content-index.ts` → run `scripts/generate-embeddings.ts` → commit + push
4. **Cron jobs** — what each does, expected frequency, how to manually trigger, where to check logs
5. **AI cost management** — current spend, how to check, emergency: set per-user limits lower, disable assistant endpoint
6. **Secret rotation** — update in Vercel env vars → redeploy (auto on next push)
7. **Incident response** — first 5 checks: Vercel status, Supabase status, Sentry errors, /api/health, cron_runs table
8. **Service degradation** — what each fallback looks like, how to verify circuit breaker state
9. **Database** — backup schedule, PITR, manual backup, migration process, rollback
10. **Scaling** — when to upgrade Supabase tier, when to add Redis, cost projection table

## Ethan's Manual Checklist (after autonomous build)

1. Create **Upstash Redis** account at upstash.com → copy REST URL + token → add to Vercel env vars
2. Upgrade **Supabase to Pro** ($25/mo) → enable connection pooling in dashboard
3. Run `npx playwright test` locally to verify E2E suite
4. Review Lighthouse baseline scores → adjust thresholds if needed
5. Verify Sentry alert emails arrive at correct address
6. Run the database index migration: `supabase db push` or apply via dashboard
7. Merge Dependabot config and review first batch of dependency PRs
8. Review CSP in report-only mode → switch to enforce after 1 week of clean reports
