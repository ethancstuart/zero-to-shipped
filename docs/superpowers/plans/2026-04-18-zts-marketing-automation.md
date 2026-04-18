# ZTS Marketing Automation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone `zts-marketing` Vercel project that automatically generates and publishes LinkedIn, Twitter/X, and Beehiiv content on a fixed cadence using Claude API and Buffer API.

**Architecture:** Next.js App Router project deployed to Vercel. Daily cron at 6am UTC runs in three phases: generate tomorrow's posts (Claude API), push today's posts to Buffer (24h window), mark published. Vercel KV stores all state. Resend sends alert emails. Thin admin UI for oversight and config.

**Tech Stack:** Next.js 15, TypeScript strict, Vercel KV, Vercel Cron, Claude API (`@anthropic-ai/sdk`), Buffer API v1 (REST), Beehiiv API v2 (REST), Resend (`resend`), Vitest

**Spec:** `docs/superpowers/specs/2026-04-18-zts-marketing-automation-design.md`

**Note on LinkedIn pinned comments:** Buffer's API does not support pinned comments. The system generates the `pinned_comment` text and stores it in KV. After the post publishes, the admin UI surfaces the comment text prominently for Ethan to paste as a LinkedIn comment and pin manually (~30 seconds).

---

## File Map

```
zts-marketing/                          ← new standalone repo
  src/
    app/
      page.tsx                          # Content calendar (admin UI home)
      edit/[id]/page.tsx                # Edit single post
      config/page.tsx                   # Config panel
      api/
        cron/route.ts                   # Vercel cron handler (3 phases)
        posts/[id]/route.ts             # PATCH (edit) + DELETE post
        config/route.ts                 # GET + PATCH app config
    lib/
      types.ts                          # All shared TypeScript types
      kv.ts                             # Vercel KV typed getters/setters
      pillar.ts                         # Pillar rotation + dedup logic (pure)
      schedule.ts                       # UTC schedule helpers + gap check (pure)
      generate.ts                       # Claude API content generation
      buffer.ts                         # Buffer API integration
      beehiiv.ts                        # Beehiiv API integration
      alert.ts                          # Resend alert emails
    components/
      PostCard.tsx                      # Post display card (status borders)
      PinnedCommentBadge.tsx            # Highlights pinned comment for copy
      ConfigForm.tsx                    # Config panel form
  tests/
    lib/
      pillar.test.ts
      schedule.test.ts
      generate.test.ts                  # Claude mocked
      buffer.test.ts                    # Buffer mocked
      kv.test.ts                        # KV mocked
  vercel.json                           # Cron schedule
  .env.example
  vitest.config.ts

zero-to-shipped/                        ← existing repo (Task 10 only)
  src/app/(marketing)/toolkit/page.tsx  # Lead magnet opt-in page
  src/app/api/toolkit-subscribe/route.ts # Beehiiv opt-in API route
```

---

## Task 1: Repo Scaffold + Environment

**Files:**
- Create: `vercel.json`
- Create: `.env.example`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create the repo and install dependencies**

```bash
cd ~/Projects
npx create-next-app@latest zts-marketing \
  --typescript --tailwind --eslint --app --src-dir \
  --no-import-alias
cd zts-marketing
npm install @anthropic-ai/sdk @vercel/kv resend nanoid
npm install -D vitest @vitejs/plugin-react vitest-fetch-mock
```

- [ ] **Step 2: Create `vercel.json` with cron schedule**

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 6 * * *"
    }
  ]
}
```

- [ ] **Step 3: Create `.env.example`**

```bash
# Buffer
BUFFER_ACCESS_TOKEN=

# Anthropic
ANTHROPIC_API_KEY=

# Beehiiv
BEEHIIV_API_KEY=
BEEHIIV_PUBLICATION_ID=

# Resend
RESEND_API_KEY=
ALERT_EMAIL_TO=ethan.c.stuart@gmail.com

# Vercel KV (auto-populated by Vercel after provisioning KV store)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=

# Cron security
CRON_SECRET=

# Buffer profile IDs
BUFFER_LINKEDIN_PROFILE_ID=
BUFFER_TWITTER_PROFILE_ID=
```

- [ ] **Step 4: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
})
```

- [ ] **Step 5: Copy `.env.example` to `.env.local` and fill in values**

Find Buffer profile IDs: `curl "https://api.bufferapp.com/1/profiles.json?access_token=YOUR_TOKEN"` — copy `id` for LinkedIn and Twitter profiles.

Find Beehiiv publication ID: Beehiiv dashboard → Settings → API → copy publication ID.

Generate CRON_SECRET: `openssl rand -hex 32`

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: Next.js dev server at http://localhost:3000

- [ ] **Step 7: Initial commit**

```bash
git init && git add -A
git commit -m "chore: scaffold zts-marketing Next.js project"
```

---

## Task 2: Types + KV Layer

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/kv.ts`
- Create: `tests/lib/kv.test.ts`

- [ ] **Step 1: Write failing tests for KV helpers**

Create `tests/lib/kv.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @vercel/kv
vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(),
    set: vi.fn(),
    zadd: vi.fn(),
    zrange: vi.fn(),
    del: vi.fn(),
  },
}))

import { kv } from '@vercel/kv'
import {
  getPost, setPost, deletePost, getPostIndex, addPostToIndex,
  getConfig, setConfig, DEFAULT_CONFIG,
} from '../../src/lib/kv'
import type { Post } from '../../src/lib/types'

const mockPost: Post = {
  id: 'abc123',
  content: 'Test post',
  channel: 'linkedin',
  pillar: 'build-story',
  slot: 'primary',
  scheduled_at_utc: '2026-04-22T12:00:00Z',
  status: 'pending',
  pinned_comment: '→ Try Module 1 free: zerotoship.app/preview/module-1',
  hashtags_used: ['#BuildInPublic', '#ProductManagement'],
  created_at: '2026-04-21T06:00:00Z',
}

beforeEach(() => vi.clearAllMocks())

describe('getPost', () => {
  it('returns post from KV', async () => {
    vi.mocked(kv.get).mockResolvedValue(mockPost)
    const result = await getPost('abc123')
    expect(kv.get).toHaveBeenCalledWith('posts:abc123')
    expect(result).toEqual(mockPost)
  })

  it('returns null when post not found', async () => {
    vi.mocked(kv.get).mockResolvedValue(null)
    const result = await getPost('missing')
    expect(result).toBeNull()
  })
})

describe('setPost', () => {
  it('stores post under posts:{id} key', async () => {
    await setPost(mockPost)
    expect(kv.set).toHaveBeenCalledWith('posts:abc123', mockPost)
  })
})

