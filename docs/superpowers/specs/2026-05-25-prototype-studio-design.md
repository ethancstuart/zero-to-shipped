# Prototype Studio — Platform Design Spec

**Date:** 2026-05-25
**Status:** Approved
**Supersedes:** Zero to Ship (course-first model)

## Overview

Prototype Studio is a four-pillar AI prototyping platform with an agent-native architecture. It evolves ZTS from a fixed 16-module paid course into a free-first resource hub for anyone who wants to prototype with AI — PMs, founders, designers, junior devs.

The platform doesn't just teach about AI tools — it IS an AI system. Multi-agent pipelines produce content, a knowledge graph connects everything, automated benchmarks test tools, and the whole system is observable in real-time.

**Domain:** prototypestudio.dev or prototypestudio.app (neither resolves currently — check registrar availability). Note: `prototype.studio` is taken.
**Brand voice:** product voice on-site, first-person maker voice in content channels (LinkedIn, Substack, email)
**Monetization:** free-first. Premium tier added later once audience exists.

---

## Platform Pillars

### 1. Pulse — Ecosystem Intelligence

What's happening now in AI coding tools. The heartbeat that keeps everything current.

**Content types:**
- Weekly ecosystem briefs (AI-generated via multi-agent pipeline)
- Tool release deep-dives
- Side-by-side comparisons
- Quarterly "The Index" report (data-backed state of AI coding)

**Systems:**
- Tool Intelligence Engine monitoring Claude Code, Cursor, Gemini CLI, Codex, Windsurf, v0, Bolt, Lovable, Replit
- Public Ecosystem API (`/api/v1/`)
- Automated benchmarking for API-accessible tools
- Ecosystem comparison matrix with structured capability taxonomy

### 2. Build — Watch and Follow Along

Sessions, challenges, and sandboxes. Watch someone build, then do it yourself.

**Content types:**
- Recorded vibe-coding sessions (Ethan, ~30 min)
- AI-generated video tutorials (Gemini API)
- Written build walkthroughs with code snapshots
- Timed build challenges
- The Arena — side-by-side tool comparisons on identical tasks

**Systems:**
- StackBlitz WebContainer sandboxes (embedded, zero server cost)
- Arena comparison engine with community voting
- Starter repos in Turborepo monorepo under `starters/`

### 3. Learn — Pick Up Skills

Guides, lessons, and design patterns. Structured knowledge at your own pace.

**Content types:**
- Standalone lessons (reorganized from existing 16 modules)
- Front-end design lessons (new)
- Guides (Claude Code 101, Git 101, Agent Builder, SQL for PMs — carried over)
- Prompt patterns and cheat sheets
- Resource collections (carried over from library)

### 4. System — AI Agent Operating System

Learn to set up and use AI agents by watching real ones work.

**Content types:**
- Methodology framework (when to use agents, how to compose teams)
- Agent persona configurations (the actual configs, forkable)
- Starter setups (`solo-operator-starter`, etc.)

**Systems:**
- Live Agent Observatory — watch production pipeline agents work in real-time
- Agent Replay viewer — interactive step-through of agent transcripts
- Forkable configs via open source packages

### 5. Showcase — Built With Directory

Community-submitted projects built with AI tools. The dataset nobody else has.

- Filterable by tool, experience level, build time, project type
- Upvoting and community engagement
- Aggregate data feeds "The Index" quarterly report
- Submission → review → publish flow

### 6. Transparency — The Receipts

The platform proves its own thesis by showing everything.

- Build cost ticker (hosting, API costs, total investment)
- Pipeline run logs (every agent run is visible)
- Live architecture map
- Monthly "State of the Platform" auto-generated report
- Lines of code, commit count, test count — updated on every push

---

## Architecture

### Hybrid Content Model

**Files in the repo (MDX):** all content — lessons, guides, sessions, briefs, agent configs. Git is the version history. Agents read and write files natively.

**Database (Supabase):** only dynamic/user state — tools, releases, ecosystem status, user profiles, progress, analytics, showcase submissions, pipeline runs.

### Content Directory Structure

