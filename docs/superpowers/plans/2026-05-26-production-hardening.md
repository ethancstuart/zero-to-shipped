# Production Hardening Sprint — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Prototype Studio from a well-built codebase into a production-hardened system with E2E tests, performance enforcement, security headers, distributed rate limiting, circuit breakers, error boundaries, API documentation, monitoring, content validation, database indexes, load tests, observability, data privacy compliance, and an operational runbook.

**Architecture:** Foundation utilities first (logger, circuit breaker, error boundary) → infrastructure upgrades (Redis, AI limits) → security + monitoring → testing layers (E2E, performance, load) → CI pipeline → documentation (API docs, runbook) → privacy compliance.

**Tech Stack:** Playwright / Lighthouse CI / @next/bundle-analyzer / @upstash/ratelimit + @upstash/redis / k6 / @scalar/nextjs-api-reference / Zod / Sentry / GSAP (existing)

**Spec:** `docs/superpowers/specs/2026-05-26-production-hardening-design.md`

**Repo:** `~/Projects/zero-to-shipped`

---

## File Structure

### New files to create:
```
src/
  lib/
    logger.ts                              # Structured JSON logger
    circuit-breaker.ts                     # Circuit breaker with state machine
    health.ts                              # Service health checks with caching
    cached-query.ts                        # Redis-backed query cache
  components/
    error-boundary.tsx                     # React error boundary with Sentry
    privacy/
      cookie-consent.tsx                   # Cookie consent banner
  app/
    api/
      health/route.ts                      # Health check endpoint
      csp-report/route.ts                  # CSP violation report endpoint
      account/delete/route.ts              # User data deletion endpoint
      docs/route.ts                        # API docs (Scalar)

scripts/
  validate-content.ts                      # Build-time MDX frontmatter validation
  audit-secrets.ts                         # Check build output for leaked secrets
  check-bundle-size.ts                     # Bundle size comparison against baseline
  measure-bundle.ts                        # Generate bundle size baseline

e2e/
  homepage.spec.ts                         # Homepage journey tests
  content-flow.spec.ts                     # Content discovery flow tests
  tools-flow.spec.ts                       # Tools directory + detail tests
  showcase-arena.spec.ts                   # Showcase + arena tests
  auth-flow.spec.ts                        # Auth flow tests (mocked)
  mobile.spec.ts                           # Mobile viewport tests
  dark-mode.spec.ts                        # Dark mode toggle tests
  reduced-motion.spec.ts                   # Reduced motion tests
  accessibility.spec.ts                    # axe-core a11y scans

load-tests/
  scenarios.js                             # k6 load test scenarios
  run.sh                                   # Runner script

docs/
  api/
    openapi.yaml                           # OpenAPI 3.0 spec
  performance/
    bundle-baseline.json                   # Bundle size baseline
    web-vitals-baseline.md                 # Core Web Vitals baseline
    runtime-profile-baseline.md            # Runtime profiling notes
  runbook.md                               # Operational runbook

supabase/
  migrations/
    019_user_ai_usage.sql                  # Per-user AI query limits table
    020_cron_runs.sql                      # Cron monitoring table
    021_performance_indexes.sql            # Index optimization

Config files:
  playwright.config.ts                     # Playwright E2E config
  lighthouserc.js                          # Lighthouse CI config
  .github/dependabot.yml                   # Dependency update config
  .github/workflows/ci.yml                 # Updated CI pipeline (modify)
```

### Files to modify:
```
src/lib/rate-limit.ts                      # Replace with Upstash Redis
src/app/api/assistant/route.ts             # Add per-user limits + circuit breaker
src/app/api/cron/tool-intelligence/route.ts # Add cron monitoring wrapper
src/app/api/cron/benchmarks/route.ts       # Add cron monitoring wrapper
src/app/api/v1/tools/route.ts              # Add CORS + structured logging
src/app/api/v1/* (all endpoints)           # Add CORS headers
src/middleware.ts                          # Add request ID, auth rate limiting
src/app/(marketing)/page.tsx               # Wrap sections in error boundaries
src/app/(marketing)/layout.tsx             # Add cookie consent
src/app/(marketing)/privacy/page.tsx       # Audit + update content
src/app/layout.tsx                         # Add security meta
next.config.ts                             # Add security headers
sentry.server.config.ts                    # Enhanced config
sentry.client.config.ts                    # Enhanced config
package.json                               # New dependencies
.env.local.example                         # New env vars
```

---

## Task 1: Foundation — Logger, Circuit Breaker, Error Boundary

**Files:**
- Create: `src/lib/logger.ts`
- Create: `src/lib/circuit-breaker.ts`
- Create: `src/components/error-boundary.tsx`

- [ ] **Step 1: Create structured logger**

Create `src/lib/logger.ts` — JSON structured logger with levels (info, warn, error), timestamp, and optional context (requestId, userId, route, duration_ms). Uses `console.log` for info/warn, `console.error` for error. Vercel captures JSON stdout as structured logs.