describe('getConfig', () => {
  it('returns DEFAULT_CONFIG when nothing stored', async () => {
    vi.mocked(kv.get).mockResolvedValue(null)
    const config = await getConfig()
    expect(config).toEqual(DEFAULT_CONFIG)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run tests/lib/kv.test.ts
```

Expected: FAIL — module `../../src/lib/types` not found

- [ ] **Step 3: Create `src/lib/types.ts`**

```typescript
export type Channel = 'linkedin' | 'twitter' | 'beehiiv'
export type Pillar = 'build-story' | 'method' | 'outcome' | 'product'
export type PostStatus = 'pending' | 'queued_buffer' | 'published' | 'deleted' | 'failed'
export type Slot = 'primary' | 'secondary'

export interface Post {
  id: string
  content: string
  channel: Channel
  pillar: Pillar
  slot: Slot
  scheduled_at_utc: string // ISO 8601 UTC
  status: PostStatus
  pinned_comment: string | null
  hashtags_used: string[] | null
  created_at: string // ISO 8601 UTC
}

export interface PillarConfig {
  buildStory: number
  method: number
  outcome: number
  product: number
}

export interface ScheduleConfig {
  linkedin: { days: number[]; time_utc: string } // days: 0=Sun,1=Mon,...,6=Sat
  twitter_primary: { time_utc: string }
  twitter_secondary: { time_utc: string }
  beehiiv: { day: number; time_utc: string }
}

export interface ChannelConfig {
  linkedin: boolean
  twitter: boolean
  beehiiv: boolean
}

export interface HashtagEntry {
  tag: string
  lastUsedPostIndex: number
}

export interface AppConfig {
  pillars: PillarConfig
  schedule: ScheduleConfig
  channels: ChannelConfig
  paused: boolean
  pauseUntil: string | null
  voiceNotes: string
  positioningAnchor: string
  hashtagPool: HashtagEntry[]
  leadMagnetActive: boolean
}

export interface GenerationOutput {
  content: string
  channel: Channel
  pillar: Pillar
  slot: Slot
  scheduled_at: string
  pinned_comment: string | null
  thread: string[] | null
  hashtags_used: string[] | null
}
```

- [ ] **Step 4: Create `src/lib/kv.ts`**

```typescript
import { kv } from '@vercel/kv'
import type { Post, AppConfig } from './types'

export const DEFAULT_CONFIG: AppConfig = {
  pillars: { buildStory: 40, method: 25, outcome: 20, product: 15 },
  schedule: {
    linkedin: { days: [2, 5], time_utc: '12:00' },
    twitter_primary: { time_utc: '13:00' },
    twitter_secondary: { time_utc: '19:00' },
    beehiiv: { day: 0, time_utc: '13:00' },
  },
  channels: { linkedin: true, twitter: true, beehiiv: true },
  paused: false,
  pauseUntil: null,
  voiceNotes: '',
  positioningAnchor: '',
  hashtagPool: [
    { tag: '#ProductManagement', lastUsedPostIndex: -1 },
    { tag: '#BuildInPublic', lastUsedPostIndex: -1 },
    { tag: '#AITools', lastUsedPostIndex: -1 },
    { tag: '#ProductManager', lastUsedPostIndex: -1 },
    { tag: '#NoCode', lastUsedPostIndex: -1 },
    { tag: '#LowCode', lastUsedPostIndex: -1 },
    { tag: '#PMLife', lastUsedPostIndex: -1 },
    { tag: '#SideProject', lastUsedPostIndex: -1 },
    { tag: '#ShipIt', lastUsedPostIndex: -1 },
    { tag: '#CareerGrowth', lastUsedPostIndex: -1 },
    { tag: '#LearnToCode', lastUsedPostIndex: -1 },
    { tag: '#AIProductivity', lastUsedPostIndex: -1 },
  ],
  leadMagnetActive: false,
}

export async function getPost(id: string): Promise<Post | null> {
  return kv.get<Post>(`posts:${id}`)
}

export async function setPost(post: Post): Promise<void> {
  await kv.set(`posts:${id}`, post) // typo — fix below
}

export async function deletePost(id: string): Promise<void> {
  await kv.del(`posts:${id}`)
}

export async function addPostToIndex(id: string, scheduledAt: string): Promise<void> {
  const score = new Date(scheduledAt).getTime()
  await kv.zadd('posts:index', { score, member: id })
}

export async function getPostIndex(fromMs: number, toMs: number): Promise<string[]> {
  return kv.zrange('posts:index', fromMs, toMs, { byScore: true }) as Promise<string[]>
}

export async function getConfig(): Promise<AppConfig> {
  const stored = await kv.get<AppConfig>('config')
  return stored ?? DEFAULT_CONFIG
}

export async function setConfig(config: AppConfig): Promise<void> {
  await kv.set('config', config)
}
```

- [ ] **Step 5: Fix the typo in `setPost` — `id` is not in scope**

```typescript
export async function setPost(post: Post): Promise<void> {
  await kv.set(`posts:${post.id}`, post)
}
```

- [ ] **Step 6: Run tests**

```bash
npx vitest run tests/lib/kv.test.ts
```

Expected: PASS (all 4 tests)

- [ ] **Step 7: Commit**

```bash
git add src/lib/types.ts src/lib/kv.ts tests/lib/kv.test.ts
git commit -m "feat: types and KV layer with defaults"
```

---

## Task 3: Pillar Rotation + Schedule Logic

**Files:**
- Create: `src/lib/pillar.ts`
- Create: `src/lib/schedule.ts`
- Create: `tests/lib/pillar.test.ts`
- Create: `tests/lib/schedule.test.ts`

- [ ] **Step 1: Write failing tests for pillar logic**

Create `tests/lib/pillar.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { selectPillar, selectHashtags } from '../../src/lib/pillar'
import type { Post, PillarConfig, HashtagEntry } from '../../src/lib/types'

const config: PillarConfig = { buildStory: 40, method: 25, outcome: 20, product: 15 }

describe('selectPillar', () => {
  it('returns build-story when history is empty', () => {
    expect(selectPillar([], config, 'linkedin')).toBe('build-story')
  })

  it('selects most underweight pillar', () => {
    const history: Partial<Post>[] = [
      { pillar: 'build-story', channel: 'linkedin' },
      { pillar: 'build-story', channel: 'linkedin' },
      { pillar: 'method', channel: 'linkedin' },
    ]
    // build-story: 2/3 = 67% (target 40%) — overweight
    // method: 1/3 = 33% (target 25%) — slightly over
    // outcome: 0/3 = 0% (target 20%) — most underweight
    expect(selectPillar(history as Post[], config, 'linkedin')).toBe('outcome')
  })

  it('never repeats same pillar on consecutive linkedin posts', () => {
    const history: Partial<Post>[] = [
      { pillar: 'outcome', channel: 'linkedin' },
    ]
    // outcome is most underweight but was just used — skip it
    const result = selectPillar(history as Post[], config, 'linkedin')
    expect(result).not.toBe('outcome')
  })
})

describe('selectHashtags', () => {
  const pool: HashtagEntry[] = [
    { tag: '#BuildInPublic', lastUsedPostIndex: 0 },
    { tag: '#PMLife', lastUsedPostIndex: 3 },
    { tag: '#AITools', lastUsedPostIndex: -1 },
    { tag: '#ShipIt', lastUsedPostIndex: -1 },
  ]

  it('selects 2 tags not used in last 5 posts', () => {
    // currentPostIndex = 5
    // #BuildInPublic lastUsed=0, gap=5 — eligible
    // #PMLife lastUsed=3, gap=2 — NOT eligible (within 5)
    // #AITools lastUsed=-1 — always eligible
    // #ShipIt lastUsed=-1 — always eligible
    const tags = selectHashtags(pool, 5)
    expect(tags).toHaveLength(2)
    expect(tags).not.toContain('#PMLife')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run tests/lib/pillar.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Create `src/lib/pillar.ts`**

```typescript
import type { Post, Pillar, PillarConfig, HashtagEntry, Channel } from './types'

const PILLARS: Pillar[] = ['build-story', 'method', 'outcome', 'product']

const PILLAR_KEY: Record<Pillar, keyof PillarConfig> = {
  'build-story': 'buildStory',
  'method': 'method',
  'outcome': 'outcome',
  'product': 'product',
}

export function selectPillar(history: Post[], config: PillarConfig, channel: Channel): Pillar {
  if (history.length === 0) return 'build-story'

  const channelHistory = history.filter(p => p.channel === channel)
  const lastPillar = channelHistory[0]?.pillar ?? null

  // Calculate actual % for each pillar
  const counts = Object.fromEntries(PILLARS.map(p => [p, 0])) as Record<Pillar, number>
  for (const post of channelHistory) counts[post.pillar]++
  const total = channelHistory.length || 1

  // Find most underweight pillar (skip last pillar to avoid consecutive repeats)
  let best: Pillar = 'build-story'
  let bestDelta = -Infinity

  for (const pillar of PILLARS) {
    if (pillar === lastPillar) continue
    const actual = counts[pillar] / total
    const target = config[PILLAR_KEY[pillar]] / 100
    const delta = target - actual
    if (delta > bestDelta) {
      bestDelta = delta
      best = pillar
    }
  }

  return best
}

export function selectHashtags(pool: HashtagEntry[], currentPostIndex: number): string[] {
  const eligible = pool.filter(
    entry => entry.lastUsedPostIndex === -1 || currentPostIndex - entry.lastUsedPostIndex >= 5
  )
  // Shuffle eligible and pick 2
  const shuffled = eligible.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 2).map(e => e.tag)
}
```

- [ ] **Step 4: Write failing tests for schedule logic**

Create `tests/lib/schedule.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { getScheduledUTCTimestamp, hasGapConflict, isChannelDueToday } from '../../src/lib/schedule'

describe('getScheduledUTCTimestamp', () => {
  it('builds ISO timestamp for tomorrow at given UTC time', () => {
    // If today is 2026-04-21 (Tuesday), tomorrow is 2026-04-22
    const now = new Date('2026-04-21T06:00:00Z')
    const ts = getScheduledUTCTimestamp('12:00', now)
    expect(ts).toBe('2026-04-22T12:00:00.000Z')
  })
})

describe('hasGapConflict', () => {
  it('returns true when existing post is within 90 minutes', () => {
    const existing = ['2026-04-22T13:00:00Z']
    const proposed = '2026-04-22T13:45:00Z'
    expect(hasGapConflict(existing, proposed, 90)).toBe(true)
  })

  it('returns false when gap is exactly 90 minutes', () => {
    const existing = ['2026-04-22T13:00:00Z']
    const proposed = '2026-04-22T14:30:00Z'
    expect(hasGapConflict(existing, proposed, 90)).toBe(false)
  })
})

describe('isChannelDueToday', () => {
  it('returns true for linkedin on Tuesday (day 2)', () => {
    const tuesday = new Date('2026-04-22T06:00:00Z') // Tuesday UTC
    expect(isChannelDueToday([2, 5], tuesday)).toBe(true)
  })

  it('returns false for linkedin on Wednesday (day 3)', () => {
    const wednesday = new Date('2026-04-23T06:00:00Z')
    expect(isChannelDueToday([2, 5], wednesday)).toBe(false)
  })
})
```

- [ ] **Step 5: Create `src/lib/schedule.ts`**

```typescript
export function getScheduledUTCTimestamp(timeUtc: string, now: Date = new Date()): string {
  const [hours, minutes] = timeUtc.split(':').map(Number)
  const tomorrow = new Date(now)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(hours, minutes ?? 0, 0, 0)
  return tomorrow.toISOString()
}

export function hasGapConflict(
  existingTimestamps: string[],
  proposed: string,
  minGapMinutes: number
): boolean {
  const proposedMs = new Date(proposed).getTime()
  return existingTimestamps.some(ts => {
    const diff = Math.abs(new Date(ts).getTime() - proposedMs)
    return diff < minGapMinutes * 60 * 1000
  })
}

export function isChannelDueToday(days: number[], now: Date = new Date()): boolean {
  return days.includes(now.getUTCDay())
}

export function isSingleDayDue(day: number, now: Date = new Date()): boolean {
  return now.getUTCDay() === day
}
```

- [ ] **Step 6: Run all tests**

```bash
npx vitest run tests/lib/pillar.test.ts tests/lib/schedule.test.ts
```

Expected: PASS (all 7 tests)

- [ ] **Step 7: Commit**

```bash
git add src/lib/pillar.ts src/lib/schedule.ts tests/lib/pillar.test.ts tests/lib/schedule.test.ts
git commit -m "feat: pillar rotation and schedule logic"
```

---

## Task 4: Claude Generation Engine

**Files:**
- Create: `src/lib/generate.ts`
- Create: `tests/lib/generate.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/lib/generate.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify({
            content: 'I spent a weekend building something that changed how I think about PM work.',
            channel: 'linkedin',
            pillar: 'build-story',
            slot: 'primary',
            scheduled_at: '2026-04-22T12:00:00.000Z',
            pinned_comment: '→ Try Module 1 free: zerotoship.app/preview/module-1',
            thread: null,
            hashtags_used: ['#BuildInPublic', '#ProductManagement'],
          })
        }]
      })
    }
  }))
}))

import { generatePost } from '../../src/lib/generate'

describe('generatePost', () => {
  it('returns a parsed GenerationOutput', async () => {
    const result = await generatePost({
      channel: 'linkedin',
      pillar: 'build-story',
      slot: 'primary',
      scheduledAt: '2026-04-22T12:00:00.000Z',
      recentPostOpenings: [],
      hashtagPool: [],
      voiceNotes: '',
      positioningAnchor: 'ZTS teaches non-engineers to build real software with AI. The enemy is the "I can\'t code" belief.',
      leadMagnetActive: false,
    })
    expect(result.channel).toBe('linkedin')
    expect(result.pillar).toBe('build-story')
    expect(result.content).toBeTruthy()
    expect(result.pinned_comment).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run tests/lib/generate.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Create `src/lib/generate.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk'
import type { Channel, Pillar, Slot, GenerationOutput, HashtagEntry } from './types'

const client = new Anthropic()

const CTA: Record<Pillar, string> = {
  'build-story': 'zerotoship.app/preview/module-1',
  'method': 'zerotoship.app/pricing',
  'outcome': 'zerotoship.app/preview/module-1',
  'product': 'zerotoship.app/pricing',
}

const PERSONA: Record<Pillar, string> = {
  'build-story': "You are Ethan Stuart — a product manager who builds things on the side. The maker angle is a modifier on the PM identity, not a separate persona.",
  'method': "You are Ethan Stuart — a product manager with 15+ years of experience.",
  'outcome': "You are Ethan Stuart — a product manager with 15+ years of experience.",
  'product': "Zero to Ship is the subject. Write in product voice, not first-person.",
}

interface GeneratePostArgs {
  channel: Channel
  pillar: Pillar
  slot: Slot
  scheduledAt: string
  recentPostOpenings: string[]
  hashtagPool: HashtagEntry[]
  voiceNotes: string
  positioningAnchor: string
  leadMagnetActive: boolean
}

export async function generatePost(args: GeneratePostArgs): Promise<GenerationOutput> {
  const { channel, pillar, slot, scheduledAt, recentPostOpenings, hashtagPool, voiceNotes, positioningAnchor, leadMagnetActive } = args

  const systemPrompt = buildSystemPrompt(pillar, positioningAnchor)
  const userPrompt = buildUserPrompt({ channel, pillar, slot, scheduledAt, recentPostOpenings, hashtagPool, voiceNotes, leadMagnetActive })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`Claude returned non-JSON: ${text.slice(0, 200)}`)

  return JSON.parse(jsonMatch[0]) as GenerationOutput
}

function buildSystemPrompt(pillar: Pillar, positioningAnchor: string): string {
  return `${PERSONA[pillar]}

POSITIONING ANCHOR (every post must ladder back to this):
${positioningAnchor}

HARD CONSTRAINTS — never violate:
- Never use emoji of any kind
- Never tag or @mention any individual person or account
- Never mention Disney, your employer, professional affiliation, clients, or internal projects
- Never use corporate language, buzzwords, or passive voice
- Never put links inside LinkedIn post body (links go in pinned_comment only)
- Never repeat the same opening word or phrase used in recent posts
- Always use first-person singular ("I", never "we") except Product pillar posts
- Every post must pass: "would a thoughtful person share this if they'd never heard of ZTS?"
- No engagement bait ("comment YES if", "tag a friend who")

Return ONLY valid JSON. No markdown, no explanation, no code blocks.`
}

function buildUserPrompt(args: Omit<GeneratePostArgs, 'positioningAnchor'>): string {
  const { channel, pillar, slot, scheduledAt, recentPostOpenings, hashtagPool, voiceNotes, leadMagnetActive } = args
  const cta = CTA[pillar]
  const eligibleHashtags = hashtagPool.map(h => h.tag).join(', ')
  const recentOpenings = recentPostOpenings.length > 0
    ? `Recent post openings to avoid repeating:\n${recentPostOpenings.map(o => `- "${o}"`).join('\n')}`
    : 'No recent post history.'

  const channelInstructions: Record<Channel, string> = {
    linkedin: `LinkedIn post. 150-280 words. No links in body. End with a question or implicit hook, never a CTA. Select exactly 2 hashtags from this pool (no others): ${eligibleHashtags}. ${leadMagnetActive ? 'Pinned comment should include both the CTA and: "Free toolkit → zerotoship.app/toolkit"' : ''}`,
    twitter: slot === 'secondary' && pillar === 'method'
      ? 'Twitter/X 3-tweet thread. Opener under 280 chars (hook, no promo). Tweet 2: the content. Tweet 3: CTA.'
      : 'Twitter/X single tweet. Under 280 chars. Hook first, product second.',
    beehiiv: 'Beehiiv newsletter. 400-600 words. Include one product mention and one CTA. Auto-published to full list.',
  }

  return `Write a ${pillar} post for ${channel}.
Channel format: ${channelInstructions[channel]}
Slot: ${slot}
Scheduled: ${scheduledAt}
CTA link: ${cta}
${voiceNotes ? `Voice notes for this batch: ${voiceNotes}` : ''}

${recentOpenings}

Return this JSON (no other text):
{
  "content": "the full post body",
  "channel": "${channel}",
  "pillar": "${pillar}",
  "slot": "${slot}",
  "scheduled_at": "${scheduledAt}",
  "pinned_comment": "CTA text for LinkedIn, null for other channels",
  "thread": ["tweet1", "tweet2", "tweet3"] or null,
  "hashtags_used": ["#Tag1", "#Tag2"] or null
}`
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/lib/generate.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/generate.ts tests/lib/generate.test.ts
git commit -m "feat: Claude content generation engine"
```

---

## Task 5: Buffer, Beehiiv, and Resend Integrations

**Files:**
- Create: `src/lib/buffer.ts`
- Create: `src/lib/beehiiv.ts`
- Create: `src/lib/alert.ts`
- Create: `tests/lib/buffer.test.ts`

- [ ] **Step 1: Write failing tests for Buffer**

Create `tests/lib/buffer.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

global.fetch = vi.fn()

import { pushToBuffer } from '../../src/lib/buffer'

beforeEach(() => vi.clearAllMocks())

describe('pushToBuffer', () => {
  it('calls Buffer API with correct params for linkedin', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'buf_123', success: true }),
    } as Response)

    await pushToBuffer({
      profileId: 'profile_linkedin',
      text: 'Test post content',
      scheduledAt: '2026-04-22T12:00:00.000Z',
    })

    expect(fetch).toHaveBeenCalledWith(
      'https://api.bufferapp.com/1/updates/create.json',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('throws on Buffer 401 with descriptive message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    } as Response)

    await expect(pushToBuffer({
      profileId: 'profile_linkedin',
      text: 'Test',
      scheduledAt: '2026-04-22T12:00:00.000Z',
    })).rejects.toThrow('BUFFER_OAUTH_EXPIRED')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run tests/lib/buffer.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Create `src/lib/buffer.ts`**

```typescript
interface PushToBufferArgs {
  profileId: string
  text: string
  scheduledAt: string // ISO 8601 UTC
}

export async function pushToBuffer(args: PushToBufferArgs): Promise<void> {
  const { profileId, text, scheduledAt } = args
  const scheduledAtUnix = Math.floor(new Date(scheduledAt).getTime() / 1000)

  const body = new URLSearchParams({
    access_token: process.env.BUFFER_ACCESS_TOKEN!,
    'profile_ids[]': profileId,
    text,
    scheduled_at: scheduledAtUnix.toString(),
    now: 'false',
  })

  const res = await fetch('https://api.bufferapp.com/1/updates/create.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('BUFFER_OAUTH_EXPIRED')
    const text = await res.text()
    throw new Error(`Buffer API error ${res.status}: ${text}`)
  }
}
```

- [ ] **Step 4: Create `src/lib/beehiiv.ts`**

```typescript
export async function publishNewsletter(args: {
  subject: string
  content: string
  scheduledAt: string
}): Promise<void> {
  const { subject, content, scheduledAt } = args
  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/posts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        subject,
        content_html: `<p>${content.replace(/\n/g, '</p><p>')}</p>`,
        status: 'confirmed',
        send_at: Math.floor(new Date(scheduledAt).getTime() / 1000),
        audience: 'free',
      }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Beehiiv API error ${res.status}: ${text}`)
  }
}
```

- [ ] **Step 5: Create `src/lib/alert.ts`**

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const TO = process.env.ALERT_EMAIL_TO ?? 'ethan.c.stuart@gmail.com'

export async function sendEditWindowAlert(postContent: string, scheduledAt: string): Promise<void> {
  await resend.emails.send({
    from: 'ZTS Marketing <alerts@zts-marketing.vercel.app>',
    to: TO,
    subject: `📋 Post entering edit window — publishes ${formatTime(scheduledAt)}`,
    text: `A post is entering its 24h edit window.\n\nPublishes: ${scheduledAt}\n\n---\n\n${postContent}\n\n---\n\nEdit at: https://zts-marketing.vercel.app`,
  })
}

export async function sendApiFailureAlert(args: {
  api: 'buffer' | 'claude' | 'beehiiv'
  error: string
  postId?: string
  isOauthExpired?: boolean
}): Promise<void> {
  const { api, error, postId, isOauthExpired } = args
  const subject = isOauthExpired
    ? `🔑 Buffer OAuth expired — re-authorize now`
    : `⚠️ ${api.toUpperCase()} API failure`

  const body = isOauthExpired
    ? `Buffer OAuth has expired. Re-authorize at https://buffer.com/app/account\n\nError: ${error}`
    : `API: ${api}\nPost ID: ${postId ?? 'n/a'}\nError: ${error}`

  await resend.emails.send({
    from: 'ZTS Marketing <alerts@zts-marketing.vercel.app>',
    to: TO,
    subject,
    text: body,
  })
}

function formatTime(iso: string): string {
  return new Date(iso).toUTCString()
}
```

- [ ] **Step 6: Run Buffer tests**

```bash
npx vitest run tests/lib/buffer.test.ts
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/buffer.ts src/lib/beehiiv.ts src/lib/alert.ts tests/lib/buffer.test.ts
git commit -m "feat: Buffer, Beehiiv, and Resend alert integrations"
```

---

## Task 6: Cron Handler

**Files:**
- Create: `src/app/api/cron/route.ts`

- [ ] **Step 1: Create `src/app/api/cron/route.ts`**

```typescript
import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'
import { getConfig, getPost, getPostIndex, setPost, addPostToIndex } from '@/lib/kv'
import { generatePost } from '@/lib/generate'
import { pushToBuffer } from '@/lib/buffer'
import { publishNewsletter } from '@/lib/beehiiv'
import { sendEditWindowAlert, sendApiFailureAlert } from '@/lib/alert'
import { selectPillar, selectHashtags } from '@/lib/pillar'
import { getScheduledUTCTimestamp, hasGapConflict, isChannelDueToday, isSingleDayDue } from '@/lib/schedule'
import type { Post, Channel, Slot } from '@/lib/types'

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const config = await getConfig()

  // Respect pause
  if (config.paused) return NextResponse.json({ skipped: 'paused' })
  if (config.pauseUntil && new Date(config.pauseUntil) > now) {
    return NextResponse.json({ skipped: 'pauseUntil' })
  }

  // --- PHASE 1: Generate tomorrow's posts ---
  const slots: Array<{ channel: Channel; slot: Slot; scheduledAt: string }> = []

  if (config.channels.linkedin) {
    // Cron runs at 6am UTC daily. Generate a LinkedIn post only if TOMORROW is a LinkedIn day.
    const tomorrow = new Date(now)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    if (isChannelDueToday(config.schedule.linkedin.days, tomorrow)) {
      slots.push({ channel: 'linkedin', slot: 'primary', scheduledAt: getScheduledUTCTimestamp(config.schedule.linkedin.time_utc, now) })
    }
  }

  if (config.channels.twitter) {
    slots.push({ channel: 'twitter', slot: 'primary', scheduledAt: getScheduledUTCTimestamp(config.schedule.twitter_primary.time_utc, now) })
    slots.push({ channel: 'twitter', slot: 'secondary', scheduledAt: getScheduledUTCTimestamp(config.schedule.twitter_secondary.time_utc, now) })
  }

  if (config.channels.beehiiv && isSingleDayDue(config.schedule.beehiiv.day, now)) {
    slots.push({ channel: 'beehiiv', slot: 'primary', scheduledAt: getScheduledUTCTimestamp(config.schedule.beehiiv.time_utc, now) })
  }

  // Get recent post history for dedup
  const nowMs = Date.now()
  const fourteenDaysAgoMs = nowMs - 14 * 24 * 60 * 60 * 1000
  const recentIds = await getPostIndex(fourteenDaysAgoMs, nowMs)
  const recentPosts: Post[] = (await Promise.all(recentIds.map(id => getPost(id)))).filter(Boolean) as Post[]

  let postIndexCounter = recentPosts.length

  for (const { channel, slot, scheduledAt } of slots) {
    try {
      const channelHistory = recentPosts.filter(p => p.channel === channel)
      const pillar = selectPillar(channelHistory, config.pillars, channel)
      const recentOpenings = channelHistory.slice(0, 7).map(p => p.content.split('\n')[0])
      const hashtags = channel === 'linkedin' ? selectHashtags(config.hashtagPool, postIndexCounter) : []

      const output = await generatePost({
        channel, pillar, slot, scheduledAt,
        recentPostOpenings: recentOpenings,
        hashtagPool: hashtags.length > 0 ? config.hashtagPool : [],
        voiceNotes: config.voiceNotes,
        positioningAnchor: config.positioningAnchor,
        leadMagnetActive: config.leadMagnetActive,
      })

      const post: Post = {
        id: nanoid(),
        content: output.content,
        channel: output.channel,
        pillar: output.pillar,
        slot: output.slot,
        scheduled_at_utc: output.scheduled_at,
        status: 'pending',
        pinned_comment: output.pinned_comment,
        hashtags_used: output.hashtags_used,
        created_at: now.toISOString(),
      }

      await setPost(post)
      await addPostToIndex(post.id, post.scheduled_at_utc)
      postIndexCounter++

      // Send edit window alert email
      await sendEditWindowAlert(post.content, post.scheduled_at_utc).catch(() => {}) // non-fatal
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      await sendApiFailureAlert({ api: 'claude', error, }).catch(() => {})
    }
  }

  // --- PHASE 2: Push pending posts entering 24h window ---
  const in24hMs = nowMs + 24 * 60 * 60 * 1000
  const upcomingIds = await getPostIndex(nowMs, in24hMs)

  // Get existing queued_buffer timestamps per channel for gap check
  const allQueuedIds = await getPostIndex(nowMs, nowMs + 7 * 24 * 60 * 60 * 1000)
  const allQueued = (await Promise.all(allQueuedIds.map(id => getPost(id)))).filter(p => p?.status === 'queued_buffer') as Post[]

  for (const id of upcomingIds) {
    const post = await getPost(id)
    if (!post || post.status !== 'pending') continue

    // Idempotency: already queued
    if (post.status === 'queued_buffer') continue

    // 90-minute gap check (Twitter/X only)
    if (post.channel === 'twitter') {
      const channelQueued = allQueued
        .filter(p => p.channel === 'twitter')
        .map(p => p.scheduled_at_utc)
      if (hasGapConflict(channelQueued, post.scheduled_at_utc, 90)) {
        console.warn(`Gap conflict for post ${id} — skipping`)
        continue
      }
    }

    try {
      const profileId = post.channel === 'linkedin'
        ? process.env.BUFFER_LINKEDIN_PROFILE_ID!
        : process.env.BUFFER_TWITTER_PROFILE_ID!

      if (post.channel === 'beehiiv') {
        await publishNewsletter({
          subject: post.content.split('\n')[0],
          content: post.content,
          scheduledAt: post.scheduled_at_utc,
        })
      } else {
        const text = post.channel === 'twitter' && post.thread
          ? post.thread[0] // Buffer only gets the first tweet; threads need separate implementation
          : post.content
        await pushToBuffer({ profileId, text, scheduledAt: post.scheduled_at_utc })
      }

      await setPost({ ...post, status: 'queued_buffer' })
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      const isOauthExpired = error === 'BUFFER_OAUTH_EXPIRED'
      await sendApiFailureAlert({ api: post.channel === 'beehiiv' ? 'beehiiv' : 'buffer', error, postId: post.id, isOauthExpired }).catch(() => {})
      await setPost({ ...post, status: 'failed' })
      if (isOauthExpired) break // Stop Phase 2 entirely on auth failure
    }
  }

  // --- PHASE 3: Mark published + stale detection ---
  const publishedIds = await getPostIndex(fourteenDaysAgoMs, nowMs)
  for (const id of publishedIds) {
    const post = await getPost(id)
    if (!post) continue
    if (post.status === 'queued_buffer' && new Date(post.scheduled_at_utc) < now) {
      await setPost({ ...post, status: 'published' })
    }
  }

  return NextResponse.json({ ok: true, generated: slots.length })
}
```

- [ ] **Step 2: Test the cron endpoint manually in dev**

```bash
npm run dev
# In a separate terminal:
curl -H "Authorization: Bearer $(grep CRON_SECRET .env.local | cut -d= -f2)" \
  http://localhost:3000/api/cron
```

Expected: `{"ok":true,"generated":N}` (N depends on which channels are due today)

- [ ] **Step 3: Commit**

```bash
git add src/app/api/cron/route.ts
git commit -m "feat: cron handler — generate, push, mark published"
```

---

## Task 7: Post CRUD API Routes

**Files:**
- Create: `src/app/api/posts/[id]/route.ts`
- Create: `src/app/api/config/route.ts`

- [ ] **Step 1: Create `src/app/api/posts/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPost, setPost, deletePost } from '@/lib/kv'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const post = await getPost(params.id)
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json() as { content?: string; pinned_comment?: string }
  const updated = { ...post, ...body }
  await setPost(updated)
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const post = await getPost(params.id)
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await setPost({ ...post, status: 'deleted' })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Create `src/app/api/config/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getConfig, setConfig, DEFAULT_CONFIG } from '@/lib/kv'
import type { AppConfig, PillarConfig } from '@/lib/types'

export async function GET() {
  const config = await getConfig()
  return NextResponse.json(config)
}

export async function PATCH(req: NextRequest) {
  const current = await getConfig()
  const patch = await req.json() as Partial<AppConfig>

  // Auto-normalize pillar weights to sum to 100
  if (patch.pillars) {
    patch.pillars = normalizePillars(patch.pillars)
  }

  // Enforce voice notes max length
  if (patch.voiceNotes && patch.voiceNotes.length > 500) {
    patch.voiceNotes = patch.voiceNotes.slice(0, 500)
  }

  const updated = { ...current, ...patch }
  await setConfig(updated)
  return NextResponse.json(updated)
}

function normalizePillars(p: PillarConfig): PillarConfig {
  const total = p.buildStory + p.method + p.outcome + p.product
  if (total === 0) return DEFAULT_CONFIG.pillars
  return {
    buildStory: Math.round((p.buildStory / total) * 100),
    method: Math.round((p.method / total) * 100),
    outcome: Math.round((p.outcome / total) * 100),
    product: Math.round((p.product / total) * 100),
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/posts src/app/api/config
git commit -m "feat: post CRUD and config API routes"
```

---

## Task 8: Admin UI — Content Calendar

**Files:**
- Create: `src/components/PostCard.tsx`
- Create: `src/components/PinnedCommentBadge.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create `src/components/PostCard.tsx`**

```tsx
'use client'
import type { Post } from '@/lib/types'
import { useRouter } from 'next/navigation'

const STATUS_BORDER: Record<string, string> = {
  pending_window: 'border-blue-500',
  pending_future: 'border-zinc-700',
  failed: 'border-red-500',
  stale: 'border-yellow-500',
  published: 'border-zinc-800 opacity-50',
}

const CHANNEL_BADGE: Record<string, string> = {
  linkedin: 'bg-blue-900 text-blue-300',
  twitter: 'bg-sky-900 text-sky-300',
  beehiiv: 'bg-purple-900 text-purple-300',
}

const PILLAR_BADGE: Record<string, string> = {
  'build-story': 'bg-zinc-800 text-zinc-300',
  method: 'bg-green-900 text-green-300',
  outcome: 'bg-orange-900 text-orange-300',
  product: 'bg-indigo-900 text-indigo-300',
}

function getStatusKey(post: Post): string {
  const now = Date.now()
  const scheduledMs = new Date(post.scheduled_at_utc).getTime()
  if (post.status === 'failed') return 'failed'
  if (post.status === 'queued_buffer' && scheduledMs < now - 48 * 60 * 60 * 1000) return 'stale'
  if (post.status === 'published') return 'published'
  if (post.status === 'pending' && scheduledMs - now <= 24 * 60 * 60 * 1000) return 'pending_window'
  return 'pending_future'
}

export function PostCard({ post, onDelete }: { post: Post; onDelete: (id: string) => void }) {
  const router = useRouter()
  const statusKey = getStatusKey(post)
  const isEditable = statusKey === 'pending_window'

  const scheduledDate = new Date(post.scheduled_at_utc).toUTCString()
  const hoursLeft = Math.max(0, Math.round((new Date(post.scheduled_at_utc).getTime() - Date.now()) / 3_600_000))

  return (
    <div className={`rounded-lg border-2 ${STATUS_BORDER[statusKey]} bg-zinc-900 p-4 mb-3`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2 items-center flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${CHANNEL_BADGE[post.channel]}`}>
            {post.channel.toUpperCase()}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded ${PILLAR_BADGE[post.pillar]}`}>
            {post.pillar}
          </span>
          <span className="text-xs text-zinc-500">{post.slot}</span>
          {isEditable && (
            <span className="text-xs text-yellow-400">⚡ {hoursLeft}h left to edit</span>
          )}
          {statusKey === 'stale' && (
            <span className="text-xs text-yellow-300">⚠ Stale — check Buffer</span>
          )}
          {statusKey === 'failed' && (
            <span className="text-xs text-red-400">✗ Failed — check alerts</span>
          )}
        </div>
        {isEditable && (
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/edit/${post.id}`)}
              className="text-xs px-2 py-1 rounded border border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              Edit
            </button>
            <button
              onClick={async () => {
                await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
                onDelete(post.id)
              }}
              className="text-xs px-2 py-1 rounded border border-red-800 text-red-400 hover:bg-red-950"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      <p className="text-sm text-zinc-300 line-clamp-3 whitespace-pre-wrap">{post.content}</p>
      {post.pinned_comment && (
        <div className="mt-2 text-xs text-blue-400 bg-blue-950 rounded px-2 py-1">
          📌 Pinned comment: {post.pinned_comment}
        </div>
      )}
      <p className="text-xs text-zinc-500 mt-2">{scheduledDate}</p>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/page.tsx`**

```tsx
import { getConfig, getPost, getPostIndex } from '@/lib/kv'
import { PostCard } from '@/components/PostCard'
import type { Post } from '@/lib/types'
import Link from 'next/link'

export const revalidate = 60

export default async function HomePage() {
  const now = Date.now()
  const sevenDaysMs = now + 7 * 24 * 60 * 60 * 1000
  const ids = await getPostIndex(now - 24 * 60 * 60 * 1000, sevenDaysMs)
  const posts: Post[] = (await Promise.all(ids.map(id => getPost(id)))).filter(Boolean) as Post[]
  const visible = posts.filter(p => p.status !== 'deleted').sort(
    (a, b) => new Date(a.scheduled_at_utc).getTime() - new Date(b.scheduled_at_utc).getTime()
  )

  const inWindow = visible.filter(p =>
    p.status === 'pending' &&
    new Date(p.scheduled_at_utc).getTime() - now <= 24 * 60 * 60 * 1000
  )

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <h1 className="text-lg font-semibold">ZTS Marketing Engine</h1>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-blue-400 font-medium">Calendar</span>
          <Link href="/config" className="text-zinc-500 hover:text-zinc-300">Config</Link>
        </div>
      </div>

      {inWindow.length > 0 && (
        <div className="mb-4 px-3 py-2 bg-blue-950 border border-blue-700 rounded-lg text-sm text-blue-300">
          ⚡ {inWindow.length} post{inWindow.length > 1 ? 's' : ''} in edit window — review before they publish
        </div>
      )}

      <p className="text-xs text-zinc-500 mb-4 uppercase tracking-wider">Queued — Next 7 Days</p>

      {visible.length === 0 && (
        <p className="text-zinc-500 text-sm">No upcoming posts. Run the cron or wait for the next scheduled run.</p>
      )}

      {visible.map(post => (
        <PostCard key={post.id} post={post} onDelete={() => {}} />
      ))}
    </main>
  )
}
```

- [ ] **Step 3: Start dev server and verify the calendar renders**

```bash
npm run dev
# Open http://localhost:3000
```

Expected: Calendar page loads with empty state message (no posts yet)

- [ ] **Step 4: Commit**

```bash
git add src/components/PostCard.tsx src/app/page.tsx
git commit -m "feat: admin UI content calendar"
```

---

## Task 9: Admin UI — Edit + Config

**Files:**
- Create: `src/app/edit/[id]/page.tsx`
- Create: `src/components/ConfigForm.tsx`
- Create: `src/app/config/page.tsx`

- [ ] **Step 1: Create `src/app/edit/[id]/page.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [pinnedComment, setPinnedComment] = useState('')
  const [channel, setChannel] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/posts/${params.id}`)
      .then(r => r.json())
      .then(post => {
        setContent(post.content)
        setPinnedComment(post.pinned_comment ?? '')
        setChannel(post.channel)
      })
  }, [params.id])

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/posts/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, pinned_comment: pinnedComment || null }),
    })
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 max-w-2xl mx-auto">
      <button onClick={() => router.push('/')} className="text-sm text-zinc-500 mb-6 hover:text-zinc-300">
        ← Back
      </button>
      <h2 className="text-lg font-semibold mb-4">Edit Post</h2>

      <label className="block text-xs text-zinc-400 uppercase mb-1">Content</label>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={10}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100 resize-y mb-4"
      />

      {channel === 'linkedin' && (
        <>
          <label className="block text-xs text-zinc-400 uppercase mb-1">
            Pinned Comment (copy + paste manually after post goes live)
          </label>
          <textarea
            value={pinnedComment}
            onChange={e => setPinnedComment(e.target.value)}
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100 resize-y mb-4"
          />
        </>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </main>
  )
}
```

- [ ] **Step 2: Add GET handler to `src/app/api/posts/[id]/route.ts`**

```typescript
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const post = await getPost(params.id)
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}
```

- [ ] **Step 3: Create `src/app/config/page.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import type { AppConfig } from '@/lib/types'