```
content/
├── pulse/
│   ├── briefs/                     # Weekly ecosystem briefs
│   ├── comparisons/                # Tool comparison pieces
│   └── releases/                   # Notable release deep-dives
├── build/
│   ├── sessions/                   # Recorded vibe-coding sessions
│   ├── challenges/                 # Timed build challenges
│   └── walkthroughs/               # Written step-by-step builds
├── learn/
│   ├── lessons/                    # Reorganized from existing modules
│   ├── guides/                     # Existing guides carry over
│   ├── design/                     # Front-end design lessons (new)
│   ├── patterns/                   # Prompt patterns, cheat sheets
│   └── resources/                  # Existing library content
├── system/
│   ├── playbook/                   # Methodology and framework
│   ├── personas/                   # The actual persona configs
│   └── starters/                   # Fork-ready setups
└── collections/                    # Learning paths / series
```

### MDX Frontmatter Schema

```yaml
---
title: string
slug: string
pillar: pulse | build | learn | system
type: brief | comparison | release | session | challenge | walkthrough | lesson | guide | pattern | resource | persona | starter | playbook
format: video | written | interactive | config
tools: string[]
toolVersions: Record<string, string>
difficulty: beginner | intermediate | advanced
estimatedMinutes: number
tags: string[]
isPremium: boolean
isFeatured: boolean
status: draft | published | archived
videoUrl?: string
sandboxTemplate?: string
collection?: string
position?: number
publishedAt: string
---
```

### MDX Rendering

Library: `next-mdx-remote`

Custom components available in content:
- `Sandbox` — inline StackBlitz embed
- `ToolBadge` — tool logo + version pill
- `ArenaCompare` — side-by-side viewer
- `AgentReplay` — step-through transcript viewer
- `CostTicker` — live cost display
- `Callout` — tip/warning/info boxes
- `CodeBlock` — Shiki syntax highlighting (already in stack)

Dynamic routes:
- `/pulse/[slug]` → `content/pulse/**/*.mdx`
- `/build/[slug]` → `content/build/**/*.mdx`
- `/learn/[slug]` → `content/learn/**/*.mdx`
- `/system/[slug]` → `content/system/**/*.mdx`
- `/showcase` → Supabase (user-submitted)

ISR: `revalidate: 3600` for content, `revalidate: 900` for Pulse.

---

## Database Schema (Supabase)

### Tool Intelligence

```sql
CREATE TABLE tools (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  website text,
  github_repo text,
  changelog_url text,
  category text CHECK (category IN ('ide','cli','platform','framework')),
  current_version text,
  last_release_date timestamptz,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE tool_releases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  version text NOT NULL,
  release_date timestamptz NOT NULL,
  summary text,
  significance text CHECK (significance IN ('major','minor','patch')),
  raw_changelog text,
  source_url text,
  capabilities text[],
  brief_status text DEFAULT 'pending' CHECK (brief_status IN ('pending','draft','published','skipped')),
  created_at timestamptz DEFAULT now()
);
```

### Ecosystem Comparison

```sql
CREATE TABLE ecosystem_status (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  capability text NOT NULL,
  category text NOT NULL,
  supported boolean DEFAULT false,
  maturity text CHECK (maturity IN ('experimental','beta','stable','mature')),
  quality_score integer CHECK (quality_score BETWEEN 1 AND 5),
  notes text,
  last_verified timestamptz,
  verified_by text CHECK (verified_by IN ('automated','manual')),
  UNIQUE(tool_id, capability)
);

CREATE TABLE ecosystem_status_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ecosystem_status_id uuid REFERENCES ecosystem_status(id) ON DELETE CASCADE,
  old_supported boolean,
  old_quality_score integer,
  new_supported boolean,
  new_quality_score integer,
  changed_at timestamptz DEFAULT now()
);
```

Capability taxonomy categories:
- **Code Generation:** single file, multi-file, project scaffolding, iterative refinement
- **Context & Understanding:** codebase-wide, file-level, conversation memory, doc ingestion
- **Tool Integration:** MCP support, external tool calling, browser access, terminal access, git integration
- **Editing:** inline, multi-file coordinated, diff-based, refactoring
- **Deployment:** one-click deploy, preview environments, CI/CD, infra provisioning
- **Collaboration:** pair programming, agent-to-agent, human review, team context
- **Platform:** CLI, IDE extension, web-based, API access, self-hostable