```typescript
interface LogContext {
  requestId?: string
  userId?: string
  route?: string
  duration_ms?: number
  [key: string]: unknown
}

export function log(level: 'info' | 'warn' | 'error', message: string, context?: LogContext) {
  const entry = { level, message, timestamp: new Date().toISOString(), ...context }
  if (level === 'error') console.error(JSON.stringify(entry))
  else console.log(JSON.stringify(entry))
}
```

- [ ] **Step 2: Create circuit breaker**

Create `src/lib/circuit-breaker.ts` — State machine (closed → open → half-open → closed). Tracks consecutive failures per service. Config: failureThreshold (default 3), cooldownMs (default 60000). Exports pre-configured breakers: `supabaseBreaker`, `claudeBreaker`, `geminiBreaker`. The `execute<T>(fn, fallback)` method runs the function, catches errors, tracks state, reports to Sentry, and returns fallback when circuit is open.

Follow the exact class design from the spec (Section: Workstream 5 → Circuit Breaker). Include Sentry.captureException with `{ tags: { circuit: this.name } }`.

- [ ] **Step 3: Create error boundary component**

Create `src/components/error-boundary.tsx` — React class component error boundary. Props: `children`, `fallback?` (ReactNode), `section?` (string for Sentry tag). On error: captures to Sentry with section tag + component stack, renders fallback UI (subtle "Something went wrong" + retry button). Follow the exact implementation from spec Section: Workstream 5 → React Error Boundaries.

- [ ] **Step 4: Write tests for circuit breaker**

Create `src/lib/__tests__/circuit-breaker.test.ts`:
- Closed state: executes function normally
- After N failures: opens circuit, returns fallback
- After cooldown: transitions to half-open
- Half-open success: closes circuit
- Half-open failure: reopens circuit
- Different breaker instances are independent

- [ ] **Step 5: Write tests for logger**

Create `src/lib/__tests__/logger.test.ts`:
- Outputs JSON to console
- Includes timestamp, level, message
- Includes context fields when provided
- Error level uses console.error

- [ ] **Step 6: Verify + commit**

```bash
npm run lint && npx tsc --noEmit && npx vitest run
git add -A && git commit -m "feat: foundation — structured logger, circuit breaker, error boundary"
```

---

## Task 2: Upstash Redis Rate Limiter + Response Caching

**Files:**
- Modify: `package.json` (add @upstash/ratelimit, @upstash/redis)
- Modify: `src/lib/rate-limit.ts` (replace with Upstash)
- Create: `src/lib/cached-query.ts`
- Modify: `.env.local.example` (add Upstash env vars)

- [ ] **Step 1: Install Upstash packages**

```bash
npm install @upstash/ratelimit @upstash/redis
```

- [ ] **Step 2: Rewrite rate-limit.ts**

Read existing `src/lib/rate-limit.ts` (44 lines) first. Replace with Upstash-backed implementation. Three tiers:
- `apiLimiter`: 100 req/hour (public API)
- `assistantLimiter`: 50 req/hour (AI assistant)
- `authLimiter`: 5 req/minute (OAuth)

Graceful fallback: if `UPSTASH_REDIS_REST_URL` not set, use in-memory Map-based limiter (keep existing logic as fallback). Log a warning on first request when falling back.

Follow the code pattern from spec Section: Workstream 4 → Upstash Redis Rate Limiting.

- [ ] **Step 3: Create cached-query utility**

Create `src/lib/cached-query.ts`:

```typescript
import { Redis } from '@upstash/redis'

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

export async function cachedQuery<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  if (!redis) return fetcher()
  try {
    const cached = await redis.get<T>(key)
    if (cached) return cached
  } catch { /* Redis failure, proceed without cache */ }
  const result = await fetcher()
  try { await redis.set(key, result, { ex: ttlSeconds }) } catch { /* ignore */ }
  return result
}
```