export default function ConfigPage() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(setConfig)
  }, [])

  async function handleSave() {
    if (!config) return
    setSaving(true)
    const updated = await fetch('/api/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    }).then(r => r.json())
    setConfig(updated)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!config) return <div className="min-h-screen bg-zinc-950 text-zinc-500 flex items-center justify-center">Loading…</div>

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Config</h2>
        <a href="/" className="text-sm text-zinc-500 hover:text-zinc-300">← Calendar</a>
      </div>

      <section className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-zinc-400 uppercase tracking-wider">Positioning Anchor</h3>
        <textarea
          value={config.positioningAnchor}
          onChange={e => setConfig({ ...config, positioningAnchor: e.target.value })}
          rows={3}
          placeholder="2 sentences: core claim + core enemy. Injected into every post generation."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100"
        />
      </section>

      <section className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-zinc-400 uppercase tracking-wider">Pillar Weights</h3>
        {(['buildStory', 'method', 'outcome', 'product'] as const).map(key => (
          <div key={key} className="flex items-center gap-3 mb-2">
            <span className="text-sm w-28 text-zinc-300">{key}</span>
            <input
              type="range" min={0} max={100}
              value={config.pillars[key]}
              onChange={e => setConfig({ ...config, pillars: { ...config.pillars, [key]: Number(e.target.value) } })}
              className="flex-1"
            />
            <span className="text-sm text-zinc-400 w-10 text-right">{config.pillars[key]}%</span>
          </div>
        ))}
        <p className="text-xs text-zinc-500 mt-1">Auto-normalizes to 100% on save.</p>
      </section>

      <section className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-zinc-400 uppercase tracking-wider">Channels</h3>
        {(['linkedin', 'twitter', 'beehiiv'] as const).map(ch => (
          <label key={ch} className="flex items-center gap-3 mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.channels[ch]}
              onChange={e => setConfig({ ...config, channels: { ...config.channels, [ch]: e.target.checked } })}
            />
            <span className="text-sm text-zinc-300">{ch}</span>
          </label>
        ))}
      </section>

      <section className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-zinc-400 uppercase tracking-wider">Voice Notes</h3>
        <textarea
          value={config.voiceNotes}
          onChange={e => setConfig({ ...config, voiceNotes: e.target.value.slice(0, 500) })}
          rows={4}
          maxLength={500}
          placeholder="Freeform context for the next generation run. e.g. 'April 28 is launch day, founding spots filling up.'"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100"
        />
        <p className="text-xs text-zinc-500 mt-1">{config.voiceNotes.length}/500 chars</p>
      </section>

      <section className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-zinc-400 uppercase tracking-wider">Controls</h3>
        <label className="flex items-center gap-3 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.paused}
            onChange={e => setConfig({ ...config, paused: e.target.checked })}
          />
          <span className="text-sm text-zinc-300">Pause all publishing</span>
        </label>
        <div className="mb-3">
          <label className="block text-xs text-zinc-500 mb-1">
            Pause until (UTC) — for time-limited pauses, e.g. breaking news
          </label>
          <input
            type="datetime-local"
            value={config.pauseUntil ? config.pauseUntil.slice(0, 16) : ''}
            onChange={e => setConfig({ ...config, pauseUntil: e.target.value ? new Date(e.target.value).toISOString() : null })}
            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100"
          />
          {config.pauseUntil && (
            <button
              onClick={() => setConfig({ ...config, pauseUntil: null })}
              className="ml-2 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Clear
            </button>
          )}
        </div>
        <label className="flex items-center gap-3 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.leadMagnetActive}
            onChange={e => setConfig({ ...config, leadMagnetActive: e.target.checked })}
          />
          <span className="text-sm text-zinc-300">Include lead magnet CTA in pinned comments</span>
        </label>
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Config'}
      </button>
    </main>
  )
}
```

- [ ] **Step 4: Run full test suite**

```bash
npx vitest run
```

Expected: all tests PASS

- [ ] **Step 5: Build check**

```bash
npm run build
```

Expected: no TypeScript errors, clean build

- [ ] **Step 6: Commit**

```bash
git add src/app/edit src/app/config src/components/ConfigForm.tsx
git commit -m "feat: edit post and config panel UI"
```

---

## Task 10: Deploy to Vercel

**Files:**
- No new files — Vercel configuration via CLI

- [ ] **Step 1: Deploy to Vercel**

```bash
npx vercel
# Follow prompts: new project, name zts-marketing, default settings
```

- [ ] **Step 2: Add all env vars to Vercel**

```bash
vercel env add BUFFER_ACCESS_TOKEN production
vercel env add BUFFER_LINKEDIN_PROFILE_ID production
vercel env add BUFFER_TWITTER_PROFILE_ID production
vercel env add ANTHROPIC_API_KEY production
vercel env add BEEHIIV_API_KEY production
vercel env add BEEHIIV_PUBLICATION_ID production
vercel env add RESEND_API_KEY production
vercel env add ALERT_EMAIL_TO production
vercel env add CRON_SECRET production
```

Vercel KV env vars (`KV_URL`, `KV_REST_API_URL`, etc.) are auto-added when you provision a KV store via Vercel dashboard → Storage → Create KV Store → link to this project.

- [ ] **Step 3: Enable Vercel password protection**

Vercel dashboard → Project Settings → Deployment Protection → Enable → set password

- [ ] **Step 4: Deploy to production**

```bash
vercel --prod
```

- [ ] **Step 5: Verify cron is registered**

Vercel dashboard → Project → Settings → Cron Jobs → confirm `0 6 * * *` on `/api/cron`

- [ ] **Step 6: Trigger cron manually to test**

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://zts-marketing.vercel.app/api/cron
```

