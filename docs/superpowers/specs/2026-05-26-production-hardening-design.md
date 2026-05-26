# Prototype Studio — Production Hardening Sprint

**Status:** Approved
**Date:** 2026-05-26
**Scope:** 14 workstreams to transform a well-built codebase into a production-hardened, observable, secure, and scalable system

## Context

The visual design overhaul shipped 17 tasks across 30+ pages: generative hero, scroll-pinned sections, bento grid, full kinetic motion, both themes, 226 unit/component tests, branded OG images, responsive + accessible. The frontend is done. What's missing is everything that makes the difference between "it works on my machine" and "it runs in production at scale with confidence."

This sprint closes every gap a senior engineering team would flag: end-to-end testing of real user flows, performance baselines with CI enforcement, security posture (CSP, headers, dependency scanning, auth hardening), distributed rate limiting, graceful degradation when services fail, circuit breakers, error boundaries, API documentation consumers can actually use, structured monitoring with alerting, build-time content validation, database index optimization, load testing under simulated traffic, observability with request tracing, and an operational runbook that lets anyone debug a 3am incident.

**Target:** After this sprint, the codebase passes a senior engineering review with zero critical findings.

---

## Workstream 1: E2E Tests (Playwright)

### Why
226 unit/component tests verify code correctness. Zero tests verify that a user can actually scroll the homepage, click a card, read a lesson, and toggle dark mode. The most common production bugs — hydration mismatches, scroll listener conflicts, client/server rendering differences, broken navigation — only surface in real browser tests.

### Framework
Playwright with Chromium. First-class Next.js support, parallel execution, built-in accessibility testing via axe-core, network interception for auth mocking.

### Test Suites (~50 tests)

**Suite 1: Homepage Journey (8 tests)**
- Page loads within 5s, no console errors
- Hero section visible: `// prototype.studio` comment, headline text, two CTA buttons
- Generative mesh canvas element exists at desktop viewport (1280px), hidden at mobile (375px)
- Scroll to pinned pillars: all 4 tab labels visible, detail card renders
- Continue scrolling: pillar tabs cycle (verify at least 2 states activate)
- Number theater: all 5 stat labels present
- Bento grid: 5 tiles render with expected content (Agent Replay, Tool Intelligence, Transparency, Open API, Live Feed)
- Horizontal showcase: 4 cards visible, arrow buttons clickable, track scrolls

**Suite 2: Content Discovery Flow (10 tests)**
- Navigate to /pulse — pillar-tinted header with "Pulse" title, filter pills render
- Click "brief" filter pill — grid shows only briefs (or empty state)
- Click "All" — full grid returns
- Click first content card → navigates to /pulse/[slug]
- Detail page: title (h1), metadata pills (pillar + type + time + difficulty), prose area with `data-prose` attribute
- ToC sidebar visible on desktop (>1024px), hidden on mobile
- Mobile: collapsible "On this page" bar visible, expands on click, collapses after link click
- Scroll progress bar: starts at 0%, advances past 50% when scrolled halfway
- Navigate back to /pulse — page loads without full reload (client navigation)
- Repeat content flow for /learn (verify learning path component renders with numbered modules)

**Suite 3: Tools Flow (6 tests)**
- /tools loads with section header showing tool count
- Category filter pills render, clicking one filters the grid
- Tool cards show: name, category pill, version badge (if available)
- Click tool card → /tools/[slug] detail page
- Detail page: tool header with name + version pill
- Tabs render (Overview/Releases/Capabilities), clicking switches visible content

**Suite 4: Showcase + Arena (4 tests)**
- /showcase loads with "Submit your build" CTA button
- Project cards render (seeded data: Meridian, RidgeCap, NexusWatch, LongTable)
- Tool filter pills work
- /build/arena loads with section header (empty state or challenge cards)

**Suite 5: Auth Flow — Mocked (4 tests)**
- Unauthenticated: "Get started" button visible in nav, no "Dashboard" link
- Mock authenticated session via cookie injection → "Dashboard" link visible, "Get started" hidden
- Navigate to /dashboard without auth → redirects to /
- Navigate to /dashboard with mocked auth → page loads

**Suite 6: Mobile Viewport — 375px (6 tests)**
- Hamburger menu icon visible, desktop nav links hidden
- Tap hamburger → full-screen overlay with staggered links
- Tap a link → navigates and closes overlay
- Tap X → closes overlay without navigation
- All pillar hub grids: 1 column layout
- Content detail page: no sidebar, mobile ToC bar visible