### Knowledge Graph

```sql
CREATE TABLE knowledge_nodes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  node_type text NOT NULL CHECK (node_type IN ('tool','capability','concept','content','project','persona')),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE knowledge_edges (
  source_id uuid REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  target_id uuid REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  relationship text NOT NULL CHECK (relationship IN ('requires','teaches','uses','enables','compares','built_with','related')),
  weight float DEFAULT 1.0,
  metadata jsonb,
  PRIMARY KEY (source_id, target_id, relationship)
);
```

### Multi-Agent Pipeline

```sql
CREATE TABLE pipeline_runs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_type text NOT NULL CHECK (trigger_type IN ('release_detected','manual','scheduled')),
  trigger_data jsonb,
  status text DEFAULT 'running' CHECK (status IN ('running','completed','failed','needs_review')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE pipeline_steps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  agent_role text NOT NULL CHECK (agent_role IN ('watcher','analyst','writer','fact_checker','publisher')),
  status text DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')),
  input_summary text,
  output_summary text,
  full_transcript jsonb,
  tokens_used integer,
  cost_cents integer,
  duration_ms integer,
  started_at timestamptz,
  completed_at timestamptz
);
```

### User & Personalization

```sql
-- profiles table carries over from ZTS (schema unchanged)

CREATE TABLE user_context (
  user_id uuid REFERENCES profiles(id) PRIMARY KEY,
  experience_level text CHECK (experience_level IN ('beginner','intermediate','advanced')),
  primary_tools text[],
  content_consumed text[],
  topics_of_interest text[],
  last_active timestamptz,
  model_version integer DEFAULT 1
);

CREATE TABLE bookmarks (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content_slug text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, content_slug)
);

CREATE TABLE progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content_slug text NOT NULL,
  progress_type text CHECK (progress_type IN ('viewed','started','completed','sandbox_launched','forked')),
  created_at timestamptz DEFAULT now()
);
```

### Showcase

```sql
CREATE TABLE showcase_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  url text,
  description text NOT NULL,
  screenshot_url text,
  github_url text,
  build_time_minutes integer,
  builder_experience text CHECK (builder_experience IN ('beginner','intermediate','advanced')),
  status text DEFAULT 'pending' CHECK (status IN ('pending','published','rejected')),
  upvotes integer DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE showcase_project_tools (
  project_id uuid REFERENCES showcase_projects(id) ON DELETE CASCADE,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tool_id)
);
```

### Content & Analytics

```sql
CREATE TABLE content_index (
  slug text PRIMARY KEY,
  pillar text NOT NULL,
  content_type text NOT NULL,
  title text NOT NULL,
  tools text[],
  tool_versions jsonb,
  status text NOT NULL,
  freshness text DEFAULT 'current' CHECK (freshness IN ('current','needs_refresh','outdated')),
  freshness_checked_at timestamptz,
  freshness_reason text,
  is_premium boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  published_at timestamptz,
  indexed_at timestamptz DEFAULT now()
);

CREATE TABLE content_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_slug text NOT NULL,
  views integer DEFAULT 0,
  sandbox_launches integer DEFAULT 0,
  completions integer DEFAULT 0,
  fork_count integer DEFAULT 0,
  avg_time_seconds integer,
  period_start date NOT NULL,
  period_end date NOT NULL,
  UNIQUE(content_slug, period_start)
);

CREATE TABLE content_embeddings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_slug text NOT NULL,
  chunk_index integer NOT NULL,
  heading_path text,
  chunk_text text NOT NULL,
  embedding vector(1024),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX ON content_embeddings USING ivfflat (embedding vector_cosine_ops);
```

### Benchmarks