Expected: `{"ok":true,"generated":N}`

- [ ] **Step 7: Verify admin UI loads at production URL**

Open https://zts-marketing.vercel.app (enter password). Confirm calendar renders.

- [ ] **Step 8: Set positioning anchor in Config panel**

Open Config → Positioning Anchor → write your 2 sentences, e.g.:
```
Zero to Ship teaches PMs, BAs, and project managers to build real software with AI — no CS degree needed.
The enemy is the belief that "I'm not technical enough to build."
```

- [ ] **Step 9: Final commit + push**

```bash
git push origin main
```

---

## Task 11: Lead Magnet Page (zero-to-shipped repo)

**Repo:** `/Users/ethanstuart/Projects/zero-to-shipped`  
**Files:**
- Create: `src/app/(marketing)/toolkit/page.tsx`
- Create: `src/app/api/toolkit-subscribe/route.ts`

- [ ] **Step 1: Create the subscribe API route**

Create `src/app/api/toolkit-subscribe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json() as { email: string }
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: 'toolkit-page',
      }),
    }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'Subscribe failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Create the toolkit landing page**

Create `src/app/(marketing)/toolkit/page.tsx`:

```tsx
'use client'
import { useState } from 'react'

export default function ToolkitPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    const res = await fetch('/api/toolkit-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setState(res.ok ? 'done' : 'error')
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2">PM AI Toolkit</h1>
        <p className="text-zinc-400 mb-6">
          The exact AI build loop, tools, and prompts from Zero to Ship Module 1 — in one page.
          Free. No course purchase needed.
        </p>

        {state === 'done' ? (
          <div className="bg-green-950 border border-green-700 rounded-lg p-4 text-green-300">
            ✓ Check your email — toolkit is on its way.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500"
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-500 disabled:opacity-50"
            >
              {state === 'loading' ? 'Sending…' : 'Send me the toolkit'}
            </button>
            {state === 'error' && (
              <p className="text-red-400 text-sm">Something went wrong. Try again.</p>
            )}
          </form>
        )}

        <p className="text-xs text-zinc-600 mt-4">
          You'll also get the Zero to Ship weekly newsletter. Unsubscribe anytime.
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Add Beehiiv env vars to zero-to-shipped Vercel project**

```bash
cd /Users/ethanstuart/Projects/zero-to-shipped
vercel env add BEEHIIV_API_KEY production
vercel env add BEEHIIV_PUBLICATION_ID production
vercel --prod
```

- [ ] **Step 4: Verify page loads at zerotoship.app/toolkit**

Open https://zerotoship.app/toolkit — confirm form renders and submit works (check Beehiiv subscribers list for test email).

- [ ] **Step 5: Commit to zero-to-shipped**

```bash
git add src/app/\(marketing\)/toolkit src/app/api/toolkit-subscribe
git commit -m "feat: lead magnet opt-in page at /toolkit with Beehiiv subscribe"
```

---

## Success Criteria

| Check | How to verify |
|---|---|
| Cron generates posts | Trigger `/api/cron` manually, check admin calendar |
| Posts queue to Buffer | Check Buffer dashboard 24h after generation |
| LinkedIn posts from personal profile | Check LinkedIn after Tuesday 8am ET |
| Twitter/X posts at both slots | Check Twitter after 9am ET and 3pm ET |
| Beehiiv newsletter auto-publishes | Check Beehiiv sent tab Sunday |
| Edit window alert email fires | Cron runs, email arrives with post body |
| Buffer OAuth failure alerts | Revoke token, run cron, email arrives with re-auth link |
| Pause toggle works | Enable pause in Config, run cron, no posts generated |
| Voice notes steer content | Add context to Config, run cron, verify output references it |
| Toolkit opt-in works | Submit email at /toolkit, verify Beehiiv subscriber added |