**Suite 7: Dark Mode (4 tests)**
- Find and click theme toggle
- `<html>` element has `class="dark"`
- Nav background uses dark token (check computed style)
- Click toggle again → `dark` class removed
- Cards, footer, hero all switch (spot-check computed background-color on 3 elements)

**Suite 8: Reduced Motion (3 tests)**
- Emulate prefers-reduced-motion: reduce via Playwright
- Homepage: all content visible immediately (no elements at opacity: 0)
- Pinned pillars section: renders as static card grid, not scroll-pinned
- Number theater: shows final values (not scrambled)

**Suite 9: Accessibility — axe-core (5 tests)**
- Homepage: zero critical/serious axe violations
- /pulse hub: zero critical/serious
- /learn hub: zero critical/serious
- /tools directory: zero critical/serious
- One content detail page: zero critical/serious
- Each test injects `@axe-core/playwright`, runs `checkA11y()`, reports violations

### Configuration

```typescript
// playwright.config.ts
{
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html', { open: 'never' }], ['github']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
}
```

Two projects: desktop Chrome + iPhone 14 viewport. Mobile-specific tests run in the mobile project. Desktop tests run in chromium.

### Visual Regression (optional but impressive)
- Playwright `toHaveScreenshot()` for key pages: homepage hero, one pillar hub, one content detail
- Baseline screenshots committed to repo
- CI fails if pixel diff > 1% (catches unintended visual changes)
- Stored in `e2e/__screenshots__/`

---

## Workstream 2: Performance Audit & Enforcement

### Why
GSAP + Canvas + scroll listeners + IntersectionObservers is a lot of client-side JS. Nobody has measured whether the hero mesh causes jank on mid-range devices, whether the bundle is bloated, or whether the font loading strategy actually prevents FOIT. Performance must be measured, baselined, and enforced in CI.

### Lighthouse CI

**Install:** `@lhci/cli`

**Config** (`lighthouserc.js`):
```javascript
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/pulse',
        'http://localhost:3000/learn',
        'http://localhost:3000/tools',
      ],
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Ready in',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.80 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.90 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
}
```

Tests 4 representative pages, 3 runs each (median), gates on all 4 categories + specific CWV metrics.

### Bundle Analysis

**Install:** `@next/bundle-analyzer`

**Setup:**
- `ANALYZE=true npm run build` opens visual treemap
- Script `scripts/measure-bundle.ts`: runs build, parses `.next/analyze/`, outputs JSON with total JS, per-route JS, top 10 largest modules
- Baseline committed to `docs/performance/bundle-baseline.json`
- CI script: compare current build against baseline, fail if total JS grows >15%

**What to measure and document:**
- Total first-load JS (all pages combined shared chunks)
- Per-page JS: homepage, /pulse, /learn, /tools, content detail
- GSAP contribution: ScrollTrigger size, tree-shaking effectiveness
- Largest non-framework chunks
- next/font bundle impact (should be ~0, fonts are preloaded)

### Font Loading Audit