```sql
CREATE TABLE benchmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  task text NOT NULL,
  input_prompt text NOT NULL,
  evaluation_criteria jsonb NOT NULL,
  tools_to_test text[],
  run_frequency text CHECK (run_frequency IN ('weekly','monthly','on_release')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE benchmark_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  benchmark_id uuid REFERENCES benchmarks(id) ON DELETE CASCADE,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  run_date timestamptz DEFAULT now(),
  output_text text,
  scores jsonb,
  tokens_used integer,
  cost_cents integer,
  duration_ms integer,
  evaluator_notes text
);
```

### Transparency

```sql
CREATE TABLE platform_costs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  month date NOT NULL,
  category text NOT NULL CHECK (category IN ('hosting','api_claude','api_gemini','database','redis','domain','other')),
  amount_cents integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);
```

### RLS Policies

Three access tiers:
- **Public:** all published content_index, tools, tool_releases, ecosystem_status, benchmarks, benchmark_results, showcase_projects (published only), platform_costs
- **Authenticated:** plus own progress, bookmarks, user_context, showcase submissions
- **Admin:** plus drafts, pipeline_runs, pipeline_steps, content management, all showcase statuses

---

## Multi-Agent Content Pipeline

### Agent Roles

Five specialized agents, each with its own system prompt and tool access:

**Watcher Agent**
- Runs every 6 hours via Vercel cron
- Executes per-tool source adapters
- Stores raw response hash to detect changes (avoids reprocessing)
- Classifies release significance
- Tool access: HTTP fetch, Supabase read/write

**Analyst Agent**
- Triggered by Watcher when a new release is detected
- Reads raw changelog + tool's current ecosystem_status profile
- Produces structured impact assessment: what changed, affected content, capability shifts
- Tool access: Supabase read, content index read

**Writer Agent**
- Receives impact assessment from Analyst
- Reads 3 most recent published briefs for voice consistency
- Drafts brief with proper frontmatter, tool badges, links to affected content
- Follows editorial guidelines (versioned system prompt in repo)
- Tool access: file read, MDX write

**Fact-Checker Agent**
- Receives draft from Writer
- Verifies every factual claim against source changelog
- Checks capability ratings match what was actually shipped
- Returns verification report: pass/fail per claim
- Tool access: HTTP fetch (source URLs), Supabase read

**Publisher Agent**
- Receives verified draft
- Formats MDX, generates PR title and description
- Commits to `pulse/auto-drafts` branch, opens PR
- Auto-merges if significance < major AND fact-check passed
- Tags Ethan for review if significance = major
- Tool access: git, GitHub API

### Source Adapters

| Tool | Source | Method |
|---|---|---|
| Claude Code | `api.github.com/repos/anthropics/claude-code/releases` | GitHub Releases API |
| Cursor | `cursor.com/changelog` | HTML scrape + diff detection |
| Gemini CLI | `github.com/google-gemini/gemini-cli/releases` | GitHub Releases API |
| Codex | `github.com/openai/codex/releases` | GitHub Releases API |
| v0 | `v0.dev/changelog` | HTML scrape or RSS |
| Windsurf | `windsurf.com/changelog` | HTML scrape |
| Bolt | `bolt.new` changelog | HTML scrape |
| Lovable | `lovable.dev/changelog` | HTML scrape |
| Replit | `blog.replit.com` | RSS feed |

Scraper resilience: each adapter stores last successful CSS selector path. Zero-result scrape opens a GitHub issue tagged `scraper-broken`. Tool is skipped until fixed.

### Feedback Loops

**Retrospective Agent** (runs monthly):
- Reviews content_analytics for all published pieces
- Identifies high-engagement patterns and content gaps (assistant queries with no good match)
- Generates `content/internal/strategy/YYYY-MM-strategy-memo.mdx`
- Tracks Writer's fact-check pass rate over time; flags system prompt drift

**Generation quality tracking:**
- Fact-Checker pass/fail rate per Writer run stored in pipeline_steps
- Trend analysis: if hallucination rate increases, Writer system prompt flagged for review

---

## Public Ecosystem API

### Endpoints