- [ ] **Step 4: Update .env.local.example**

Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` with comments explaining they're optional (falls back to in-memory).

- [ ] **Step 5: Write tests for rate limiter**

Create `src/lib/__tests__/rate-limit.test.ts`:
- In-memory fallback works when env vars missing
- Rate limiter returns success/failure object
- Different tiers have different limits

- [ ] **Step 6: Verify + commit**

```bash
npm run lint && npx tsc --noEmit && npx vitest run
git add -A && git commit -m "feat: Upstash Redis rate limiting + response caching with in-memory fallback"
```

---

## Task 3: Per-User AI Query Limits

**Files:**
- Create: `supabase/migrations/019_user_ai_usage.sql`
- Modify: `src/app/api/assistant/route.ts`
- Modify: `src/components/assistant/chat-widget.tsx` (if it exists, or the assistant chat UI)

- [ ] **Step 1: Create migration**

Create `supabase/migrations/019_user_ai_usage.sql` with the `user_ai_usage` table, RLS policies, and unique constraint on (user_id, usage_date). Follow the exact SQL from spec Section: Workstream 4 → Per-User AI Query Limits.

- [ ] **Step 2: Add usage check to assistant endpoint**

Read `src/app/api/assistant/route.ts` (61 lines) first. Add before the Claude API call:
1. Check auth state (authenticated vs anonymous)
2. Authenticated: query `user_ai_usage` for today's count, limit 10/day
3. Anonymous: use Redis key `anon:{ip}:{date}` via rate limiter, limit 5/day
4. If limit reached: return `{ error: "daily_limit_reached", remaining: 0, resetsAt: "midnight UTC" }` with 429 status
5. After successful Claude response: increment the counter (upsert)
6. Include `remaining` count in the response

Also wrap the Claude call with `claudeBreaker.execute()` from the circuit breaker.

- [ ] **Step 3: Update chat widget UI**

Find the assistant chat component (check `src/components/assistant/`). Add:
- Display remaining count: "N of 10 questions remaining" (or "N of 5" for anonymous)
- Warning color at 2 remaining
- Disabled input + message when limit reached

- [ ] **Step 4: Verify + commit**

```bash
npm run lint && npx tsc --noEmit && npm run build
git add -A && git commit -m "feat: per-user AI query limits — 10/day auth, 5/day anon, chat widget counter"
```

---

## Task 4: Security Headers + CSP + CORS + Secret Audit + Dependabot

**Files:**
- Modify: `next.config.ts`
- Create: `src/app/api/csp-report/route.ts`
- Create: `scripts/audit-secrets.ts`
- Create: `.github/dependabot.yml`
- Modify: `src/middleware.ts` (add CORS + auth rate limiting)

- [ ] **Step 1: Add security headers to next.config.ts**

Read existing `next.config.ts` (70 lines). Add `headers()` function returning security headers for all routes `/(.*)*`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 0
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
- Strict-Transport-Security: max-age=31536000; includeSubDomains

Add CSP in **report-only** mode:
- Content-Security-Policy-Report-Only with directives from spec Section: Workstream 3 → Content Security Policy
- report-uri /api/csp-report

- [ ] **Step 2: Create CSP report endpoint**

Create `src/app/api/csp-report/route.ts` — POST handler that receives CSP violation reports, logs via structured logger, and sends to Sentry as a breadcrumb. Rate limit to prevent abuse (100/hr).

- [ ] **Step 3: Add CORS to API routes**

Add CORS middleware for `/api/v1/*` routes. Either:
- In `src/middleware.ts`: detect `/api/v1/` prefix, add CORS headers
- Or create a shared `corsHeaders()` utility imported by each v1 route

Handle OPTIONS preflight. Default same-origin. `CORS_ALLOWED_ORIGINS` env var.

- [ ] **Step 4: Add auth rate limiting to middleware**

In `src/middleware.ts`, add rate limiting on `/auth/callback` using `authLimiter` (5/min per IP). Return 429 if exceeded.

- [ ] **Step 5: Create secret audit script**

Create `scripts/audit-secrets.ts`:
- Run after `npm run build`
- Grep `.next/static/` for patterns: `sk_`, `whsec_`, `sbp_`, `re_`, `SUPABASE_SERVICE_ROLE`, `ANTHROPIC_API_KEY`, `CRON_SECRET`
- Exit 1 if any found, with clear message showing which file and pattern

- [ ] **Step 6: Create Dependabot config**

Create `.github/dependabot.yml` with weekly npm checks and monthly GitHub Actions checks. Assign to ethancstuart. Follow exact config from spec.

- [ ] **Step 7: Write security header tests**

Create `src/__tests__/security.test.ts`:
- Test that next.config.ts headers function returns expected headers
- Test CORS utility returns correct headers for allowed/disallowed origins

- [ ] **Step 8: Verify + commit**

```bash
npm run lint && npx tsc --noEmit && npm run build && npx tsx scripts/audit-secrets.ts
git add -A && git commit -m "feat: security hardening — headers, CSP, CORS, secret audit, Dependabot"
```

---

## Task 5: Health Endpoint + Cron Monitoring + Structured Logging

**Files:**
- Create: `src/lib/health.ts`
- Create: `src/app/api/health/route.ts`
- Create: `supabase/migrations/020_cron_runs.sql`
- Create: `src/lib/cron-monitor.ts`
- Modify: `src/app/api/cron/tool-intelligence/route.ts`
- Modify: `src/app/api/cron/benchmarks/route.ts`
- Modify: `sentry.server.config.ts`
- Modify: `sentry.client.config.ts`

- [ ] **Step 1: Create health check module**

Create `src/lib/health.ts` — exports `checkSupabase()`, `checkEnvVars()`, `checkContent()`. Each returns `{ status: "up" | "down", latency_ms?: number, error?: string }`. Results cached for 60s via simple timestamp check (no Redis needed for health checks).

- [ ] **Step 2: Create health endpoint**

Create `src/app/api/health/route.ts` — GET handler that runs all checks, aggregates status (healthy/degraded/unhealthy), includes circuit breaker states, returns JSON. Follow the exact response format from spec Section: Workstream 8 → Health Endpoint.

- [ ] **Step 3: Create cron monitoring migration**

Create `supabase/migrations/020_cron_runs.sql` with the `cron_runs` table and index. Follow exact SQL from spec Section: Workstream 8 → Cron Monitoring.

- [ ] **Step 4: Create cron monitor wrapper**

Create `src/lib/cron-monitor.ts` — exports `withCronMonitoring(name, fn)` that wraps any cron handler. Inserts a row on start, updates on completion/failure. Captures to Sentry on failure. Follow the exact implementation from spec.

- [ ] **Step 5: Wrap existing crons**

Read `src/app/api/cron/tool-intelligence/route.ts` and `benchmarks/route.ts`. Wrap the main logic of each with `withCronMonitoring()`. Keep existing CRON_SECRET auth check.

- [ ] **Step 6: Enhance Sentry config**

Update `sentry.server.config.ts`:
- Set `tracesSampleRate: 0.1`
- Set `environment: process.env.VERCEL_ENV || 'development'`
- Add `beforeSend` to filter rate limit errors

Update `sentry.client.config.ts`:
- Set `tracesSampleRate: 0.1`
- Set `replaysOnErrorSampleRate: 0.1`

- [ ] **Step 7: Write health endpoint tests**

Create `src/app/api/health/__tests__/health.test.ts`:
- Returns healthy when all checks pass (mock Supabase)
- Returns degraded when non-critical service fails
- Returns unhealthy when Supabase fails
- Includes circuit breaker states

- [ ] **Step 8: Verify + commit**

```bash
npm run lint && npx tsc --noEmit && npx vitest run
git add -A && git commit -m "feat: monitoring — health endpoint, cron monitoring, enhanced Sentry"
```

---

## Task 6: Content Validation

**Files:**
- Create: `scripts/validate-content.ts`

- [ ] **Step 1: Create content validation script**

Create `scripts/validate-content.ts`:
- Walk `content/` directory recursively for `.mdx` files
- Parse frontmatter with `gray-matter`
- Validate against Zod schema (title, slug, pillar, type, format, difficulty, status, publishedAt, estimatedMinutes, tools, tags, isPremium, isFeatured — all required)
- On validation failure: print clear error with filename + missing field, exit 1
- On warning conditions (estimatedMinutes === 0, empty tags): print warning but don't fail
- Report summary: "Validated N files. N errors, N warnings."

Follow the schema from spec Section: Workstream 9.

- [ ] **Step 2: Add npm script**

Add to package.json scripts: `"validate-content": "tsx scripts/validate-content.ts"`

- [ ] **Step 3: Test the script**

```bash
npx tsx scripts/validate-content.ts
```

Should validate all 36 MDX files with 0 errors. Fix any frontmatter issues found.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: build-time content validation with Zod schema"
```

---

## Task 7: Database Index Migration

**Files:**
- Create: `supabase/migrations/021_performance_indexes.sql`

- [ ] **Step 1: Create index migration**

Create `supabase/migrations/021_performance_indexes.sql` with all indexes from spec Section: Workstream 10 → Index Migration. Use `IF NOT EXISTS` on all indexes to be idempotent.

Include indexes for: tools(slug), tool_releases(tool_id, release_date DESC), ecosystem_status(tool_id, capability), ecosystem_status(category), content_index(pillar, status), content_index(is_featured, status) with partial index, content_index(content_type, status), showcase_projects(status) partial, user_ai_usage(user_id, usage_date), cron_runs(cron_name, started_at DESC), progress(user_id, content_slug).

- [ ] **Step 2: Add vector index documentation**

Add a SQL comment block at the top of the migration documenting the vector index evaluation:
```sql
-- Vector index evaluation (2026-05-26):
-- Current: ivfflat with lists=100, 768 dimensions (Gemini embeddings)
-- Current count: 71 embeddings — ivfflat is optimal at this scale
-- Threshold: switch to HNSW at >50K embeddings
-- HNSW command: CREATE INDEX ... USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64)
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: database performance indexes + vector index documentation"
```

---

## Task 8: API Documentation — OpenAPI + Scalar

**Files:**
- Create: `docs/api/openapi.yaml`
- Create: `src/app/api/docs/route.ts`
- Modify: `package.json` (add @scalar/nextjs-api-reference)

- [ ] **Step 1: Install Scalar**

```bash
npm install @scalar/nextjs-api-reference
```

- [ ] **Step 2: Write OpenAPI spec**

Create `docs/api/openapi.yaml` — Full OpenAPI 3.0 spec covering all 12 v1 endpoints. For each endpoint include: summary, parameters, response schema (200, 429, 500), rate limit headers. Define shared schemas: ApiResponse, Tool, ToolRelease, EcosystemCapability, ShowcaseProject, PlatformStats, ContentItem.

Read each existing API route to get the actual response shapes:
- `src/app/api/v1/tools/route.ts`
- `src/app/api/v1/tools/[slug]/route.ts`
- `src/app/api/v1/tools/[slug]/releases/route.ts`
- `src/app/api/v1/compare/route.ts`
- `src/app/api/v1/capabilities/route.ts`
- `src/app/api/v1/pulse/route.ts`
- `src/app/api/v1/pulse/weekly/route.ts`
- `src/app/api/v1/showcase/route.ts`
- `src/app/api/v1/stats/route.ts`
- `src/app/api/v1/benchmarks/route.ts`
- `src/app/api/v1/benchmarks/[slug]/results/route.ts`

Include versioning info: current v1, X-API-Version header, deprecation policy.

- [ ] **Step 3: Create API docs route**

Create `src/app/api/docs/route.ts`:
```typescript
import { ApiReference } from '@scalar/nextjs-api-reference'
import spec from '@/../docs/api/openapi.yaml'

export const GET = ApiReference({ spec: { content: spec } })
```

If YAML import doesn't work in Next.js, read the file at runtime:
```typescript
import { readFileSync } from 'fs'
import { join } from 'path'

const spec = readFileSync(join(process.cwd(), 'docs/api/openapi.yaml'), 'utf8')
```

Or convert to JSON and import directly.

- [ ] **Step 4: Verify docs render**

```bash
npm run dev
# Navigate to http://localhost:3000/api/docs
```

Verify: all 12 endpoints listed, schemas render, try-it-out works for GET endpoints.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: API documentation — OpenAPI 3.0 spec + Scalar renderer"
```

---

## Task 9: Playwright Setup + Homepage E2E Tests

**Files:**
- Modify: `package.json` (add @playwright/test)
- Create: `playwright.config.ts`
- Create: `e2e/homepage.spec.ts`
- Create: `e2e/dark-mode.spec.ts`
- Create: `e2e/reduced-motion.spec.ts`

- [ ] **Step 1: Install Playwright**

```bash
npm init playwright@latest -- --yes --install-deps
```

This creates `playwright.config.ts` and `e2e/` directory. Overwrite the generated config.

- [ ] **Step 2: Configure Playwright**

Write `playwright.config.ts` with: dev server auto-start (`npm run dev`), two projects (Desktop Chrome + iPhone 14), HTML reporter, trace on first retry, screenshot on failure. Follow exact config from spec Section: Workstream 1 → Configuration.

- [ ] **Step 3: Write homepage E2E tests**

Create `e2e/homepage.spec.ts` with 8 tests covering: page load, hero elements, generative mesh (desktop), scroll to pillars, number theater, bento grid, horizontal showcase, gradient break. Each test navigates to `/` and asserts expected elements are visible.

Use Playwright's `page.goto('/')`, `page.locator()`, `expect(locator).toBeVisible()`, `page.evaluate(() => window.scrollTo(...))` patterns.

- [ ] **Step 4: Write dark mode tests**

Create `e2e/dark-mode.spec.ts` — 4 tests: find toggle, click it, verify `.dark` class on html, verify key element computed styles change, toggle back.

- [ ] **Step 5: Write reduced motion tests**

Create `e2e/reduced-motion.spec.ts` — 3 tests: emulate reduced motion via `page.emulateMedia({ reducedMotion: 'reduce' })`, verify all content visible (no opacity:0 elements), verify pinned section not pinned (static grid visible).

- [ ] **Step 6: Run tests**

```bash
npx playwright test
```

All tests should pass. Debug any failures.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: Playwright E2E — homepage, dark mode, reduced motion tests"
```

---

## Task 10: Playwright — Content, Tools, Mobile, Auth, A11y Tests

**Files:**
- Create: `e2e/content-flow.spec.ts`
- Create: `e2e/tools-flow.spec.ts`
- Create: `e2e/showcase-arena.spec.ts`
- Create: `e2e/auth-flow.spec.ts`
- Create: `e2e/mobile.spec.ts`
- Create: `e2e/accessibility.spec.ts`
- Modify: `package.json` (add @axe-core/playwright)

- [ ] **Step 1: Install axe-core**

```bash
npm install -D @axe-core/playwright
```

- [ ] **Step 2: Write content flow tests**

Create `e2e/content-flow.spec.ts` — 10 tests: navigate to /pulse, verify header + filter pills, click filter, verify grid updates, click content card, verify detail page (title, pills, prose), verify ToC sidebar (desktop), verify mobile ToC (mobile project), verify scroll progress, verify back navigation.

- [ ] **Step 3: Write tools flow tests**

Create `e2e/tools-flow.spec.ts` — 6 tests: /tools loads with cards, category filter works, click tool → detail page, tabs switch, releases tab content, capabilities tab content.

- [ ] **Step 4: Write showcase + arena tests**

Create `e2e/showcase-arena.spec.ts` — 4 tests: showcase loads with seeded projects, tool filter works, CTA button visible, arena loads (empty state or challenges).

- [ ] **Step 5: Write auth flow tests**

Create `e2e/auth-flow.spec.ts` — 4 tests: unauthenticated sees "Get started", mock auth cookie → sees "Dashboard", protected route without auth → redirects, protected route with auth → loads.

Mock auth by injecting a Supabase session cookie via `page.context().addCookies()`.

- [ ] **Step 6: Write mobile tests**

Create `e2e/mobile.spec.ts` — 6 tests (run in mobile project only): hamburger visible, tap opens overlay, links navigate, X closes, grids single column, showcase scrollable.

- [ ] **Step 7: Write accessibility tests**

Create `e2e/accessibility.spec.ts` — 5 tests using `@axe-core/playwright`:
```typescript
import AxeBuilder from '@axe-core/playwright'

test('homepage has no a11y violations', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations.filter(v => ['critical', 'serious'].includes(v.impact!))).toHaveLength(0)
})
```

Scan: homepage, /pulse, /learn, /tools, one content detail page.

- [ ] **Step 8: Run all E2E tests**

```bash
npx playwright test
```

Target: ~50 tests, all passing.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: Playwright E2E — content, tools, auth, mobile, accessibility tests"
```

---

## Task 11: Performance — Lighthouse CI + Bundle Analysis

**Files:**
- Modify: `package.json` (add @lhci/cli, @next/bundle-analyzer)
- Create: `lighthouserc.js`
- Create: `scripts/measure-bundle.ts`
- Create: `scripts/check-bundle-size.ts`
- Create: `docs/performance/bundle-baseline.json`
- Create: `docs/performance/web-vitals-baseline.md`

- [ ] **Step 1: Install packages**

```bash
npm install -D @lhci/cli @next/bundle-analyzer
```

- [ ] **Step 2: Configure bundle analyzer**

In `next.config.ts`, wrap the config with bundle analyzer when `ANALYZE=true`:
```typescript
import withBundleAnalyzer from '@next/bundle-analyzer'
const config = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })({
  // existing config
})
```

- [ ] **Step 3: Create Lighthouse CI config**

Create `lighthouserc.js` — test 4 pages (/, /pulse, /learn, /tools), 3 runs each, assert scores from spec. Follow exact config from spec Section: Workstream 2 → Lighthouse CI.

- [ ] **Step 4: Create bundle measurement script**

Create `scripts/measure-bundle.ts` — runs `npm run build`, reads `.next/` output, calculates total JS size, per-route sizes, top 10 largest chunks. Outputs to `docs/performance/bundle-baseline.json`.

- [ ] **Step 5: Create bundle size check script**

Create `scripts/check-bundle-size.ts` — reads current build size, compares to `bundle-baseline.json`, exits 1 if >15% growth.

- [ ] **Step 6: Generate baselines**

```bash
npm run build
npx tsx scripts/measure-bundle.ts
npx lhci autorun
```

Save baseline JSON. Create `docs/performance/web-vitals-baseline.md` with Lighthouse results.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: performance — Lighthouse CI, bundle analysis, baselines"
```

---

## Task 12: CI Pipeline Upgrade

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Rewrite CI workflow**

Replace `.github/workflows/ci.yml` with the 4-job pipeline from spec Section: Workstream 6:
- **quality**: npm ci → npm audit → lint → typecheck → vitest → upload coverage
- **e2e** (needs quality): playwright install → playwright test → upload report
- **performance** (needs quality): build → lhci autorun → check-bundle-size → upload lighthouse
- **content**: validate-content → audit-secrets

Add `concurrency` group to cancel in-progress runs on same branch.

- [ ] **Step 2: Add npm scripts**

Add to package.json:
```json
"validate-content": "tsx scripts/validate-content.ts",
"audit-secrets": "tsx scripts/audit-secrets.ts",
"check-bundle": "tsx scripts/check-bundle-size.ts"
```

- [ ] **Step 3: Verify CI config syntax**

```bash
# Validate YAML syntax
npx yaml-lint .github/workflows/ci.yml || true
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: CI pipeline — 4 parallel jobs (quality, e2e, performance, content)"
```

---

## Task 13: Graceful Degradation Wiring

**Files:**
- Modify: `src/app/api/assistant/route.ts` (circuit breaker already added in Task 3)
- Modify: `src/app/api/cron/tool-intelligence/route.ts` (circuit breaker for Supabase)
- Modify: `src/app/(marketing)/page.tsx` (error boundaries around sections)
- Modify: `src/app/(marketing)/tools/[slug]/page.tsx` (error boundary around tabs)

- [ ] **Step 1: Wire circuit breakers into cron jobs**

In `tool-intelligence/route.ts`: wrap Supabase calls with `supabaseBreaker.execute()`. Fallback: skip the run, log via cron monitor with status "skipped_service_unavailable".

- [ ] **Step 2: Wrap homepage sections in error boundaries**

In `src/app/(marketing)/page.tsx`, wrap each major section with `<ErrorBoundary section="...">`:
- Hero
- StartHereRow
- PinnedPillars
- NumberTheater
- BentoGrid
- GradientBreak
- HorizontalShowcase

A crash in one section doesn't take down the page.

- [ ] **Step 3: Wrap content detail prose in error boundary**

In each `[slug]/page.tsx`, wrap the MDX prose rendering in `<ErrorBoundary section="content-prose">`.

- [ ] **Step 4: Wrap tool detail tabs in error boundary**

In `tools/[slug]/page.tsx` or the tool detail tabs component, wrap the tab content in an error boundary.

- [ ] **Step 5: Verify + commit**

```bash
npm run lint && npx tsc --noEmit && npm run build
git add -A && git commit -m "feat: graceful degradation — circuit breakers wired, error boundaries on all pages"
```

---

## Task 14: Load Testing (k6)

**Files:**
- Create: `load-tests/scenarios.js`
- Create: `load-tests/run.sh`
- Create: `docs/performance/load-test-baseline.md`

- [ ] **Step 1: Create k6 test scenarios**

Create `load-tests/scenarios.js` with 4 scenarios from spec Section: Workstream 11:

1. **normal_traffic** (10 min): 50 VUs, GET homepage → /pulse → /pulse/[slug] → /tools → /tools/[slug], think time 2-5s
2. **peak_traffic** (5 min): ramp 10→100→200 VUs, same flow
3. **assistant_stress** (5 min): 20 VUs, POST /api/assistant
4. **api_burst** (2 min): 100 VUs hitting /api/v1/tools

Each scenario defines thresholds: p95 response time, error rate.

```javascript
import http from 'k6/http'
import { sleep, check } from 'k6'

export const options = {
  scenarios: {
    normal_traffic: {
      executor: 'constant-vus',
      vus: 50,
      duration: '10m',
      exec: 'browseFlow',
    },
    // ... other scenarios
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
}

export function browseFlow() {
  const base = __ENV.BASE_URL || 'http://localhost:3000'
  check(http.get(`${base}/`), { 'homepage 200': (r) => r.status === 200 })
  sleep(Math.random() * 3 + 2)
  check(http.get(`${base}/pulse`), { 'pulse 200': (r) => r.status === 200 })
  sleep(Math.random() * 3 + 2)
  // ... continue flow
}
```

- [ ] **Step 2: Create runner script**

Create `load-tests/run.sh`:
```bash
#!/bin/bash
echo "Starting load test against ${BASE_URL:-http://localhost:3000}"
echo "Make sure k6 is installed: brew install k6"
k6 run load-tests/scenarios.js
```

- [ ] **Step 3: Create baseline document template**

Create `docs/performance/load-test-baseline.md`:
```markdown
# Load Test Baseline

**Date:** (run date)
**Target:** (URL)

## Results

| Scenario | VUs | Duration | p50 | p95 | p99 | Error Rate | Status |
|----------|-----|----------|-----|-----|-----|------------|--------|
| normal_traffic | 50 | 10m | - | - | - | - | pending |
| peak_traffic | 10→200 | 5m | - | - | - | - | pending |
| assistant_stress | 20 | 5m | - | - | - | - | pending |
| api_burst | 100 | 2m | - | - | - | - | pending |

## Bottlenecks Identified
(fill after run)

## Recommendations
(fill after run)
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: k6 load test scenarios + baseline template"
```

Note: Ethan runs the actual load test manually (`brew install k6 && bash load-tests/run.sh`). The results fill in the baseline document.

---

## Task 15: Data Privacy — Cookie Consent + Data Deletion

**Files:**
- Create: `src/components/privacy/cookie-consent.tsx`
- Create: `src/app/api/account/delete/route.ts`
- Modify: `src/app/(marketing)/layout.tsx` (add cookie consent)
- Modify: `src/app/(marketing)/privacy/page.tsx` (audit + update)

- [ ] **Step 1: Create cookie consent banner**

Create `src/components/privacy/cookie-consent.tsx` — Client component. Checks `localStorage` for `ps-cookie-consent`. If not set, shows a minimal bottom bar:
- Text: "This site uses cookies for authentication and analytics."
- Two buttons: "Accept" (sets consent, enables analytics) + "Decline" (sets consent, disables analytics)
- Uses design tokens, rounded corners, subtle border
- Dismissible — once chosen, never shows again

On "Decline": set a flag that the analytics tracker components check before firing events. Don't block auth cookies (they're essential).

- [ ] **Step 2: Add cookie consent to marketing layout**

In `src/app/(marketing)/layout.tsx`, add `<CookieConsent />` at the bottom.

- [ ] **Step 3: Create data deletion endpoint**

Create `src/app/api/account/delete/route.ts`:
- POST, authenticated only (check session)
- Delete from: profiles, progress, bookmarks, user_context, user_ai_usage
- Use service role client for cascading deletes
- Send confirmation email via Resend
- Return `{ success: true, message: "Your data has been deleted." }`
- Log to Sentry as info (not error) for audit trail

- [ ] **Step 4: Audit privacy page**

Read `src/app/(marketing)/privacy/page.tsx` (73 lines). Verify it mentions:
- Data collected: Google OAuth profile, email, browsing analytics, AI conversation content
- Third parties: Supabase, Anthropic (Claude), Google (Gemini), Vercel, Resend, Sentry
- Data retention: state periods
- Deletion rights: reference `/api/account/delete` or contact email
- Cookie policy: essential (auth) vs analytics (optional)

Update any missing sections.

- [ ] **Step 5: Verify + commit**

```bash
npm run lint && npx tsc --noEmit && npm run build
git add -A && git commit -m "feat: data privacy — cookie consent, data deletion endpoint, privacy policy update"
```

---

## Task 16: Observability — Request Tracing + API Logging

**Files:**
- Modify: `src/middleware.ts` (add request ID)
- Modify: `src/app/api/v1/tools/route.ts` (add structured logging — example for pattern)
- Modify: other v1 routes (same pattern)

- [ ] **Step 1: Add request ID to middleware**

In `src/middleware.ts`, generate a UUID for each request and set it as a response header:
```typescript
const requestId = crypto.randomUUID()
response.headers.set('X-Request-Id', requestId)
```

Also set it as a Sentry breadcrumb if Sentry is available.

- [ ] **Step 2: Add structured logging to API routes**

Create a pattern by updating `src/app/api/v1/tools/route.ts`:
```typescript
import { log } from '@/lib/logger'

export async function GET(request: Request) {
  const startTime = Date.now()
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
  
  // ... existing logic ...
  
  log('info', 'API request', {
    requestId,
    route: '/api/v1/tools',
    method: 'GET',
    duration_ms: Date.now() - startTime,
    status: 200,
  })
  
  return response
}
```

Apply the same pattern to all v1 routes. For the assistant endpoint, also log token usage.

- [ ] **Step 3: Add X-API-Version header**

Add `X-API-Version: 1` response header to all `/api/v1/*` responses. Can do this in middleware for the `/api/v1/` prefix.

- [ ] **Step 4: Verify + commit**

```bash
npm run lint && npx tsc --noEmit
git add -A && git commit -m "feat: observability — request tracing, structured API logging, version headers"
```

---

## Task 17: Operational Runbook

**Files:**
- Create: `docs/runbook.md`

- [ ] **Step 1: Write the runbook**

Create `docs/runbook.md` covering all 10 sections from spec Section: Workstream 14:

1. **Architecture overview** — text-based service dependency diagram
2. **Deployment** — auto-deploy, manual rollback, emergency revert, `vercel rollback`
3. **Content management** — add/edit/delete MDX, validate, sync, embed, push
4. **Cron jobs** — table of all crons, schedule, what they do, manual trigger curl commands
5. **AI cost management** — current model, token costs, per-user limits, emergency disable
6. **Secret rotation** — which secrets, where to update, how to verify
7. **Incident response** — 5-check decision tree, escalation path
8. **Service degradation** — what each fallback looks like, how to verify circuit state via /api/health
9. **Database** — backup schedule, PITR, manual pg_dump, migration process
10. **Scaling triggers** — threshold → action → cost table

Include actual URLs: zerotoship.app, Vercel dashboard URL, Supabase dashboard URL, Sentry URL, Anthropic dashboard URL.

Include actual commands: curl for health check, curl for manual cron trigger, pg_dump command template.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "docs: operational runbook — architecture, deployment, incident response, scaling"
```

---

## Task 18: Final Integration + Verification

**Files:**
- Modify: `.env.local.example` (verify all new env vars documented)
- Modify: `CLAUDE.md` (add hardening notes)

- [ ] **Step 1: Update .env.local.example**

Verify all new env vars are documented:
- `UPSTASH_REDIS_REST_URL` (optional, falls back to in-memory)
- `UPSTASH_REDIS_REST_TOKEN` (optional)
- `CORS_ALLOWED_ORIGINS` (optional, comma-separated)
- `DISABLE_ASSISTANT` (optional, set to "true" to emergency-disable)

- [ ] **Step 2: Run full test suite**

```bash
npx vitest run
npx playwright test
npx tsx scripts/validate-content.ts
npx tsx scripts/audit-secrets.ts
npm run lint && npx tsc --noEmit && npm run build
```

All must pass.

- [ ] **Step 3: Update CLAUDE.md**

Add to Conventions:
- "Error boundaries wrap all major page sections"
- "Circuit breakers on all external service calls (Supabase, Claude, Gemini)"
- "Structured JSON logging via src/lib/logger.ts — never raw console.log in API routes"
- "All cron jobs wrapped with withCronMonitoring()"
- "Rate limiting: Upstash Redis when available, in-memory fallback for dev"

- [ ] **Step 4: Final commit**

```bash
git add -A && git commit -m "feat: production hardening complete — integration verified"
```

- [ ] **Step 5: Push**

```bash
git push origin main
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Foundation: logger, circuit breaker, error boundary | lib/logger, lib/circuit-breaker, components/error-boundary |
| 2 | Upstash Redis rate limiter + response caching | lib/rate-limit, lib/cached-query |
| 3 | Per-user AI query limits | migration 019, api/assistant, chat widget |
| 4 | Security: headers, CSP, CORS, secret audit, Dependabot | next.config, middleware, scripts/audit-secrets |
| 5 | Health endpoint + cron monitoring + Sentry | api/health, lib/cron-monitor, migration 020 |
| 6 | Content validation | scripts/validate-content |
| 7 | Database indexes | migration 021 |
| 8 | API documentation: OpenAPI + Scalar | docs/api/openapi.yaml, api/docs |
| 9 | Playwright: homepage, dark mode, reduced motion | e2e/*.spec.ts, playwright.config |
| 10 | Playwright: content, tools, mobile, auth, a11y | e2e/*.spec.ts |
| 11 | Performance: Lighthouse CI + bundle analysis | lighthouserc.js, scripts/measure-bundle |
| 12 | CI pipeline: 4 parallel jobs | .github/workflows/ci.yml |
| 13 | Graceful degradation wiring | page.tsx error boundaries, cron circuit breakers |
| 14 | Load testing: k6 scenarios | load-tests/scenarios.js |
| 15 | Data privacy: cookie consent, data deletion | components/privacy, api/account/delete |
| 16 | Observability: request tracing, API logging | middleware, v1 routes |
| 17 | Operational runbook | docs/runbook.md |
| 18 | Final integration + verification | .env.local.example, CLAUDE.md |

**Estimated total: 18 tasks, ~120 steps**