Verify:
- All 3 fonts use `display: swap` (next/font sets this by default — confirm in HTML output)
- Fonts are self-hosted by Next.js (not loaded from Google's CDN at runtime)
- No FOIT: text is visible within 100ms with system fallback, then swaps
- `<link rel="preconnect">` headers not needed (self-hosted)
- Measure: font file sizes, total font weight in KB

### Runtime Performance Profiling

- Document: run Chrome DevTools Performance tab on homepage
- Record a full scroll from hero → footer
- Baseline metrics: scripting time, rendering time, painting time, total frames, dropped frames
- Flag if: GenerativeMesh RAF loop >2ms per frame, GSAP scroll handlers >1ms per event, any layout thrashing
- Save as `docs/performance/runtime-profile-baseline.md`

### Core Web Vitals Baseline

- Pull current data from Vercel Speed Insights (if available) or measure via Lighthouse
- Document: LCP, CLS, INP for homepage + one content page
- Set targets: LCP < 2.5s, CLS < 0.1, INP < 200ms
- Save as `docs/performance/web-vitals-baseline.md`

---

## Workstream 3: Security Hardening

### Why
The site accepts user input (OAuth, showcase submissions, AI assistant queries), serves user-generated content (MDX with code blocks), and calls external APIs with secrets. A single XSS vector in the assistant chat or a leaked API key in a client bundle would be a real incident.

### Security Headers

In `next.config.ts` → `headers()`:

```typescript
{
  source: '/(.*)',
  headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-XSS-Protection', value: '0' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  ],
}
```

### Content Security Policy

Phase 1 — Report-only (week 1):
```
Content-Security-Policy-Report-Only:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://generativelanguage.googleapis.com https://va.vercel-scripts.com;
  font-src 'self';
  frame-src 'self' https://stackblitz.com;
  report-uri /api/csp-report;
```

Phase 2 — Enforce (after clean report-only period):
- Remove `Report-Only`, switch to `Content-Security-Policy`
- Evaluate removing `unsafe-inline` for scripts (requires nonce strategy)

**CSP report endpoint** at `/api/csp-report`:
- Receives violation reports, logs to Sentry
- Helps identify what breaks before enforcing

### CORS on API Routes

Middleware-level CORS for `/api/v1/*`:
```typescript
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || []

function corsHeaders(origin: string | null) {
  const isAllowed = !origin || origin === siteConfig.url || allowedOrigins.includes(origin)
  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || siteConfig.url) : '',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}
```

Handle OPTIONS preflight requests. Default: same-origin only. `CORS_ALLOWED_ORIGINS` env var for future consumers.

### Dependency Security

**npm audit in CI:**
- `npm audit --audit-level=high` → fail on critical/high
- Run before build step (fast, catches known vulns early)

**Dependabot** (`.github/dependabot.yml`):
```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
      day: monday
    open-pull-requests-limit: 5
    assignees:
      - ethancstuart
    labels:
      - dependencies
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: monthly
    assignees:
      - ethancstuart
```

### Auth Hardening

- Rate limit OAuth callback: 5 attempts per IP per minute (via Redis rate limiter)
- Rate limit the waitlist/email capture endpoint: 3 per IP per minute
- Verify Supabase Auth cookies use: `httpOnly: true`, `secure: true`, `sameSite: lax`
- Audit: no user tokens or session data exposed in client-side JavaScript
- Verify: PKCE flow is used for OAuth (Supabase SSR default)

### Secret Audit

- Verify: no `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `CRON_SECRET`, or `RESEND_API_KEY` are exposed in client bundles
- Script: `scripts/audit-secrets.ts` — grep the `.next/static/` build output for known env var patterns
- Add to CI pipeline

---

## Workstream 4: Infrastructure Upgrades

### Why
The in-memory rate limiter resets on every Vercel cold start. The AI assistant has no usage limits — one user could burn $50/day in Claude API calls. These are the two things that will cause the first real production incident.

### Upstash Redis Rate Limiting

**Install:** `@upstash/ratelimit`, `@upstash/redis`

**Replace** `src/lib/rate-limit.ts`:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function createRateLimiter(limit: number, window: string) {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    // Fallback to in-memory for local dev
    return createInMemoryLimiter(limit, window)
  }
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
  })
}

export const apiLimiter = createRateLimiter(100, '1 h')
export const assistantLimiter = createRateLimiter(50, '1 h')
export const authLimiter = createRateLimiter(5, '1 m')
```

Three tiers: public API (100/hr), assistant (50/hr), auth (5/min).

**Env vars:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

**Graceful fallback:** Missing env vars → in-memory limiter (dev mode). Log a warning on first request.

### Supabase Connection Pooling

- Document: enable PgBouncer in Supabase dashboard → Settings → Database → Connection Pooling
- Add `SUPABASE_DB_POOLER_URL` to `.env.local.example`
- Supabase JS client uses HTTP (PostgREST), not direct Postgres connections — pooling applies to direct DB access only
- Relevant for: server actions that use `supabase.rpc()`, cron jobs with heavy queries

### Per-User AI Query Limits

**New migration** (`supabase/migrations/019_user_ai_usage.sql`):
```sql
CREATE TABLE user_ai_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  query_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, usage_date)
);

ALTER TABLE user_ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage" ON user_ai_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON user_ai_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all" ON user_ai_usage
  FOR ALL USING (auth.role() = 'service_role');
```

**Assistant endpoint changes:**
1. Before calling Claude: check `user_ai_usage` for today's count
2. Authenticated users: 10 queries/day
3. Unauthenticated: 5 queries/day per IP (tracked via Redis key `anon:{ip}:{date}`)
4. If limit reached: return `{ error: "daily_limit_reached", remaining: 0, resetsAt: "midnight UTC" }`
5. After successful response: increment count

**Chat widget UI changes:**
- Show remaining count: "8 of 10 questions remaining"
- At 2 remaining: show warning color
- At 0: disable input, show message: "You've used your free questions today. Resets at midnight UTC."

### Response Caching (Redis)

When Upstash Redis is available, cache expensive queries:
- `/api/v1/tools` response: cache 5 minutes
- `/api/v1/stats` response: cache 15 minutes
- `/api/v1/compare` response: cache 10 minutes
- Tool detail pages: cache capability matrix query 10 minutes
- Assistant: do NOT cache (responses are personalized)

Pattern:
```typescript
async function cachedQuery<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  if (!redis) return fetcher()
  const cached = await redis.get<T>(key)
  if (cached) return cached
  const result = await fetcher()
  await redis.set(key, result, { ex: ttlSeconds })
  return result
}
```

---

## Workstream 5: Graceful Degradation

### Why
Right now, if Supabase has a 30-second blip, every dynamic page returns a 500. If Anthropic rate-limits the assistant, users get an unhandled error. If Gemini's embedding API changes, the cron job crashes silently. Production systems fail gracefully — they show degraded UI, not error pages.

### Circuit Breaker

`src/lib/circuit-breaker.ts`:

```typescript
type CircuitState = 'closed' | 'open' | 'half-open'

interface CircuitBreakerConfig {
  failureThreshold: number  // consecutive failures before opening
  cooldownMs: number        // time in open state before trying again
  name: string
}

class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failures = 0
  private lastFailureTime = 0
  private name: string

  constructor(config: CircuitBreakerConfig)

  async execute<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.cooldownMs) {
        this.state = 'half-open'
      } else {
        return fallback()
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      Sentry.captureException(error, { tags: { circuit: this.name } })
      return fallback()
    }
  }
}

export const supabaseBreaker = new CircuitBreaker({ name: 'supabase', failureThreshold: 3, cooldownMs: 60_000 })
export const claudeBreaker = new CircuitBreaker({ name: 'claude', failureThreshold: 3, cooldownMs: 60_000 })
export const geminiBreaker = new CircuitBreaker({ name: 'gemini', failureThreshold: 5, cooldownMs: 120_000 })
```

### Fallback States

| Service | Failure mode | Fallback behavior |
|---------|-------------|-------------------|
| Supabase | Connection timeout / 500 | Marketing pages: serve ISR cache (already works). Dynamic pages (dashboard, tools query): show "Data temporarily unavailable" banner with retry button. API endpoints: return `{ error: "service_unavailable", retryAfter: 60 }` with 503 status. |
| Claude API | Rate limit / timeout / 500 | Assistant: "I'm temporarily unavailable. Browse our content directly:" + links to all 4 pillar hubs. Cron pipeline: skip the run, log to `cron_runs` with status "skipped_service_unavailable". |
| Gemini API | Rate limit / timeout | Embedding generation: skip, log warning. RAG search: fall back to keyword search against `content_index` table instead of vector similarity. |

### React Error Boundaries

`src/components/error-boundary.tsx`:

```typescript
'use client'

import { Component, type ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  section?: string
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      tags: { section: this.props.section },
      contexts: { react: { componentStack: errorInfo.componentStack } },
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-[hsl(var(--fg-muted))]">
            Something went wrong loading this section.
            <button onClick={() => this.setState({ hasError: false })}
              className="ml-2 underline hover:text-[hsl(var(--fg))]">
              Try again
            </button>
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
```

**Wrap these sections:**
- Homepage: each of the 8 sections individually (hero, start-here, pillars, stats, bento, gradient, showcase)
- Content detail: prose area
- Tools detail: tab content area
- Dashboard: activity feed, streak calendar
- Any component that fetches data client-side

A crash in the bento grid doesn't take down the hero. A crash in the assistant doesn't take down the page.

---

## Workstream 6: CI Pipeline Upgrade

### Why
The current CI runs lint + typecheck only. A broken E2E flow, a performance regression, a critical npm vulnerability, or a bundle size explosion all deploy to production uncaught.

### Updated Workflow

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Lint, Type Check & Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm audit --audit-level=high
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npx vitest run --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  performance:
    name: Lighthouse & Bundle
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npx lhci autorun
      - run: npx tsx scripts/check-bundle-size.ts
      - uses: actions/upload-artifact@v4
        with:
          name: lighthouse
          path: .lighthouseci/

  content:
    name: Content Validation
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx tsx scripts/validate-content.ts
      - run: npx tsx scripts/audit-secrets.ts
```

**4 parallel jobs:** quality (lint + typecheck + unit tests), E2E (Playwright), performance (Lighthouse + bundle), content (MDX validation + secret audit). E2E and performance wait for quality to pass. Content runs independently.

### Branch Protection

Document (for Ethan to enable in GitHub settings):
- Require status checks: quality, e2e, performance, content
- Require up-to-date branches before merging
- No direct pushes to main (use PRs)

### Bundle Size Gate

`scripts/check-bundle-size.ts`:
- Parse `.next/analyze/` output or measure `.next/static/chunks/` total size
- Compare against baseline in `docs/performance/bundle-baseline.json`
- Exit 1 if total JS > baseline * 1.15 (15% growth)
- Print clear message: "Bundle grew from 245KB to 312KB (+27%). Baseline: docs/performance/bundle-baseline.json"

---

## Workstream 7: API Documentation

### Why
12 public endpoints with zero documentation. If someone wants to build on the Prototype Studio API — or if Ethan wants to reference it in 6 months — there's nothing to read. An OpenAPI spec makes the API discoverable, testable, and integration-ready.

### OpenAPI 3.0 Spec

`docs/api/openapi.yaml`:

Full spec covering all 12 endpoints. For each endpoint:
- Summary and description
- Parameters (query params, path params)
- Request body (where applicable)
- Response schema (200, 400, 401, 429, 500)
- Rate limit headers
- Example responses

**Shared schemas:**
```yaml
components:
  schemas:
    ApiResponse:
      type: object
      properties:
        data: {}
        meta:
          type: object
          properties:
            count: { type: integer }
            page: { type: integer }
            limit: { type: integer }
        error: { type: string, nullable: true }

    Tool:
      type: object
      properties:
        id: { type: string, format: uuid }
        name: { type: string }
        slug: { type: string }
        category: { type: string }
        current_version: { type: string, nullable: true }
        description: { type: string, nullable: true }
        logo_url: { type: string, nullable: true }
        website: { type: string, nullable: true }

    RateLimitHeaders:
      headers:
        X-RateLimit-Limit: { schema: { type: integer } }
        X-RateLimit-Remaining: { schema: { type: integer } }
        X-RateLimit-Reset: { schema: { type: integer } }
```

### API Docs Route

`/api/docs` page that renders the OpenAPI spec via **Scalar** (modern, lightweight, better DX than Swagger UI):
- Install `@scalar/nextjs-api-reference`
- Single route that serves the rendered docs
- Dark/light mode support (matches site theme)
- Try-it-out functionality for GET endpoints

### API Versioning Strategy

Document in the spec:
- Current: v1 (all endpoints under `/api/v1/`)
- Deprecation policy: v1 remains stable for 12 months after v2 ships
- Breaking changes only in new major versions
- Non-breaking additions (new fields, new endpoints) are added to current version
- `X-API-Version: 1` response header on all responses

---

## Workstream 8: Monitoring & Alerting

### Why
The site is live with zero observability beyond Sentry error capture and Vercel Analytics. If a cron job silently fails, if response times degrade, if error rates spike — nobody knows until a user complains.

### Health Endpoint

`/api/health`:

```typescript
{
  status: "healthy" | "degraded" | "unhealthy",
  timestamp: "2026-05-26T12:00:00Z",
  uptime: 3600,
  version: "1.0.0",
  checks: {
    supabase: { status: "up", latency_ms: 42 },
    content: { status: "up", count: 36 },
    env: { status: "up", missing: [] },
  },
  circuits: {
    supabase: "closed",
    claude: "closed",
    gemini: "closed",
  }
}
```

- `healthy`: all checks pass, all circuits closed
- `degraded`: one non-critical check fails (Claude, Gemini) or circuit open
- `unhealthy`: Supabase down or critical env vars missing
- Latency measured on each check
- Circuit breaker states exposed

### Sentry Configuration

```typescript
// sentry.server.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  environment: process.env.VERCEL_ENV || 'development',
  beforeSend(event) {
    // Don't send rate limit errors as incidents
    if (event.exception?.values?.[0]?.value?.includes('rate limit')) return null
    return event
  },
})
```

**Alert rules (configure in Sentry dashboard):**
- p95 response time > 3s on any route → alert
- \>5 unhandled errors in 1 hour → alert
- Any error in `/api/cron/*` routes → alert immediately (these should never error)
- New error type seen for first time → notify (helps catch new issues early)
- Error rate > 1% of requests → critical alert

### Cron Monitoring

**New migration** (`supabase/migrations/020_cron_runs.sql`):
```sql
CREATE TABLE cron_runs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cron_name text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  duration_ms integer,
  items_processed integer DEFAULT 0,
  error_message text,
  metadata jsonb DEFAULT '{}'
);

CREATE INDEX idx_cron_runs_name_started ON cron_runs(cron_name, started_at DESC);
```

**Cron wrapper utility:**
```typescript
async function withCronMonitoring(name: string, fn: () => Promise<void>) {
  const run = await supabase.from('cron_runs').insert({ cron_name: name }).select().single()
  const startTime = Date.now()
  try {
    await fn()
    await supabase.from('cron_runs').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
    }).eq('id', run.data.id)
  } catch (error) {
    await supabase.from('cron_runs').update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      error_message: error instanceof Error ? error.message : String(error),
    }).eq('id', run.data.id)
    Sentry.captureException(error, { tags: { cron: name } })
    throw error
  }
}
```

Wrap both active crons (tool-intelligence, benchmarks) with this utility.

### Structured Logging

`src/lib/logger.ts`:
```typescript
interface LogContext {
  requestId?: string
  userId?: string
  route?: string
  [key: string]: unknown
}

export function log(level: 'info' | 'warn' | 'error', message: string, context?: LogContext) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  }
  if (level === 'error') {
    console.error(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }
}
```

Structured JSON logs that Vercel captures and makes searchable. Replace ad-hoc `console.log` calls in API routes with structured `log()` calls. Include requestId for correlation.

---

## Workstream 9: Content Safety Net

### Why
A missing `pillar` field in MDX frontmatter deploys successfully and crashes at runtime when a user visits the page. This is a preventable production incident.

### Build-Time Validation

`scripts/validate-content.ts`:

```typescript
import { z } from 'zod'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const FrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  pillar: z.enum(['pulse', 'build', 'learn', 'system']),
  type: z.enum(['brief', 'comparison', 'release', 'session', 'challenge', 'walkthrough', 'lesson', 'guide', 'resource', 'pattern', 'playbook', 'persona', 'starter']),
  format: z.enum(['video', 'written', 'interactive', 'config']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  status: z.enum(['draft', 'published', 'archived']),
  publishedAt: z.string().min(1),
  estimatedMinutes: z.number().min(0),
  tools: z.array(z.string()),
  tags: z.array(z.string()),
  isPremium: z.boolean(),
  isFeatured: z.boolean(),
})

// Walk content/ directory, parse each .mdx file, validate against schema
// Exit 1 with clear error messages on validation failure
// Warn on: estimatedMinutes === 0, empty tags, empty tools for build/learn content
```

Run in CI as part of the content validation job. Run locally via `npm run validate-content`.

### Content Preview

For future: when editing MDX, ability to preview before deploying. Document the process:
1. Edit MDX file locally
2. Run `npm run dev` → navigate to the content page
3. Verify rendering, frontmatter, MDX components
4. Run `npm run validate-content` → catch schema issues
5. Commit + push → preview deploy on Vercel

---

## Workstream 10: Database Hardening

### Why
No index audit has been done. Common queries (tools by slug, content by pillar, releases by date) may be doing full table scans. At 1000 users, these add up.

### Index Migration

`supabase/migrations/021_performance_indexes.sql`:

```sql
-- Tools
CREATE UNIQUE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);

-- Tool releases (timeline query)
CREATE INDEX IF NOT EXISTS idx_tool_releases_tool_date ON tool_releases(tool_id, release_date DESC);

-- Ecosystem status (capability matrix)
CREATE INDEX IF NOT EXISTS idx_ecosystem_status_tool_cap ON ecosystem_status(tool_id, capability);
CREATE INDEX IF NOT EXISTS idx_ecosystem_status_category ON ecosystem_status(category);

-- Content index (pillar hub queries)
CREATE INDEX IF NOT EXISTS idx_content_index_pillar_status ON content_index(pillar, status);
CREATE INDEX IF NOT EXISTS idx_content_index_featured ON content_index(is_featured, status) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_content_index_type ON content_index(content_type, status);

-- Content embeddings (vector search)
-- Verify existing ivfflat index. Document: switch to HNSW at >50K embeddings.

-- Showcase (gallery queries)
CREATE INDEX IF NOT EXISTS idx_showcase_status ON showcase_projects(status) WHERE status = 'published';

-- User AI usage (daily limit checks)
CREATE INDEX IF NOT EXISTS idx_user_ai_usage_lookup ON user_ai_usage(user_id, usage_date);

-- Cron runs (monitoring queries)
CREATE INDEX IF NOT EXISTS idx_cron_runs_lookup ON cron_runs(cron_name, started_at DESC);

-- Progress (user activity)
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id, content_slug);
```

### Vector Index Documentation

Current state: ivfflat with lists=100, 768 dimensions (Gemini embeddings).

- At <10K embeddings: ivfflat is optimal. Query time ~5ms.
- At 10K-50K: ivfflat still works but rebuild periodically (`REINDEX INDEX idx_content_embeddings`)
- At >50K: switch to HNSW (`CREATE INDEX ... USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64)`)
- Current count: 71 embeddings. No action needed. Document the threshold.

### Backup Documentation

Include in runbook:
- Supabase Pro: automatic daily backups, 7-day retention
- Point-in-time recovery: available through Supabase dashboard
- Manual backup: `pg_dump` via connection string (document exact command)
- Migration rollback: keep rollback SQL for each migration

---

## Workstream 11: Load Testing

### Why
The infrastructure audit identified theoretical limits (500 users, 1000 users). Nobody has verified these. A 15-minute load test with simulated traffic answers: what actually breaks first?

### Framework
**k6** (Grafana) — lightweight, scriptable, runs locally or in CI.

### Test Scenarios

`load-tests/scenarios.js`:

**Scenario 1: Normal traffic (10 min)**
- 50 virtual users
- Each: GET homepage → GET /pulse → GET /pulse/[slug] → GET /tools → GET /tools/[slug]
- Think time: 2-5s between requests
- Success criteria: p95 < 2s, error rate < 1%

**Scenario 2: Peak traffic (5 min)**
- Ramp: 10 → 100 → 200 virtual users over 5 min
- Same flow as scenario 1
- Success criteria: p95 < 5s, error rate < 5%, no 500s

**Scenario 3: Assistant stress (5 min)**
- 20 virtual users
- Each: POST /api/assistant with a question, wait for response
- Success criteria: p95 < 10s (Claude response time), rate limiter kicks in correctly

**Scenario 4: API burst (2 min)**
- 100 virtual users hitting /api/v1/tools simultaneously
- Success criteria: rate limiter correctly returns 429 after limit, no 500s

### Baseline Document

After running: `docs/performance/load-test-baseline.md`
- Requests/second sustained
- p50, p95, p99 response times per endpoint
- Error rate
- First bottleneck identified
- Recommendations

---

## Workstream 12: Observability

### Why
When something goes wrong at 2am, structured logs with correlation IDs are the difference between 10 minutes to diagnose and 2 hours of grepping.

### Request Tracing

Middleware-level request ID generation:

```typescript
// In middleware.ts or a wrapper
const requestId = crypto.randomUUID()
response.headers.set('X-Request-Id', requestId)
```

Pass `requestId` through to:
- All `log()` calls in that request's API handler
- Sentry breadcrumbs
- Supabase queries (as a comment or metadata)

### Structured Log Format

Every log entry:
```json
{
  "level": "info",
  "message": "Assistant query processed",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "requestId": "abc-123",
  "userId": "user-456",
  "route": "/api/assistant",
  "duration_ms": 2340,
  "tokensUsed": 1500,
  "cached": false
}
```

Vercel captures `stdout` as structured logs when JSON is detected. These become searchable in the Vercel dashboard.

### API Request Logging

Wrap all `/api/v1/*` handlers:
```typescript
log('info', 'API request', {
  requestId,
  route: '/api/v1/tools',
  method: 'GET',
  params: { category: 'ide' },
  duration_ms: 45,
  status: 200,
  rateLimit: { remaining: 95, limit: 100 },
})
```

---

## Workstream 13: Data Privacy & Compliance

### Why
The site collects: email addresses (waitlist, toolkit subscribe), Google OAuth profiles, user browsing behavior (analytics), AI conversation content. GDPR and CCPA require: ability to delete user data, clear privacy policy, cookie consent.

### Cookie Consent Audit

- Verify the cookie consent component exists and renders (check for existing implementation)
- Required cookies (auth session): exempt from consent
- Analytics cookies (Vercel): require consent
- If no cookie consent banner exists: create one using the design system (minimal, bottom bar)

### Data Deletion Capability

`/api/account/delete` endpoint:
- Authenticated only
- Deletes: profile, progress, bookmarks, user_context, user_ai_usage, content_embeddings (if user-specific)
- Cascading delete via foreign keys where possible
- Returns confirmation
- Sends confirmation email via Resend

### Privacy Policy Accuracy

Audit `src/app/(marketing)/privacy/page.tsx`:
- Verify it mentions all data collected (OAuth profile, email, browsing analytics, AI conversations)
- Verify it mentions all third parties (Supabase, Anthropic, Google/Gemini, Vercel, Resend, Sentry)
- Verify data retention periods are stated
- Verify deletion rights are documented

---

## Workstream 14: Operational Runbook

### Why
If Ethan is on vacation and the site goes down, there should be a document that tells anyone how to diagnose, mitigate, and resolve. This is also a forcing function to think through every failure mode.

### Document: `docs/runbook.md`

**1. Architecture Overview**
- Service dependency diagram (text-based): Browser → Vercel → Supabase / Claude API / Gemini API / Resend
- What each service does, which pages depend on it
- Single points of failure: Supabase (everything), Vercel (hosting)

**2. Deployment**
- Auto-deploy on push to main via Vercel GitHub integration
- Preview deploys on PRs (automatic)
- Manual rollback: Vercel dashboard → Deployments → click prior deployment → Promote to Production
- Emergency: revert commit + push to main
- Instant rollback: `vercel rollback` CLI command

**3. Content Management**
- Add content: create MDX file → validate → sync index → generate embeddings → commit + push
- Edit content: modify MDX → push (ISR revalidates within 15-60 min depending on pillar)
- Delete content: remove file, run sync script, push
- Scripts: `validate-content.ts`, `sync-content-index.ts`, `generate-embeddings.ts`

**4. Cron Jobs**
| Cron | Schedule | What it does | Where to check |
|------|----------|-------------|----------------|
| tool-intelligence | Every 6 hours | Fetches tool releases, updates DB | `cron_runs` table, Vercel function logs |
| benchmarks | Weekly (Sunday) | Evaluates tool capabilities | `cron_runs` table, Vercel function logs |

How to manually trigger: `curl -H "Authorization: Bearer $CRON_SECRET" https://zerotoship.app/api/cron/tool-intelligence`

**5. AI Cost Management**
- Current monthly projection: check Anthropic dashboard
- Per-user limits: configured in assistant endpoint (10/day auth, 5/day anon)
- Emergency cost reduction: lower per-user limit, disable assistant endpoint (set `DISABLE_ASSISTANT=true` env var)
- Claude API pricing: document current model + token costs

**6. Secret Rotation**
- Update in Vercel dashboard → Environment Variables
- Redeploy (automatic on next push, or trigger manual deploy)
- Secrets: SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY, CRON_SECRET, RESEND_API_KEY, UPSTASH_REDIS_REST_TOKEN

**7. Incident Response**
First 5 checks when something breaks:
1. Vercel status page (vercel.com/status)
2. Supabase status page (status.supabase.com)
3. `/api/health` endpoint response
4. Sentry dashboard for recent errors
5. `cron_runs` table for missed/failed crons

Decision tree:
- All external services up + errors in Sentry → code bug → rollback latest deploy
- Supabase down → nothing to do, wait for recovery, ISR cache serves marketing pages
- Claude down → assistant unavailable (circuit breaker handles), site otherwise works
- High error rate on specific route → check Sentry for stack trace → fix or rollback

**8. Service Degradation**
- Circuit breaker states: check via `/api/health` → `circuits` object
- Manually reset a circuit: restart the Vercel function (redeploy)
- Degraded UI: what users see when each service is down (document each fallback)

**9. Database**
- Backups: Supabase Pro = daily automatic, 7-day retention
- Point-in-time recovery: Supabase dashboard → Database → Backups
- Manual backup: `pg_dump` command with connection string
- Migration: apply via `supabase db push` or SQL editor in dashboard
- Rollback: each migration should have a rollback strategy documented inline

**10. Scaling Triggers**
| Metric | Threshold | Action | Cost |
|--------|-----------|--------|------|
| Supabase queries | >200K/month | Upgrade plan | +$75/mo |
| Concurrent connections | >80 | Enable pooling | Free |
| Claude API spend | >$100/mo | Lower per-user limit | Free |
| Rate limiter resets | Frequent 429s | Review limits | Free |
| Vector embeddings | >10K rows | Evaluate HNSW | Free |
| Vercel bandwidth | >100GB/mo | Check for abuse | Free tier |

---

## Ethan's Manual Checklist (after autonomous build)

1. Create **Upstash Redis** account at upstash.com → copy REST URL + token → add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to Vercel env vars
2. Upgrade **Supabase to Pro** ($25/mo) → enable connection pooling → add pooler URL to env vars
3. Run `npx playwright test` locally to verify E2E suite on your machine
4. Run `npx tsx load-tests/run.ts` to execute load test baseline (requires k6 installed: `brew install k6`)
5. Review **Lighthouse baseline** scores → adjust thresholds in `lighthouserc.js` if needed
6. Verify **Sentry alert** emails arrive at ethan.c.stuart@gmail.com
7. Apply the **database index migration** (019 + 020 + 021): `supabase db push` or apply via dashboard
8. Merge the **Dependabot** config PR and review first batch
9. Enable **branch protection** on main: require all 4 CI checks to pass
10. Review **CSP** in report-only mode for 1 week → switch to enforce after clean reports
11. Review **privacy policy** for accuracy after data privacy workstream
12. Set up **Upstash Redis** analytics dashboard (free, built into Upstash console) for rate limit visibility