```
GET  /api/v1/tools                              → all tracked tools + current capabilities
GET  /api/v1/tools/:slug                         → single tool detail + recent releases
GET  /api/v1/tools/:slug/releases                → paginated release history
GET  /api/v1/compare?tools=a,b,c                 → capability matrix for selected tools
GET  /api/v1/capabilities                        → full capability taxonomy
GET  /api/v1/capabilities/:capability            → which tools support it + ratings
GET  /api/v1/pulse                               → latest published briefs (paginated)
GET  /api/v1/pulse/weekly                        → this week's ecosystem summary
GET  /api/v1/showcase                            → Built With directory (paginated, filterable)
GET  /api/v1/stats                               → aggregate platform stats
GET  /api/v1/benchmarks                          → available benchmarks + latest results
GET  /api/v1/benchmarks/:slug/results            → historical results for a benchmark
```

### Auth & Rate Limiting

- **Public:** no auth, 100 req/hour per IP (Upstash Redis)
- **API key (free):** 1,000 req/hour, full release history
- **Premium (future):** 10,000 req/hour, webhook subscriptions, bulk export

### Caching

Edge cache: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=1800`
Cache key for comparisons: sorted tool slugs joined.

### Response Envelope

```json
{
  "data": { },
  "meta": {
    "generatedAt": "ISO timestamp",
    "dataFreshness": "ISO timestamp",
    "apiVersion": "v1"
  }
}
```

---

## The Arena — Side-by-Side Comparison Engine

Curated comparisons backed by real builds, not live execution.

### Flow
1. Challenge defined (task spec + evaluation criteria)
2. Same challenge recorded with 2-3 tools (screen recording + final code)
3. Entries stored with structured metadata
4. Arena page renders side-by-side: synced video, stats, forkable repos
5. Community voting (authenticated users, simple upvote per tool per challenge)
6. Results feed into ecosystem_status quality scores

### Arena Entry Schema

```typescript
interface ArenaEntry {
  challengeSlug: string
  toolSlug: string
  videoUrl: string
  duration: number
  linesOfCode: number
  promptCount: number
  iterationCount: number
  resultScore: 1 | 2 | 3 | 4 | 5
  starterRepoUrl: string
  finalRepoUrl: string
  builderExperience: 'beginner' | 'intermediate' | 'advanced'
}
```

### Automated Benchmarks

For API-accessible tools only (Claude API, Gemini API, Codex API):
- Structured benchmark spec: input prompt, evaluation criteria (functional, code quality, design)
- Programmatic submission of same prompt to each tool
- Evaluator Agent scores outputs against rubric
- Results stored in benchmark_results, surfaced on comparison pages
- Budget cap per run/tool/month via platform_costs tracking

---

## AI Assistant — Graph-Augmented RAG

### Embedding Pipeline
1. MDX content chunked at h2/h3 boundaries, max 1500 tokens, 200 token overlap
2. Metadata per chunk: source slug, pillar, tools, heading path
3. Embeddings via `text-embedding-3-large` or `voyage-3-large`
4. Stored in Supabase `pgvector` (content_embeddings table)

### Retrieval
1. User query → embed
2. Cosine similarity top-5 from vector search
3. Knowledge graph augmentation: expand retrieved nodes to include connected nodes via `requires`, `teaches`, `related` edges
4. Re-rank by: relevance to query + recency + pillar diversity + user context (if authenticated)
5. Claude API generation with retrieved context, constrained to platform content, with source citations

### Personalization
- User context (experience level, tools, topics) biases retrieval weighting
- Assistant adapts examples and terminology to user's primary tools
- Recommender Agent generates "For You" sidebar (cached per user per hour)

### Rate Limits
- Anonymous: 10 queries/day
- Authenticated: 50 queries/day
- Premium (future): unlimited

### UI
- Floating chat widget (bottom-right), expandable
- Full-screen at `/ask`

---

## Sandbox Integration — StackBlitz WebContainers

### Why StackBlitz
- WebContainers run Node.js in browser — zero server cost
- Supports Next.js, Vite, most JS frameworks
- Embedded via `@stackblitz/sdk`

### Implementation

```typescript
import sdk from '@stackblitz/sdk'

