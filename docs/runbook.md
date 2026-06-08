# Prototype Studio — Operational Runbook

**Last updated:** 2026-06-08
**Site:** https://zerotoship.app
**Repo:** github.com/ethancstuart/zero-to-shipped
**Owner:** Ethan Stuart (ethan.c.stuart@gmail.com)

This runbook is the source of truth for operating Prototype Studio in production. If something breaks at 3am, start here.

---

## 1. Architecture Overview

### Service Dependencies

```
Browser
   ↓
Vercel (Next.js 16, Edge + Node runtimes)
   ↓ ↓ ↓ ↓ ↓ ↓
Supabase  Claude API  Gemini API  Resend  Sentry  Upstash Redis
(critical) (assistant) (embeddings) (email) (errors) (rate limits)
```

### Critical path
The only **hard dependency** is Supabase. If it goes down, dynamic pages fail. Marketing pages serve from ISR cache. All other services degrade gracefully via circuit breakers.

### Service ownership table
| Service | Used by | Failure mode | Fallback |
|---------|---------|-------------|----------|
| Supabase | Everything (auth, content, tools, analytics) | Cached ISR for marketing, 503 for dynamic | Circuit breaker opens after 3 failures |
| Anthropic Claude | /api/assistant | Assistant disabled | "Browse content directly" message + circuit breaker |
| Google Gemini | Embedding generation in crons | Skip embedding for that run | Cron continues with keyword fallback |
| Resend | Transactional email | Sign-up still works, email queued for retry | Manual retry from logs |
| Sentry | Error tracking | Errors logged to Vercel only | Verify error reaches Vercel function logs |
| Upstash Redis | Distributed rate limiting | Falls back to in-memory per-instance | Automatic fallback (no action needed) |

---

## 2. Deployment

### Standard flow
1. Push to `main` → Vercel auto-deploys to production
2. Open a PR → Vercel creates a preview deploy at `zero-to-shipped-git-<branch>-...vercel.app`
3. CI pipeline runs (`.github/workflows/ci.yml`): quality → e2e + performance → content
4. All checks must pass before merge

### Manual rollback (instant)
1. Go to https://vercel.com/ethancstuart-6446s-projects/zero-to-shipped/deployments
2. Find the last known good deploy
3. Click "..." → "Promote to Production"
4. Effective immediately (< 30s)

### Emergency rollback via CLI
```bash
vercel rollback                          # interactive picker
vercel rollback <deployment-url>         # specific deploy
```

### Code-level revert
```bash
git revert <commit-sha>
git push origin main                     # triggers new deploy
```

### Verify deploy succeeded
```bash
curl -s https://zerotoship.app/api/health | jq
# Expected: {"status":"healthy",...}
```

---

## 3. Content Management

### Add a new MDX file
```bash
# 1. Create the file under the right pillar/type
vim content/learn/lessons/new-lesson.mdx

# 2. Validate frontmatter
npm run validate-content

# 3. Sync to Supabase content_index
npx tsx scripts/sync-content-index.ts

# 4. Generate embeddings (for RAG)
npx tsx scripts/generate-embeddings.ts

# 5. Commit + push
git add content/learn/lessons/new-lesson.mdx
git commit -m "content: add new lesson on X"
git push origin main
```

### Edit existing content
1. Modify the MDX file
2. Push — ISR revalidates within the configured TTL (15-60 min depending on pillar)
3. To force immediate revalidation: redeploy via Vercel dashboard (rebuilds all static pages)

### Delete content
1. Remove the `.mdx` file
2. Run `npx tsx scripts/sync-content-index.ts` — removes from Supabase index
3. Push

### Required frontmatter fields
title, slug, pillar, type, format, difficulty, status, publishedAt, estimatedMinutes, tools, tags, isPremium, isFeatured

Run `npm run validate-content` to verify.

---

## 4. Cron Jobs

### Active crons (configured in `vercel.json`)

| Cron | Schedule | What it does | Manual trigger |
|------|----------|-------------|----------------|
| `tool-intelligence` | Every 6 hours (`0 */6 * * *`) | Fetches tool releases, updates DB | `curl -H "Authorization: Bearer $CRON_SECRET" https://zerotoship.app/api/cron/tool-intelligence` |
| `benchmarks` | Weekly Sunday midnight (`0 0 * * 0`) | Evaluates AI tool benchmarks | `curl -H "Authorization: Bearer $CRON_SECRET" https://zerotoship.app/api/cron/benchmarks` |

### Where to check cron health
- Supabase `cron_runs` table — each run logs start/end/duration/status
- Vercel Dashboard → Functions → Logs (filter by `/api/cron/`)
- Query for failed runs:
  ```sql
  SELECT * FROM cron_runs WHERE status = 'failed' ORDER BY started_at DESC LIMIT 20;
  ```

### Cron failed — what to do
1. Check error_message in cron_runs table
2. Check Sentry for the error (tagged with `cron:<name>`)
3. Common causes:
   - Supabase circuit breaker open → wait for service recovery, then manual retrigger
   - External API rate limited → wait for window to reset
   - Code bug → fix, push, verify next scheduled run

### Disabled crons (in codebase but not scheduled)
- launch-sequence, founding-urgency, setup-check, premium-reengagement, streak-nudge, milestone-engagement, free-user-nurture, analytics-digest, retrospective
- Re-enable by adding to `vercel.json` `crons` array

---

## 5. AI Cost Management

### Current cost model
- **Claude API:** ~$0.003 per assistant query (Sonnet pricing)
- **Gemini embeddings:** ~$0.0001 per embedding (negligible at our scale)

### Per-user limits (configured in `src/app/api/assistant/route.ts`)
- Authenticated: **10 queries/day**
- Anonymous: **5 queries/day per IP**
- Limit reached → 429 response, UI shows "Resets at midnight UTC"

### Check current spend
- https://console.anthropic.com → Usage tab
- Alert threshold: $100/month

### Emergency cost reduction
1. Lower per-user limit: edit `AUTH_DAILY_LIMIT` and `ANON_DAILY_LIMIT` constants in `src/app/api/assistant/route.ts`, push
2. Temporarily disable assistant: set env var `DISABLE_ASSISTANT=true` in Vercel, redeploy
3. Drain Redis cache: lower TTL on response caching

### When to raise limits
After tracking actual usage for 30 days. If p95 user hits limit < 3 days/month, raise to 25/day.

---

## 6. Secret Rotation

### Required secrets (in Vercel env vars)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `CRON_SECRET`
- `RESEND_API_KEY`

### Optional secrets
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (Redis falls back to in-memory if missing)
- `NEXT_PUBLIC_SENTRY_DSN`
- `CORS_ALLOWED_ORIGINS`

### How to rotate
1. Generate new secret at the provider (Supabase, Anthropic, etc.)
2. Update in Vercel Dashboard → Project Settings → Environment Variables
3. Update locally: `.env.local`
4. Push any commit to main → triggers redeploy with new env vars
5. Revoke old secret at provider

### How to verify rotation
```bash
curl -s https://zerotoship.app/api/health | jq .checks.env
# Expected: {"status":"up"}
```

---

## 7. Incident Response

### First 5 checks (in order)
1. **Status pages:**
   - Vercel: https://www.vercel-status.com/
   - Supabase: https://status.supabase.com/
   - Anthropic: https://status.anthropic.com/
2. **Health endpoint:** `curl -s https://zerotoship.app/api/health | jq`
3. **Sentry:** https://sentry.io/organizations/... (recent errors)
4. **Vercel function logs:** https://vercel.com/ethancstuart-6446s-projects/zero-to-shipped → Functions
5. **Cron runs table:** Query Supabase for recent failures

### Decision tree
```
Health endpoint returns 503?
├─ Supabase check "down"? → Wait for Supabase recovery, marketing pages still work
├─ Env vars "down"? → Check Vercel env vars match expected set
└─ Content check "down"? → Likely deploy issue, check Vercel deploy logs

Health returns 200 but users report errors?
├─ Sentry has new errors? → Stack trace will point to fix
├─ No Sentry errors? → Check Vercel function logs for 4xx/5xx patterns
└─ All clean? → CDN/DNS issue, check Vercel + DNS provider

Circuit breaker open (per /api/health)?
├─ supabase open → Supabase struggling, wait for cooldown (60s)
├─ claude open → Assistant disabled, browse content directly works
└─ gemini open → Embedding generation skipped, search uses keyword fallback
```

### Rollback decision criteria
- Errors started immediately after a deploy → rollback (no investigation needed first)
- Errors started without a recent deploy → investigate before rolling back
- Sentry shows 100+ errors/hour → rollback then investigate

---

## 8. Service Degradation