sdk.embedGithubProject('sandbox-container', 'prototype-studio/starters/landing-page', {
  height: 600,
  openFile: 'src/app/page.tsx',
  terminal: 'dev',
  view: 'both'
})
```

### Per-content config (frontmatter)

```yaml
sandboxTemplate: "starters/landing-page"
sandboxOpenFile: "src/app/page.tsx"
sandboxTerminalCommand: "npm run dev"
```

### Limitations
WebContainers can't run Python, Go, or native CLIs (Claude Code itself). Those fall back to "clone this repo" with setup instructions. Future upgrade path: Vercel Sandbox (Firecracker microVMs).

---

## Transparency Layer

### Build Cost Ticker

Data sources:
| Metric | Source | Method |
|---|---|---|
| Hosting | Vercel | Manual monthly entry |
| Claude API | Anthropic dashboard | Manual or billing API |
| Gemini API | Google Cloud | Manual or billing API |
| Supabase | Dashboard | Manual |
| Upstash | Dashboard | Manual |
| Domain | Annual | Static |
| Build hours | Git history | Estimated from commit timestamps |

Rendered on `/transparency` with running totals, monthly chart, cost-per-content-piece metric.

### Build Stats (automated)
GitHub Action on push to main: runs `cloc`, counts routes/tests/content files, writes `build-stats.json`. Transparency page reads at build time.

### Pipeline Visibility
The Observatory page queries `pipeline_runs` and `pipeline_steps` tables. Shows: last N runs, per-step agent role + status + duration + token usage + cost. Expandable to show full transcript for each step.

---

## Open Source Packages

Single Turborepo monorepo: `apps/web` (the platform) + `packages/*`

### @prototype-studio/agent-starter
- CLI: `npx prototype-studio init`
- Prompts: tool choice, project type → scaffolds starter with CLAUDE.md, persona files, project structure
- Configs match what's documented in System pillar

### @prototype-studio/personas
- `npx prototype-studio add-persona chief-of-staff`
- Versioned persona library as installable package
- Links back to System pillar methodology

### @prototype-studio/toolkit
- Lower priority — built only when patterns emerge from content
- Scaffolding helpers, prompt templates, common patterns

---

## Migration Strategy

### Carried over from ZTS (re-branded)
- Supabase Auth — as-is
- Email infrastructure (Resend) — re-branded templates
- Marketing engine (zts-marketing) — re-branded, same crons
- Stripe — dormant, ready for premium
- User profiles — schema tweaks for user_context

### Content migration
- 16 JSON modules → individual MDX lessons in `content/learn/lessons/`
- Library pages → `content/learn/resources/`
- Guides → `content/learn/guides/`
- Cheat sheets → `content/learn/patterns/`

### Retired
- Fixed module progression (1-through-16 sequence)
- Founding spots / founding member pricing
- Paywall A/B variant experiment
- Course-style gamification (XP/badges repurposed for platform engagement)

---

## Future Premium Tier (not V1)

When audience exists, gate behind monthly subscription:
- Live interactive vibe-coding sessions
- Advanced challenges with AI feedback
- Early access to new content (24-48hr window)
- Unlimited AI assistant queries
- Private community / Discord access
- Custom agent config reviews

Stripe integration already exists. `isPremium` flag in frontmatter. Supabase RLS gates premium for active subscribers.

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Framework | Next.js (latest), TypeScript strict |
| Styling | Tailwind CSS v4, shadcn/ui |
| Database | Supabase (Postgres + RLS + pgvector) |
| Auth | Supabase Auth |
| Content | MDX files + next-mdx-remote |
| AI | Claude API (assistant, pipeline agents), Gemini API (video) |
| Embeddings | text-embedding-3-large or voyage-3-large → pgvector |
| Cache/Rate Limit | Upstash Redis |
| Sandboxes | StackBlitz WebContainers |
| Email | Resend |
| Payments | Stripe (dormant) |
| Hosting | Vercel |
| Monitoring | Sentry |
| Code Highlighting | Shiki |
| Monorepo | Turborepo |
| CI/CD | GitHub Actions + Vercel |

---

## Timeline

~1 month overhaul. Phasing TBD in implementation plan.