### Circuit breaker states (check via `/api/health` → `circuits`)
- `closed` = normal operation
- `open` = service unavailable, returning fallback
- `half-open` = testing recovery (1 probe request)

### What users see during degradation
| Service down | User experience |
|--------------|-----------------|
| Supabase | Marketing pages work (ISR cache), dashboard shows "Data temporarily unavailable" |
| Claude | Assistant input disabled, message: "The assistant is temporarily unavailable. Browse our content directly." |
| Gemini | No visible change (only affects background embedding generation) |
| Resend | Sign-up succeeds, welcome email delayed |
| Sentry | No user impact, errors logged to Vercel only |
| Upstash | Rate limiting falls back to in-memory (less reliable but functional) |

### Force circuit reset
Circuits reset on next successful request OR after the configured cooldown (60s for Supabase/Claude, 120s for Gemini). To force immediate reset, redeploy (function instances restart fresh).

---

## 9. Database

### Backups (Supabase Pro)
- **Automatic daily backups:** 7-day retention, enabled by default
- **Point-in-time recovery:** Available within retention window via Supabase Dashboard → Database → Backups
- **Manual backup:**
  ```bash
  pg_dump "$SUPABASE_DB_POOLER_URL" > backup-$(date +%Y%m%d).sql
  ```

### Migration process
1. Create new migration file: `supabase/migrations/NNN_description.sql`
2. Use `IF NOT EXISTS` on all CREATE statements for idempotency
3. Test locally if possible: `supabase db reset` then apply
4. Apply to production: `supabase db push` OR run SQL via Supabase Dashboard → SQL Editor
5. Verify in dashboard

### Migration rollback
Migrations don't auto-rollback. To revert:
1. Write a new migration that reverses the previous one
2. Apply via the same flow

### Schema state (as of 2026-06-08)
- 21 migrations applied (001-021)
- Latest: 021_performance_indexes
- See `supabase/migrations/` for full history

---

## 10. Scaling Triggers

| Metric | Threshold | Action | Estimated cost |
|--------|-----------|--------|----------------|
| Supabase queries | > 200K/month | Stay on Pro ($25/mo) — usually fine | $25/mo |
| Supabase connections | > 80 concurrent | Enable PgBouncer pooling | Free |
| Concurrent users | > 500 | Add Upstash Redis (already supported) | +$10/mo |
| Claude API spend | > $100/mo | Lower per-user limits to 5/day | Free |
| Vector embeddings | > 50K rows | Migrate ivfflat → HNSW index | Free |
| Rate limiter 429s | > 5% of requests | Review per-tier limits | Free |
| Vercel bandwidth | > 100GB/mo | Investigate abuse, add CDN cache | Free |
| Bundle JS size | > 5 MB | Code-split + lazy-load GSAP | Engineering time |

### Quick-reference cost projections
| Users | Monthly cost | Notes |
|-------|-------------|-------|
| 100 | $45 | Supabase Pro + Claude usage |
| 1,000 | $95 | + Upstash Redis |
| 5,000 | $450 | Claude scales linearly with assistant usage |
| 10,000 | $1,200+ | Requires architectural rework |

---

## Quick Commands Reference

```bash
# Health check
curl -s https://zerotoship.app/api/health | jq

# Run tests
npx vitest run                          # unit
npx playwright test                     # E2E
npx tsx scripts/validate-content.ts     # content
npx tsx scripts/audit-secrets.ts        # secret leakage

# Performance
npm run analyze                         # bundle visualization
npm run check-bundle                    # vs baseline
npx lhci autorun                        # Lighthouse

# Load test
./load-tests/run.sh                                       # local
BASE_URL=https://zerotoship.app ./load-tests/run.sh       # production

# Manual cron trigger
curl -H "Authorization: Bearer $CRON_SECRET" https://zerotoship.app/api/cron/tool-intelligence

# Rollback
vercel rollback

# Database backup
pg_dump "$SUPABASE_DB_POOLER_URL" > backup-$(date +%Y%m%d).sql
```

---

## Related Documents
- Visual design spec: `docs/superpowers/specs/2026-05-25-prototype-studio-visual-design.md`
- Production hardening spec: `docs/superpowers/specs/2026-05-26-production-hardening-design.md`
- API documentation: `docs/api/openapi.yaml` (live: https://zerotoship.app/api/docs)
- Performance baselines: `docs/performance/`
- Brand voice: `docs/brand/voice.md`
