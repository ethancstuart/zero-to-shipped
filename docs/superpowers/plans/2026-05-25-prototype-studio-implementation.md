# Prototype Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Zero to Ship from a fixed 16-module paid course into Prototype Studio — an agent-native AI prototyping platform with four content pillars, multi-agent content pipeline, public ecosystem API, interactive sandboxes, knowledge graph, and community showcase.

**Architecture:** Hybrid content model — MDX files in the repo for all content (version-controlled, agent-friendly), Supabase for dynamic state (tools, users, analytics, pipeline runs). Multi-agent pipeline (Watcher → Analyst → Writer → Fact-Checker → Publisher) produces ecosystem briefs. Knowledge graph + pgvector power a graph-augmented RAG assistant. StackBlitz WebContainers provide zero-cost interactive sandboxes.

**Tech Stack:** Next.js 16, TypeScript strict, Tailwind v4, shadcn/ui, Supabase (Postgres + RLS + pgvector), next-mdx-remote, Claude API, Gemini API, StackBlitz SDK, Upstash Redis, Resend, Stripe (dormant), Vercel, Sentry, Vitest

**Spec:** `docs/superpowers/specs/2026-05-25-prototype-studio-design.md`

**Existing codebase:** Next.js 16.1.6, React 19.2.3, remark/rehype markdown pipeline, 16 JSON modules, 86 tests, Supabase auth + profiles + gamification tables.

---

## Phase 1: Foundation & Content Model

**Goal:** Working Prototype Studio site with MDX content pipeline, 4-pillar route structure, migrated content, new homepage and navigation. All existing functionality preserved.

**Deliverable:** Deployable site at the new domain with all existing content browsable under the new structure.

---

### Task 1.1: Install Dependencies and Update Configuration

**Files:**
- Modify: `package.json`
- Modify: `src/lib/constants.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Install new dependencies**

```bash
npm install next-mdx-remote gray-matter
```

- [ ] **Step 2: Update site configuration**

In `src/lib/constants.ts`, update the siteConfig:

```typescript
export const siteConfig = {
  name: 'Prototype Studio',
  description: 'Learn to build real products with AI. Watch sessions. Follow guides. Set up your own agent system.',
  url: 'https://prototypestudio.dev',
  ogImage: '/og-default.png',
  creator: 'Prototype Studio',
  keywords: [
    'AI prototyping',
    'vibe coding',
    'claude code',
    'cursor',
    'gemini cli',
    'AI agents',
    'build with AI',
  ],
}
```

- [ ] **Step 3: Update root layout metadata**

In `src/app/layout.tsx`, update the metadata export to reference the new siteConfig values. Update the `<title>`, `<meta description>`, and OG properties.

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: Clean build with no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/constants.ts src/app/layout.tsx
git commit -m "chore: rebrand to Prototype Studio, install MDX dependencies"
```

---

### Task 1.2: Content Type Definitions

**Files:**
- Create: `src/types/content.ts`

- [ ] **Step 1: Write content type tests**

Create `src/types/__tests__/content.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  type ContentFrontmatter,
  type Pillar,
  type ContentType,
  PILLARS,
  CONTENT_TYPES,
  DIFFICULTIES,
  FORMATS,
} from '@/types/content'

describe('Content types', () => {
  it('defines all four pillars', () => {
    expect(PILLARS).toEqual(['pulse', 'build', 'learn', 'system'])
  })

  it('defines all content types', () => {
    expect(CONTENT_TYPES).toContain('session')
    expect(CONTENT_TYPES).toContain('brief')
    expect(CONTENT_TYPES).toContain('lesson')
    expect(CONTENT_TYPES).toContain('guide')
    expect(CONTENT_TYPES).toContain('persona')
    expect(CONTENT_TYPES).toContain('challenge')
  })

  it('validates a complete frontmatter object shape', () => {
    const fm: ContentFrontmatter = {
      title: 'Test Content',
      slug: 'test-content',
      pillar: 'learn',
      type: 'lesson',
      format: 'written',
      tools: ['claude-code'],
      toolVersions: { 'claude-code': '1.0.32' },
      difficulty: 'beginner',
      estimatedMinutes: 30,
      tags: ['testing'],
      isPremium: false,
      isFeatured: false,
      status: 'published',
      publishedAt: '2026-05-25',
    }
    expect(fm.pillar).toBe('learn')
    expect(fm.tools).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/types/__tests__/content.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create content types**

Create `src/types/content.ts`:

```typescript
export const PILLARS = ['pulse', 'build', 'learn', 'system'] as const
export type Pillar = (typeof PILLARS)[number]

export const CONTENT_TYPES = [
  'brief', 'comparison', 'release',
  'session', 'challenge', 'walkthrough',
  'lesson', 'guide', 'pattern', 'resource',
  'persona', 'starter', 'playbook',
] as const
export type ContentType = (typeof CONTENT_TYPES)[number]

export const FORMATS = ['video', 'written', 'interactive', 'config'] as const
export type ContentFormat = (typeof FORMATS)[number]

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export const STATUSES = ['draft', 'published', 'archived'] as const
export type ContentStatus = (typeof STATUSES)[number]

export interface ContentFrontmatter {
  title: string
  slug: string
  pillar: Pillar
  type: ContentType
  format: ContentFormat
  tools: string[]
  toolVersions: Record<string, string>
  difficulty: Difficulty
  estimatedMinutes: number
  tags: string[]
  isPremium: boolean
  isFeatured: boolean
  status: ContentStatus
  videoUrl?: string
  sandboxTemplate?: string
  sandboxOpenFile?: string
  sandboxTerminalCommand?: string
  collection?: string
  position?: number
  publishedAt: string
}

export interface ContentListItem {
  frontmatter: ContentFrontmatter
  filePath: string
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/types/__tests__/content.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/content.ts src/types/__tests__/content.test.ts
git commit -m "feat: add content type definitions for 4-pillar content model"
```

---

### Task 1.3: MDX Content Loader

**Files:**
- Create: `src/lib/content/loader.ts`
- Create: `src/lib/content/__tests__/loader.test.ts`

- [ ] **Step 1: Write loader tests**

Create `src/lib/content/__tests__/loader.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import { listContentByPillar, getContentFrontmatter } from '@/lib/content/loader'

const CONTENT_DIR = path.join(process.cwd(), 'content')
const TEST_DIR = path.join(CONTENT_DIR, 'learn', 'lessons')
const TEST_FILE = path.join(TEST_DIR, 'test-lesson.mdx')

beforeAll(async () => {
  await fs.mkdir(TEST_DIR, { recursive: true })
  await fs.writeFile(TEST_FILE, `---
title: "Test Lesson"
slug: test-lesson
pillar: learn
type: lesson
format: written
tools: [claude-code]
toolVersions:
  claude-code: "1.0.32"
difficulty: beginner
estimatedMinutes: 15
tags: [testing]
isPremium: false
isFeatured: false
status: published
publishedAt: "2026-05-25"
---

# Test Lesson

This is a test lesson with **bold** and \`code\`.
`)
})

describe('getContentFrontmatter', () => {
  it('parses frontmatter from an MDX file', async () => {
    const fm = await getContentFrontmatter(TEST_FILE)
    expect(fm.title).toBe('Test Lesson')
    expect(fm.pillar).toBe('learn')
    expect(fm.tools).toEqual(['claude-code'])
    expect(fm.status).toBe('published')
  })
})

describe('listContentByPillar', () => {
  it('returns published content for a pillar', async () => {
    const items = await listContentByPillar('learn')
    const testItem = items.find(i => i.frontmatter.slug === 'test-lesson')
    expect(testItem).toBeDefined()
    expect(testItem!.frontmatter.title).toBe('Test Lesson')
  })

  it('filters by content type', async () => {
    const items = await listContentByPillar('learn', { type: 'lesson' })
    expect(items.every(i => i.frontmatter.type === 'lesson')).toBe(true)
  })

  it('excludes draft content', async () => {
    const draftPath = path.join(TEST_DIR, 'draft-lesson.mdx')
    await fs.writeFile(draftPath, `---
title: "Draft"
slug: draft-lesson
pillar: learn
type: lesson
format: written
tools: []
toolVersions: {}
difficulty: beginner
estimatedMinutes: 10
tags: []
isPremium: false
isFeatured: false
status: draft
publishedAt: "2026-05-25"
---
Draft content.
`)
    const items = await listContentByPillar('learn')
    expect(items.find(i => i.frontmatter.slug === 'draft-lesson')).toBeUndefined()
    await fs.unlink(draftPath)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/content/__tests__/loader.test.ts
```

Expected: FAIL — loader module not found.

- [ ] **Step 3: Implement content loader**

Create `src/lib/content/loader.ts`:

```typescript
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import type { ContentFrontmatter, ContentListItem, Pillar } from '@/types/content'

const CONTENT_DIR = path.join(process.cwd(), 'content')

async function walkDir(dir: string): Promise<string[]> {
  const results: string[] = []
  let entries: Awaited<ReturnType<typeof fs.readdir>>
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return results
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...(await walkDir(fullPath)))
    } else if (entry.name.endsWith('.mdx')) {
      results.push(fullPath)
    }
  }
  return results
}

export async function getContentFrontmatter(
  filePath: string,
): Promise<ContentFrontmatter> {
  const raw = await fs.readFile(filePath, 'utf-8')
  const { data } = matter(raw)
  return data as ContentFrontmatter
}

export async function getContentBySlug(
  pillar: Pillar,
  slug: string,
  components: Record<string, React.ComponentType<any>> = {},
) {
  const pillarDir = path.join(CONTENT_DIR, pillar)
  const files = await walkDir(pillarDir)
  const filePath = files.find((f) => {
    const basename = path.basename(f, '.mdx')
    return basename === slug
  })

  if (!filePath) return null

  const raw = await fs.readFile(filePath, 'utf-8')
  const { content: mdxSource, data } = matter(raw)
  const frontmatter = data as ContentFrontmatter

  if (frontmatter.status !== 'published') return null

  const { content } = await compileMDX<ContentFrontmatter>({
    source: mdxSource,
    components,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  })

  return { frontmatter, content }
}

export async function listContentByPillar(
  pillar: Pillar,
  options?: {
    type?: string
    featured?: boolean
    limit?: number
    tag?: string
  },
): Promise<ContentListItem[]> {
  const pillarDir = path.join(CONTENT_DIR, pillar)
  const files = await walkDir(pillarDir)

  const items: ContentListItem[] = await Promise.all(
    files.map(async (filePath) => {
      const frontmatter = await getContentFrontmatter(filePath)
      return { frontmatter, filePath }
    }),
  )

  let filtered = items.filter((i) => i.frontmatter.status === 'published')

  if (options?.type) {
    filtered = filtered.filter((i) => i.frontmatter.type === options.type)
  }
  if (options?.featured) {
    filtered = filtered.filter((i) => i.frontmatter.isFeatured)
  }
  if (options?.tag) {
    filtered = filtered.filter((i) => i.frontmatter.tags.includes(options.tag!))
  }

  filtered.sort(
    (a, b) =>
      new Date(b.frontmatter.publishedAt).getTime() -
      new Date(a.frontmatter.publishedAt).getTime(),
  )

  if (options?.limit) {
    filtered = filtered.slice(0, options.limit)
  }

  return filtered
}

export async function listAllContent(): Promise<ContentListItem[]> {
  const allItems: ContentListItem[] = []
  for (const pillar of ['pulse', 'build', 'learn', 'system'] as const) {
    const items = await listContentByPillar(pillar)
    allItems.push(...items)
  }
  allItems.sort(
    (a, b) =>
      new Date(b.frontmatter.publishedAt).getTime() -
      new Date(a.frontmatter.publishedAt).getTime(),
  )
  return allItems
}

export async function getContentSlugs(pillar: Pillar): Promise<string[]> {
  const pillarDir = path.join(CONTENT_DIR, pillar)
  const files = await walkDir(pillarDir)
  return files.map((f) => path.basename(f, '.mdx'))
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/lib/content/__tests__/loader.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/loader.ts src/lib/content/__tests__/loader.test.ts
git commit -m "feat: MDX content loader with frontmatter parsing and pillar listing"
```

---

### Task 1.4: Custom MDX Components

**Files:**
- Create: `src/components/mdx/index.ts`
- Create: `src/components/mdx/callout.tsx`
- Create: `src/components/mdx/code-block.tsx`
- Create: `src/components/mdx/tool-badge.tsx`

- [ ] **Step 1: Create Callout component**

Create `src/components/mdx/callout.tsx`:

```tsx
interface CalloutProps {
  type?: 'info' | 'warning' | 'tip' | 'danger'
  title?: string
  children: React.ReactNode
}

const styles = {
  info: 'border-blue-500/30 bg-blue-500/5 text-blue-200',
  warning: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-200',
  tip: 'border-green-500/30 bg-green-500/5 text-green-200',
  danger: 'border-red-500/30 bg-red-500/5 text-red-200',
} as const

export function Callout({ type = 'info', title, children }: CalloutProps) {
  return (
    <div className={`my-6 rounded-lg border-l-4 p-4 ${styles[type]}`}>
      {title && <p className="mb-2 font-semibold">{title}</p>}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}
```

- [ ] **Step 2: Create ToolBadge component**

Create `src/components/mdx/tool-badge.tsx`:

```tsx
interface ToolBadgeProps {
  name: string
  version?: string
}

export function ToolBadge({ name, version }: ToolBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
      <span>{name}</span>
      {version && (
        <span className="text-white/40">v{version}</span>
      )}
    </span>
  )
}
```

- [ ] **Step 3: Create CodeBlock wrapper**

Create `src/components/mdx/code-block.tsx`:

```tsx
import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  children: string
  language?: string
  filename?: string
}

export async function CodeBlock({
  children,
  language = 'typescript',
  filename,
}: CodeBlockProps) {
  const html = await codeToHtml(children.trim(), {
    lang: language,
    theme: 'github-dark',
  })

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-white/10">
      {filename && (
        <div className="border-b border-white/10 bg-white/5 px-4 py-2 text-xs text-white/50">
          {filename}
        </div>
      )}
      <div
        className="overflow-x-auto p-4 text-sm [&_pre]:!bg-transparent [&_code]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
```

- [ ] **Step 4: Create MDX component registry**

Create `src/components/mdx/index.ts`:

```typescript
import { Callout } from './callout'
import { ToolBadge } from './tool-badge'
import { CodeBlock } from './code-block'

export const mdxComponents: Record<string, React.ComponentType<any>> = {
  Callout,
  ToolBadge,
  CodeBlock,
  // Stubs for Phase 4 components — render nothing until implemented
  Sandbox: () => null,
  ArenaCompare: () => null,
  AgentReplay: () => null,
  CostTicker: () => null,
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/mdx/
git commit -m "feat: custom MDX components — Callout, ToolBadge, CodeBlock"
```

---

### Task 1.5: Content Directory Structure and Initial Migration

**Files:**
- Create: `content/` directory tree
- Create: MDX files for migrated content

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p content/{pulse/{briefs,comparisons,releases},build/{sessions,challenges,walkthroughs},learn/{lessons,guides,design,patterns,resources},system/{playbook,personas,starters},collections}
```

- [ ] **Step 2: Migrate Module 1 as the pattern**

Create `content/learn/lessons/setup-and-first-build.mdx`:

```mdx
---
title: "Setup & First Build"
slug: setup-and-first-build
pillar: learn
type: lesson
format: written
tools: [claude-code, cursor]
toolVersions:
  claude-code: "1.0.32"
  cursor: "0.48"
difficulty: beginner
estimatedMinutes: 60
tags: [setup, getting-started, first-build]
isPremium: false
isFeatured: true
status: published
publishedAt: "2026-03-15"
---

<!-- Content migrated from Module 1. Convert the existing HTML content
     from src/content/modules/01.json back to markdown/MDX format.
     Replace tool-specific blockquotes with <Callout> components.
     Replace inline code blocks with proper MDX code fences. -->
```

Note: The actual content body for each module must be extracted from the precompiled JSON files in `src/content/modules/NN.json` (which contain `contentHtml`) or from the original markdown source in `content-source/`. Use the original markdown files from `content-source/` when available, as they're the canonical source. Add frontmatter and convert any tool-specific blockquote wrappers to `<Callout>` components.

- [ ] **Step 3: Migrate remaining modules (2-16)**

Repeat the pattern from Step 2 for each module. File mapping:

| Module | → MDX File | isPremium |
|--------|-----------|-----------|
| 01: Setup & First Build | `learn/lessons/setup-and-first-build.mdx` | false |
| 02: Prompt Engineering | `learn/lessons/prompt-engineering.mdx` | false |
| 03: How Code Works | `learn/lessons/how-code-works.mdx` | false |
| 04: Terminal & CLI | `learn/lessons/terminal-and-cli.mdx` | false |
| 05: Version Control with Git | `learn/lessons/version-control-git.mdx` | false |
| 06: Blueprints & Architecture | `learn/lessons/blueprints-architecture.mdx` | false |
| 07: Brainstorming with AI | `learn/lessons/brainstorming-with-ai.mdx` | false |
| 08: Planning & Research | `learn/lessons/planning-and-research.mdx` | false |
| 09: Interactive Tools | `learn/lessons/interactive-tools.mdx` | false |
| 10: Decks & Diagrams | `learn/lessons/decks-and-diagrams.mdx` | false |
| 11: UI Design Principles | `learn/lessons/ui-design-principles.mdx` | false |
| 12: Data Products | `learn/lessons/data-products.mdx` | false |
| 13: Automations & Workflows | `learn/lessons/automations-workflows.mdx` | false |
| 14: Docs, Security, Testing | `learn/lessons/docs-security-testing.mdx` | false |
| 15: Collaboration | `learn/lessons/collaboration-with-engineers.mdx` | false |
| 16: Capstone | `learn/lessons/capstone.mdx` | false |

All content is free-first per the spec. Set `isPremium: false` for all.

- [ ] **Step 4: Migrate library resources**

Migrate each library page to MDX. Extract content from the existing React components at `src/app/(marketing)/library/*/page.tsx`:

| Source | → MDX File |
|--------|-----------|
| `library/ai-workflow-os/page.tsx` | `learn/resources/ai-workflow-os.mdx` |
| `library/builder-tools/page.tsx` | `learn/resources/builder-tools.mdx` |
| `library/claude-md-templates/page.tsx` | `learn/resources/claude-md-templates.mdx` |
| `library/debugging/page.tsx` | `learn/resources/debugging.mdx` |
| `library/dev-environment/page.tsx` | `learn/resources/dev-environment.mdx` |
| `library/prompt-patterns/page.tsx` | `learn/resources/prompt-patterns.mdx` |
| `library/prompts/page.tsx` | `learn/resources/prompts.mdx` |

- [ ] **Step 5: Migrate guides**

| Source | → MDX File |
|--------|-----------|
| `guides/agent-builder/page.tsx` | `learn/guides/agent-builder.mdx` |
| `guides/claude-code-101/page.tsx` | `learn/guides/claude-code-101.mdx` |
| `guides/git-101/page.tsx` | `learn/guides/git-101.mdx` |
| `guides/sql-for-product-managers/page.tsx` | `learn/guides/sql-for-product-managers.mdx` |

- [ ] **Step 6: Create initial System pillar content**

Create `content/system/playbook/getting-started-with-agents.mdx`:

```mdx
---
title: "Getting Started with AI Agents"
slug: getting-started-with-agents
pillar: system
type: playbook
format: written
tools: [claude-code]
toolVersions:
  claude-code: "1.0.32"
difficulty: beginner
estimatedMinutes: 20
tags: [agents, getting-started, claude-code, personas]
isPremium: false
isFeatured: true
status: published
publishedAt: "2026-05-25"
---

# Getting Started with AI Agents

Learn how to set up AI agents as your operating system for building software.

## What is an Agent System?

An agent system is a structured approach to using AI coding tools where you define
specialized personas — each with a specific role, expertise, and set of instructions.

## The Core Concept

Instead of using a single generic AI assistant, you create a team of specialized agents...
```

- [ ] **Step 7: Create seed Pulse content**

Create `content/pulse/briefs/welcome-to-prototype-studio.mdx`:

```mdx
---
title: "Welcome to Prototype Studio"
slug: welcome-to-prototype-studio
pillar: pulse
type: brief
format: written
tools: [claude-code, cursor, gemini-cli]
toolVersions: {}
difficulty: beginner
estimatedMinutes: 5
tags: [announcement, launch]
isPremium: false
isFeatured: true
status: published
publishedAt: "2026-05-25"
---

# Welcome to Prototype Studio

Prototype Studio is the platform for anyone who wants to build real products with AI.

## What You'll Find Here

### Pulse — Ecosystem Intelligence
Stay current with what's happening across AI coding tools...

### Build — Watch and Follow Along
Vibe-coding sessions, build challenges, and interactive sandboxes...

### Learn — Pick Up Skills
Guides, lessons, design patterns, and resources...

### System — Your AI Operating System
The agent playbook, persona configurations, and methodology...
```

- [ ] **Step 8: Commit content directory**

```bash
git add content/
git commit -m "feat: content directory structure with migrated lessons, guides, resources"
```

---

### Task 1.6: Pillar Route Structure

**Files:**
- Create: `src/app/(marketing)/pulse/page.tsx`
- Create: `src/app/(marketing)/pulse/[slug]/page.tsx`
- Create: `src/app/(marketing)/build/page.tsx`
- Create: `src/app/(marketing)/build/[slug]/page.tsx`
- Create: `src/app/(marketing)/learn/page.tsx`
- Create: `src/app/(marketing)/learn/[slug]/page.tsx`
- Create: `src/app/(marketing)/system/page.tsx`
- Create: `src/app/(marketing)/system/[slug]/page.tsx`

- [ ] **Step 1: Create shared content card component**

Create `src/components/content/content-card.tsx`:

```tsx
import Link from 'next/link'
import type { ContentFrontmatter } from '@/types/content'

interface ContentCardProps {
  content: ContentFrontmatter
}

const difficultyColors = {
  beginner: 'text-green-400 border-green-400/20 bg-green-400/5',
  intermediate: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5',
  advanced: 'text-red-400 border-red-400/20 bg-red-400/5',
} as const

const formatIcons = {
  video: '▶',
  written: '📄',
  interactive: '⚡',
  config: '⚙',
} as const

export function ContentCard({ content }: ContentCardProps) {
  const href = `/${content.pillar}/${content.slug}`

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm">{formatIcons[content.format]}</span>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs ${difficultyColors[content.difficulty]}`}
        >
          {content.difficulty}
        </span>
        {content.estimatedMinutes > 0 && (
          <span className="text-xs text-white/40">
            {content.estimatedMinutes} min
          </span>
        )}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-white/90">
        {content.title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {content.tools.slice(0, 3).map((tool) => (
          <span
            key={tool}
            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/50"
          >
            {tool}
          </span>
        ))}
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Create pillar index page — Learn (the pattern)**

Create `src/app/(marketing)/learn/page.tsx`:

```tsx
import { listContentByPillar } from '@/lib/content/loader'
import { ContentCard } from '@/components/content/content-card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn — Prototype Studio',
  description: 'Guides, lessons, design patterns, and resources for building with AI.',
}

export default async function LearnPage() {
  const lessons = await listContentByPillar('learn', { type: 'lesson' })
  const guides = await listContentByPillar('learn', { type: 'guide' })
  const resources = await listContentByPillar('learn', { type: 'resource' })
  const patterns = await listContentByPillar('learn', { type: 'pattern' })

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">
          Learn
        </h1>
        <p className="max-w-2xl text-lg text-white/60">
          Pick up the skills you need. Lessons, guides, design patterns, and
          resources — all organized so you can learn at your own pace.
        </p>
      </div>

      {lessons.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Lessons</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((item) => (
              <ContentCard
                key={item.frontmatter.slug}
                content={item.frontmatter}
              />
            ))}
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Guides</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((item) => (
              <ContentCard
                key={item.frontmatter.slug}
                content={item.frontmatter}
              />
            ))}
          </div>
        </section>
      )}

      {resources.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Resources</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((item) => (
              <ContentCard
                key={item.frontmatter.slug}
                content={item.frontmatter}
              />
            ))}
          </div>
        </section>
      )}

      {patterns.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Patterns</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patterns.map((item) => (
              <ContentCard
                key={item.frontmatter.slug}
                content={item.frontmatter}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create pillar detail page — Learn/[slug] (the pattern)**

Create `src/app/(marketing)/learn/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getContentBySlug, getContentSlugs } from '@/lib/content/loader'
import { mdxComponents } from '@/components/mdx'
import { ToolBadge } from '@/components/mdx/tool-badge'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getContentSlugs('learn')
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getContentBySlug('learn', slug, mdxComponents)
  if (!result) return { title: 'Not Found' }
  return {
    title: `${result.frontmatter.title} — Prototype Studio`,
    description: `${result.frontmatter.difficulty} · ${result.frontmatter.estimatedMinutes} min · ${result.frontmatter.tools.join(', ')}`,
  }
}

export default async function LearnDetailPage({ params }: Props) {
  const { slug } = await params
  const result = await getContentBySlug('learn', slug, mdxComponents)

  if (!result) notFound()

  const { frontmatter, content } = result

  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/50">
            {frontmatter.type}
          </span>
          <span className="text-xs text-white/40">
            {frontmatter.difficulty} · {frontmatter.estimatedMinutes} min
          </span>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">
          {frontmatter.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          {frontmatter.tools.map((tool) => (
            <ToolBadge
              key={tool}
              name={tool}
              version={frontmatter.toolVersions[tool]}
            />
          ))}
        </div>
      </header>

      <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-blue-400 prose-code:rounded prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-pre:border prose-pre:border-white/10">
        {content}
      </div>
    </article>
  )
}
```

- [ ] **Step 4: Create remaining pillar index pages**

Create `src/app/(marketing)/pulse/page.tsx` — same pattern as Learn, sections for briefs, comparisons, releases.

Create `src/app/(marketing)/build/page.tsx` — sections for sessions, challenges, walkthroughs.

Create `src/app/(marketing)/system/page.tsx` — sections for playbook, personas, starters.

Each follows the same pattern as Learn: import `listContentByPillar`, filter by type, render `ContentCard` grid.

- [ ] **Step 5: Create remaining pillar detail pages**

Create `src/app/(marketing)/pulse/[slug]/page.tsx` — same pattern as Learn/[slug], with `pillar: 'pulse'`.

Create `src/app/(marketing)/build/[slug]/page.tsx` — same pattern, `pillar: 'build'`.

Create `src/app/(marketing)/system/[slug]/page.tsx` — same pattern, `pillar: 'system'`.

- [ ] **Step 6: Verify routes build**

```bash
npm run build
```

Expected: Clean build. All pillar routes should appear in the build output.

- [ ] **Step 7: Commit**

```bash
git add src/app/(marketing)/pulse/ src/app/(marketing)/build/ src/app/(marketing)/learn/ src/app/(marketing)/system/ src/components/content/
git commit -m "feat: 4-pillar route structure with content listing and detail pages"
```

---

### Task 1.7: Navigation Update

**Files:**
- Modify: `src/components/layout/marketing-nav.tsx`
- Modify: `src/app/(marketing)/layout.tsx`

- [ ] **Step 1: Update marketing nav**

Replace the navigation items in `src/components/layout/marketing-nav.tsx` with the 4 pillars:

```typescript
const navItems = [
  { label: 'Pulse', href: '/pulse', description: "What's happening in AI coding" },
  { label: 'Build', href: '/build', description: 'Watch and follow along' },
  { label: 'Learn', href: '/learn', description: 'Pick up skills' },
  { label: 'System', href: '/system', description: 'AI agent playbook' },
]
```

Keep the existing login button and theme toggle. Update the logo text from "Zero to Ship" to "Prototype Studio".

- [ ] **Step 2: Update marketing layout**

In `src/app/(marketing)/layout.tsx`, update any title or brand references from "Zero to Ship" to "Prototype Studio".

- [ ] **Step 3: Verify navigation**

```bash
npm run dev
```

Visit localhost, confirm 4 pillar links appear in nav and route correctly.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/marketing-nav.tsx src/app/(marketing)/layout.tsx
git commit -m "feat: update navigation with 4-pillar structure"
```

---

### Task 1.8: Homepage Redesign

**Files:**
- Modify: `src/app/(marketing)/page.tsx`
- Create: `src/components/marketing/pillar-section.tsx`
- Create: `src/components/marketing/ecosystem-preview.tsx`

- [ ] **Step 1: Create PillarSection component**

Create `src/components/marketing/pillar-section.tsx`:

```tsx
import Link from 'next/link'
import { ContentCard } from '@/components/content/content-card'
import type { ContentListItem } from '@/types/content'

interface PillarSectionProps {
  title: string
  description: string
  href: string
  items: ContentListItem[]
}

export function PillarSection({
  title,
  description,
  href,
  items,
}: PillarSectionProps) {
  return (
    <section className="mb-20">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">{title}</h2>
          <p className="text-white/50">{description}</p>
        </div>
        <Link
          href={href}
          className="text-sm text-white/40 transition-colors hover:text-white/70"
        >
          View all →
        </Link>
      </div>
      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((item) => (
            <ContentCard
              key={item.frontmatter.slug}
              content={item.frontmatter}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-white/30">
          Content coming soon
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Rewrite homepage**

Replace `src/app/(marketing)/page.tsx`:

```tsx
import { listContentByPillar, listAllContent } from '@/lib/content/loader'
import { PillarSection } from '@/components/marketing/pillar-section'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prototype Studio — Build Real Products with AI',
  description:
    'Learn to build real products with AI. Watch sessions. Follow guides. Set up your own agent system.',
}

export default async function HomePage() {
  const [pulseItems, buildItems, learnItems, systemItems, allItems] =
    await Promise.all([
      listContentByPillar('pulse', { limit: 3 }),
      listContentByPillar('build', { limit: 3 }),
      listContentByPillar('learn', { featured: true, limit: 3 }),
      listContentByPillar('system', { limit: 3 }),
      listAllContent(),
    ])

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="py-24 text-center">
        <h1 className="mx-auto mb-6 max-w-3xl text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Build real products with AI
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg text-white/50">
          Watch sessions. Follow guides. Set up your own agent system.
          Everything you need to go from idea to shipped product.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="/learn"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            Start learning
          </a>
          <a
            href="/pulse"
            className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
          >
            See what's new
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <section className="mb-20 grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-6 sm:grid-cols-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">9</div>
          <div className="text-xs text-white/40">AI tools tracked</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{allItems.length}</div>
          <div className="text-xs text-white/40">resources</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">4</div>
          <div className="text-xs text-white/40">content pillars</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">Free</div>
          <div className="text-xs text-white/40">to start</div>
        </div>
      </section>

      {/* Pillar sections */}
      <PillarSection
        title="Pulse"
        description="What's happening across AI coding tools"
        href="/pulse"
        items={pulseItems}
      />
      <PillarSection
        title="Build"
        description="Watch someone take an idea to a working app"
        href="/build"
        items={buildItems}
      />
      <PillarSection
        title="Learn"
        description="Pick up the skills you need"
        href="/learn"
        items={learnItems}
      />
      <PillarSection
        title="System"
        description="Set up AI agents as your operating system"
        href="/system"
        items={systemItems}
      />
    </div>
  )
}
```

- [ ] **Step 3: Remove old marketing components**

Delete or archive the old ZTS-specific marketing components that are no longer used:
- `src/components/marketing/hero-section.tsx`
- `src/components/marketing/what-you-build-strip.tsx`
- `src/components/marketing/free-content-hub.tsx`
- `src/components/marketing/curriculum-section.tsx`
- `src/components/marketing/pricing-section.tsx`
- `src/components/marketing/role-tracks-section.tsx`
- `src/components/marketing/final-cta-section.tsx`

Keep the auth-error-banner if it's used elsewhere.

- [ ] **Step 4: Verify homepage**

```bash
npm run dev
```

Visit localhost. Confirm: hero, stats bar, 4 pillar sections with content cards (or "coming soon" placeholders). Click through to pillar pages and content detail pages.

- [ ] **Step 5: Commit**

```bash
git add src/app/(marketing)/page.tsx src/components/marketing/
git commit -m "feat: homepage redesign with ecosystem dashboard and 4-pillar sections"
```

---

### Task 1.9: Global Rebrand Pass

**Files:**
- All files containing "Zero to Ship" or "zerotoship"

- [ ] **Step 1: Find and replace brand references**

```bash
grep -r "Zero to Ship\|zero-to-ship\|zerotoship\|ZeroToShip" src/ --include="*.tsx" --include="*.ts" -l
```

Update all references:
- "Zero to Ship" → "Prototype Studio"
- "zerotoship.app" → "prototypestudio.dev" (or chosen domain)
- Logo text, footer, email templates, OG images, sitemap

- [ ] **Step 2: Update email templates**

Search Resend templates in `src/app/api/` for brand references and update.

- [ ] **Step 3: Update sitemap**

In `src/app/sitemap.ts`, add routes for the 4 pillars and update the base URL.

- [ ] **Step 4: Run full test suite**

```bash
npx vitest run
```

Expected: All existing tests pass (some may need minor updates for changed brand text).

- [ ] **Step 5: Build verification**

```bash
npm run build
```

Expected: Clean build.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: complete rebrand — Zero to Ship → Prototype Studio"
```

---

### Task 1.10: Phase 1 Cleanup and Redirects

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Add redirects for old routes**

In `next.config.ts`, add redirects so old URLs still work:

```typescript
async redirects() {
  return [
    { source: '/modules', destination: '/learn', permanent: true },
    { source: '/modules/:slug', destination: '/learn/:slug', permanent: true },
    { source: '/library', destination: '/learn', permanent: true },
    { source: '/library/:slug', destination: '/learn/:slug', permanent: true },
    { source: '/guides', destination: '/learn', permanent: true },
    { source: '/guides/:slug', destination: '/learn/:slug', permanent: true },
    { source: '/agents', destination: '/system', permanent: true },
    // Keep existing redirects
    { source: '/waitlist', destination: '/pricing', permanent: false },
    { source: '/resources', destination: '/learn', permanent: true },
  ]
},
```

- [ ] **Step 2: Verify redirects**

```bash
npm run dev
```

Visit `/modules` — should redirect to `/learn`. Visit `/library` — same. Visit `/guides/claude-code-101` — should redirect to `/learn/claude-code-101`.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: add redirects from old ZTS routes to new pillar structure"
```

---

## Phase 2: Database & Tool Intelligence Engine

**Goal:** Supabase tables for tool tracking, source adapters for 9 AI tools, automated intelligence cron, tool profile pages, ecosystem comparison matrix. The Pulse pillar comes alive with real data.

**Deliverable:** Tool intelligence engine running on a 6-hour cron, tracking releases across 9 tools. Comparison matrix and tool profile pages populated with real capability data.

---

### Task 2.1: Database Schema — Tool Intelligence Tables

**Files:**
- Create: `supabase/migrations/009_tool_intelligence.sql`

- [ ] **Step 1: Write migration**

Create `supabase/migrations/009_tool_intelligence.sql`:

```sql
-- Tool registry
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
  scraper_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Release tracking
CREATE TABLE tool_releases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  version text NOT NULL,
  release_date timestamptz NOT NULL,
  summary text,
  significance text CHECK (significance IN ('major','minor','patch')),
  raw_changelog text,
  source_url text,
  capabilities text[],
  response_hash text,
  brief_status text DEFAULT 'pending' CHECK (brief_status IN ('pending','draft','published','skipped')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tool_id, version)
);

-- Capability comparison matrix
CREATE TABLE ecosystem_status (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  capability text NOT NULL,
  category text NOT NULL,
  supported boolean DEFAULT false,
  maturity text CHECK (maturity IN ('experimental','beta','stable','mature')),
  quality_score integer CHECK (quality_score BETWEEN 1 AND 5),
  notes text,
  last_verified timestamptz DEFAULT now(),
  verified_by text DEFAULT 'manual' CHECK (verified_by IN ('automated','manual')),
  UNIQUE(tool_id, capability)
);

-- Capability change history
CREATE TABLE ecosystem_status_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ecosystem_status_id uuid REFERENCES ecosystem_status(id) ON DELETE CASCADE NOT NULL,
  old_supported boolean,
  old_quality_score integer,
  new_supported boolean,
  new_quality_score integer,
  changed_at timestamptz DEFAULT now()
);

-- Content index (cache of MDX frontmatter for dynamic queries)
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

-- Content analytics (aggregated engagement metrics)
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

ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read analytics" ON content_analytics FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_content_analytics_slug ON content_analytics(content_slug, period_start DESC);
CREATE INDEX idx_tool_releases_tool_date ON tool_releases(tool_id, release_date DESC);
CREATE INDEX idx_ecosystem_status_tool ON ecosystem_status(tool_id);
CREATE INDEX idx_ecosystem_status_capability ON ecosystem_status(capability);
CREATE INDEX idx_content_index_pillar ON content_index(pillar, status, published_at DESC);
CREATE INDEX idx_content_index_freshness ON content_index(freshness) WHERE freshness != 'current';

-- RLS
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_index ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read tools" ON tools FOR SELECT USING (true);
CREATE POLICY "Public read releases" ON tool_releases FOR SELECT USING (true);
CREATE POLICY "Public read ecosystem" ON ecosystem_status FOR SELECT USING (true);
CREATE POLICY "Public read history" ON ecosystem_status_history FOR SELECT USING (true);
CREATE POLICY "Public read content_index" ON content_index FOR SELECT USING (true);
```

- [ ] **Step 2: Apply migration**

```bash
npx supabase db push
```

Or if using Supabase CLI locally:

```bash
npx supabase migration up
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/009_tool_intelligence.sql
git commit -m "feat: database schema for tool intelligence engine"
```

---

### Task 2.2: Tool Data Seed

**Files:**
- Create: `scripts/seed-tools.ts`

- [ ] **Step 1: Create seed script**

Create `scripts/seed-tools.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const tools = [
  {
    name: 'Claude Code',
    slug: 'claude-code',
    website: 'https://claude.ai/code',
    github_repo: 'anthropics/claude-code',
    changelog_url: 'https://github.com/anthropics/claude-code/releases',
    category: 'cli' as const,
    description: "Anthropic's agentic coding tool for the terminal",
    scraper_config: { type: 'github_releases', owner: 'anthropics', repo: 'claude-code' },
  },
  {
    name: 'Cursor',
    slug: 'cursor',
    website: 'https://cursor.com',
    changelog_url: 'https://cursor.com/changelog',
    category: 'ide' as const,
    description: 'AI-first code editor built on VS Code',
    scraper_config: { type: 'html_scrape', url: 'https://cursor.com/changelog', selector: 'article' },
  },
  {
    name: 'Gemini CLI',
    slug: 'gemini-cli',
    website: 'https://github.com/google-gemini/gemini-cli',
    github_repo: 'google-gemini/gemini-cli',
    changelog_url: 'https://github.com/google-gemini/gemini-cli/releases',
    category: 'cli' as const,
    description: "Google's AI coding agent for the terminal",
    scraper_config: { type: 'github_releases', owner: 'google-gemini', repo: 'gemini-cli' },
  },
  {
    name: 'Codex',
    slug: 'codex',
    website: 'https://github.com/openai/codex',
    github_repo: 'openai/codex',
    changelog_url: 'https://github.com/openai/codex/releases',
    category: 'cli' as const,
    description: "OpenAI's coding agent",
    scraper_config: { type: 'github_releases', owner: 'openai', repo: 'codex' },
  },
  {
    name: 'v0',
    slug: 'v0',
    website: 'https://v0.dev',
    changelog_url: 'https://v0.dev/changelog',
    category: 'platform' as const,
    description: "Vercel's AI UI generation tool",
    scraper_config: { type: 'html_scrape', url: 'https://v0.dev/changelog', selector: 'article' },
  },
  {
    name: 'Windsurf',
    slug: 'windsurf',
    website: 'https://windsurf.com',
    changelog_url: 'https://windsurf.com/changelog',
    category: 'ide' as const,
    description: 'AI-powered IDE by Codeium',
    scraper_config: { type: 'html_scrape', url: 'https://windsurf.com/changelog', selector: 'article' },
  },
  {
    name: 'Bolt',
    slug: 'bolt',
    website: 'https://bolt.new',
    category: 'platform' as const,
    description: 'AI-powered full-stack web development platform',
    scraper_config: { type: 'html_scrape', url: 'https://bolt.new/changelog', selector: 'article' },
  },
  {
    name: 'Lovable',
    slug: 'lovable',
    website: 'https://lovable.dev',
    changelog_url: 'https://lovable.dev/changelog',
    category: 'platform' as const,
    description: 'AI software engineer for building web apps',
    scraper_config: { type: 'html_scrape', url: 'https://lovable.dev/changelog', selector: 'article' },
  },
  {
    name: 'Replit',
    slug: 'replit',
    website: 'https://replit.com',
    changelog_url: 'https://blog.replit.com/feed.xml',
    category: 'platform' as const,
    description: 'AI-powered collaborative development platform',
    scraper_config: { type: 'rss', url: 'https://blog.replit.com/feed.xml' },
  },
]

async function seed() {
  for (const tool of tools) {
    const { error } = await supabase.from('tools').upsert(tool, { onConflict: 'slug' })
    if (error) console.error(`Error seeding ${tool.slug}:`, error)
    else console.log(`Seeded: ${tool.name}`)
  }
}

seed()
```

- [ ] **Step 2: Run seed**

```bash
npx tsx scripts/seed-tools.ts
```

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-tools.ts
git commit -m "feat: tool seed script with 9 AI coding tools"
```

---

### Task 2.3: Source Adapter System

**Files:**
- Create: `src/lib/intelligence/adapters/types.ts`
- Create: `src/lib/intelligence/adapters/github-releases.ts`
- Create: `src/lib/intelligence/adapters/html-scraper.ts`
- Create: `src/lib/intelligence/adapters/rss.ts`
- Create: `src/lib/intelligence/adapters/registry.ts`
- Create: `src/lib/intelligence/__tests__/adapters.test.ts`

- [ ] **Step 1: Define adapter interface**

Create `src/lib/intelligence/adapters/types.ts`:

```typescript
export interface RawRelease {
  version: string
  releaseDate: string
  rawChangelog: string
  sourceUrl: string
}

export interface AdapterConfig {
  type: 'github_releases' | 'html_scrape' | 'rss'
  [key: string]: unknown
}

export interface SourceAdapter {
  fetch(config: AdapterConfig): Promise<RawRelease[]>
}
```

- [ ] **Step 2: Implement GitHub Releases adapter**

Create `src/lib/intelligence/adapters/github-releases.ts`:

```typescript
import type { RawRelease, AdapterConfig, SourceAdapter } from './types'

interface GitHubReleaseResponse {
  tag_name: string
  published_at: string
  body: string
  html_url: string
}

export const githubReleasesAdapter: SourceAdapter = {
  async fetch(config: AdapterConfig): Promise<RawRelease[]> {
    const { owner, repo } = config as { owner: string; repo: string }
    const url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=5`

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} for ${owner}/${repo}`)
    }

    const releases: GitHubReleaseResponse[] = await response.json()

    return releases.map((r) => ({
      version: r.tag_name.replace(/^v/, ''),
      releaseDate: r.published_at,
      rawChangelog: r.body || '',
      sourceUrl: r.html_url,
    }))
  },
}
```

- [ ] **Step 3: Implement HTML scraper adapter**

Create `src/lib/intelligence/adapters/html-scraper.ts`:

```typescript
import type { RawRelease, AdapterConfig, SourceAdapter } from './types'

export const htmlScraperAdapter: SourceAdapter = {
  async fetch(config: AdapterConfig): Promise<RawRelease[]> {
    const { url, selector } = config as { url: string; selector: string }

    const response = await fetch(url, { next: { revalidate: 0 } })
    if (!response.ok) {
      throw new Error(`Scrape failed: ${response.status} for ${url}`)
    }

    const html = await response.text()

    // Extract text content from HTML
    // For V1, extract the raw HTML body for Claude to parse
    // A more sophisticated approach would use a proper HTML parser
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 10000) // limit to 10K chars for Claude processing

    return [
      {
        version: 'unknown',
        releaseDate: new Date().toISOString(),
        rawChangelog: textContent,
        sourceUrl: url,
      },
    ]
  },
}
```

- [ ] **Step 4: Implement RSS adapter**

Create `src/lib/intelligence/adapters/rss.ts`:

```typescript
import type { RawRelease, AdapterConfig, SourceAdapter } from './types'

export const rssAdapter: SourceAdapter = {
  async fetch(config: AdapterConfig): Promise<RawRelease[]> {
    const { url } = config as { url: string }

    const response = await fetch(url, { next: { revalidate: 0 } })
    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status} for ${url}`)
    }

    const xml = await response.text()

    // Simple RSS item extraction
    const items: RawRelease[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    let match

    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
      const itemXml = match[1]
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        || itemXml.match(/<title>(.*?)<\/title>/)?.[1]
        || ''
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      const description =
        itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1]
        || itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]
        || ''

      items.push({
        version: title,
        releaseDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        rawChangelog: description.replace(/<[^>]+>/g, '').slice(0, 5000),
        sourceUrl: link,
      })
    }

    return items
  },
}
```

- [ ] **Step 5: Create adapter registry**

Create `src/lib/intelligence/adapters/registry.ts`:

```typescript
import type { AdapterConfig, SourceAdapter } from './types'
import { githubReleasesAdapter } from './github-releases'
import { htmlScraperAdapter } from './html-scraper'
import { rssAdapter } from './rss'

const adapters: Record<string, SourceAdapter> = {
  github_releases: githubReleasesAdapter,
  html_scrape: htmlScraperAdapter,
  rss: rssAdapter,
}

export function getAdapter(config: AdapterConfig): SourceAdapter {
  const adapter = adapters[config.type]
  if (!adapter) {
    throw new Error(`Unknown adapter type: ${config.type}`)
  }
  return adapter
}
```

- [ ] **Step 6: Write adapter tests**

Create `src/lib/intelligence/__tests__/adapters.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { githubReleasesAdapter } from '@/lib/intelligence/adapters/github-releases'
import { rssAdapter } from '@/lib/intelligence/adapters/rss'
import { getAdapter } from '@/lib/intelligence/adapters/registry'

describe('getAdapter', () => {
  it('returns github adapter for github_releases type', () => {
    const adapter = getAdapter({ type: 'github_releases', owner: 'test', repo: 'test' })
    expect(adapter).toBeDefined()
    expect(adapter.fetch).toBeInstanceOf(Function)
  })

  it('throws for unknown adapter type', () => {
    expect(() => getAdapter({ type: 'unknown' as any })).toThrow('Unknown adapter type')
  })
})

describe('githubReleasesAdapter', () => {
  it('parses GitHub release response', async () => {
    const mockResponse = [
      {
        tag_name: 'v1.0.0',
        published_at: '2026-05-20T00:00:00Z',
        body: 'Release notes here',
        html_url: 'https://github.com/test/test/releases/tag/v1.0.0',
      },
    ]
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    )

    const releases = await githubReleasesAdapter.fetch({
      type: 'github_releases',
      owner: 'test',
      repo: 'test',
    })

    expect(releases).toHaveLength(1)
    expect(releases[0].version).toBe('1.0.0')
    expect(releases[0].rawChangelog).toBe('Release notes here')
  })
})
```

- [ ] **Step 7: Run tests**

```bash
npx vitest run src/lib/intelligence/__tests__/adapters.test.ts
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/lib/intelligence/
git commit -m "feat: source adapter system — GitHub releases, HTML scraper, RSS"
```

---

### Task 2.4: Tool Intelligence Cron

**Files:**
- Create: `src/lib/intelligence/classifier.ts`
- Create: `src/lib/intelligence/staleness.ts`
- Create: `src/app/api/cron/tool-intelligence/route.ts`

- [ ] **Step 1: Create release classifier**

Create `src/lib/intelligence/classifier.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

interface ClassificationResult {
  significance: 'major' | 'minor' | 'patch'
  summary: string
  capabilities: string[]
  impactAssessment: string
}

export async function classifyRelease(
  toolName: string,
  version: string,
  changelog: string,
): Promise<ClassificationResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Classify this release for ${toolName} version ${version}.

Changelog:
${changelog.slice(0, 4000)}

Respond in JSON:
{
  "significance": "major" | "minor" | "patch",
  "summary": "one paragraph summary of what changed and why it matters",
  "capabilities": ["list", "of", "new", "or", "changed", "capabilities"],
  "impactAssessment": "brief assessment of impact on AI-assisted development workflows"
}`,
      },
    ],
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return {
      significance: 'patch',
      summary: `${toolName} ${version} released`,
      capabilities: [],
      impactAssessment: 'Unable to classify',
    }
  }
  return JSON.parse(jsonMatch[0])
}
```

- [ ] **Step 2: Create staleness checker**

Create `src/lib/intelligence/staleness.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function checkContentStaleness(
  toolSlug: string,
  newVersion: string,
) {
  const { data: staleContent } = await supabase
    .from('content_index')
    .select('slug, title, tool_versions')
    .contains('tools', [toolSlug])
    .eq('freshness', 'current')

  if (!staleContent || staleContent.length === 0) return []

  const flagged: { slug: string; title: string; oldVersion: string }[] = []

  for (const item of staleContent) {
    const currentVersion = item.tool_versions?.[toolSlug]
    if (currentVersion && currentVersion !== newVersion) {
      flagged.push({
        slug: item.slug,
        title: item.title,
        oldVersion: currentVersion,
      })

      await supabase
        .from('content_index')
        .update({
          freshness: 'needs_refresh',
          freshness_checked_at: new Date().toISOString(),
          freshness_reason: `${toolSlug} updated from ${currentVersion} to ${newVersion}`,
        })
        .eq('slug', item.slug)
    }
  }

  return flagged
}
```

- [ ] **Step 3: Create cron endpoint**

Create `src/app/api/cron/tool-intelligence/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdapter } from '@/lib/intelligence/adapters/registry'
import { classifyRelease } from '@/lib/intelligence/classifier'
import { checkContentStaleness } from '@/lib/intelligence/staleness'
import type { AdapterConfig } from '@/lib/intelligence/adapters/types'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .order('name')

  if (!tools) {
    return NextResponse.json({ error: 'No tools found' }, { status: 500 })
  }

  const results = []

  for (const tool of tools) {
    try {
      const config = tool.scraper_config as AdapterConfig
      if (!config?.type) {
        results.push({ tool: tool.slug, status: 'skipped', reason: 'no scraper config' })
        continue
      }

      const adapter = getAdapter(config)
      const releases = await adapter.fetch(config)

      if (releases.length === 0) {
        results.push({ tool: tool.slug, status: 'no_releases' })
        continue
      }

      let newReleases = 0

      for (const release of releases) {
        const hash = crypto
          .createHash('md5')
          .update(release.rawChangelog)
          .digest('hex')

        // Check if we've already processed this exact content
        const { data: existing } = await supabase
          .from('tool_releases')
          .select('id')
          .eq('tool_id', tool.id)
          .eq('response_hash', hash)
          .limit(1)

        if (existing && existing.length > 0) continue

        // Classify the release
        const classification = await classifyRelease(
          tool.name,
          release.version,
          release.rawChangelog,
        )

        // Store the release
        await supabase.from('tool_releases').upsert(
          {
            tool_id: tool.id,
            version: release.version,
            release_date: release.releaseDate,
            summary: classification.summary,
            significance: classification.significance,
            raw_changelog: release.rawChangelog,
            source_url: release.sourceUrl,
            capabilities: classification.capabilities,
            response_hash: hash,
            brief_status: classification.significance === 'major' ? 'pending' : 'skipped',
          },
          { onConflict: 'tool_id,version' },
        )

        // Update tool's current version
        await supabase
          .from('tools')
          .update({
            current_version: release.version,
            last_release_date: release.releaseDate,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tool.id)

        // Check for stale content
        await checkContentStaleness(tool.slug, release.version)

        newReleases++
      }

      results.push({ tool: tool.slug, status: 'ok', newReleases })
    } catch (error) {
      results.push({
        tool: tool.slug,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({ results, processedAt: new Date().toISOString() })
}
```

- [ ] **Step 4: Register cron in vercel.json**

Add to `vercel.json` (create if doesn't exist):

```json
{
  "crons": [
    {
      "path": "/api/cron/tool-intelligence",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/intelligence/ src/app/api/cron/tool-intelligence/ vercel.json
git commit -m "feat: tool intelligence cron — fetch, classify, track staleness"
```

---

### Task 2.5: Content Index Sync

**Files:**
- Create: `scripts/sync-content-index.ts`

- [ ] **Step 1: Create sync script**

Create `scripts/sync-content-index.ts`:

```typescript
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const CONTENT_DIR = path.join(process.cwd(), 'content')

async function walkDir(dir: string): Promise<string[]> {
  const results: string[] = []
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return results
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) results.push(...(await walkDir(fullPath)))
    else if (entry.name.endsWith('.mdx')) results.push(fullPath)
  }
  return results
}

async function sync() {
  const files = await walkDir(CONTENT_DIR)
  let synced = 0

  for (const filePath of files) {
    const raw = await fs.readFile(filePath, 'utf-8')
    const { data } = matter(raw)

    if (!data.slug || !data.pillar) continue

    const { error } = await supabase.from('content_index').upsert(
      {
        slug: data.slug,
        pillar: data.pillar,
        content_type: data.type,
        title: data.title,
        tools: data.tools || [],
        tool_versions: data.toolVersions || {},
        status: data.status,
        is_premium: data.isPremium || false,
        is_featured: data.isFeatured || false,
        published_at: data.publishedAt,
        indexed_at: new Date().toISOString(),
      },
      { onConflict: 'slug' },
    )

    if (error) console.error(`Error syncing ${data.slug}:`, error)
    else synced++
  }

  console.log(`Synced ${synced} content items to content_index`)
}

sync()
```

- [ ] **Step 2: Add to build script**

In `package.json`, add:

```json
"scripts": {
  "sync-index": "tsx scripts/sync-content-index.ts",
  "prebuild": "npm run sync-index"
}
```

- [ ] **Step 3: Commit**

```bash
git add scripts/sync-content-index.ts package.json
git commit -m "feat: content index sync — MDX frontmatter → Supabase"
```

---

### Task 2.6: Tool Profile and Comparison Pages

**Files:**
- Create: `src/app/(marketing)/tools/page.tsx`
- Create: `src/app/(marketing)/tools/[slug]/page.tsx`
- Create: `src/app/(marketing)/compare/page.tsx`
- Create: `src/components/tools/capability-matrix.tsx`

- [ ] **Step 1: Create tools directory page**

Create `src/app/(marketing)/tools/page.tsx`:

```tsx
import { createServerClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Coding Tools — Prototype Studio',
  description: 'Track 9 AI coding tools — releases, capabilities, and comparisons.',
}

export default async function ToolsPage() {
  const supabase = await createServerClient()
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .order('name')

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">
        AI Coding Tools
      </h1>
      <p className="mb-12 max-w-2xl text-lg text-white/50">
        We track releases and capabilities across {tools?.length || 0} AI coding
        tools so you always know what's current.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools?.map((tool) => (
          <a
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/40">
                {tool.category}
              </span>
            </div>
            <p className="mb-3 text-sm text-white/50">{tool.description}</p>
            {tool.current_version && (
              <span className="text-xs text-white/30">
                v{tool.current_version}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create tool detail page**

Create `src/app/(marketing)/tools/[slug]/page.tsx` — shows tool info, release history, capability profile. Queries `tools`, `tool_releases`, and `ecosystem_status` from Supabase.

- [ ] **Step 3: Create comparison page**

Create `src/app/(marketing)/compare/page.tsx` — accepts `?tools=a,b,c` query param. Fetches `ecosystem_status` for selected tools. Renders side-by-side matrix grouped by capability category.

- [ ] **Step 4: Create CapabilityMatrix component**

Create `src/components/tools/capability-matrix.tsx` — renders the comparison grid. Rows = capabilities, columns = tools. Cells show supported (checkmark), maturity badge, and quality score.

- [ ] **Step 5: Commit**

```bash
git add src/app/(marketing)/tools/ src/app/(marketing)/compare/ src/components/tools/
git commit -m "feat: tool profile pages and capability comparison matrix"
```

---

### Task 2.7: Seed Ecosystem Capabilities

**Files:**
- Create: `scripts/seed-ecosystem.ts`

- [ ] **Step 1: Create capability seed script**

Seed the `ecosystem_status` table with the initial capability taxonomy from the spec (Code Generation, Context & Understanding, Tool Integration, Editing, Deployment, Collaboration, Platform categories). Populate initial ratings for all 9 tools based on current known capabilities.

- [ ] **Step 2: Run seed**

```bash
npx tsx scripts/seed-ecosystem.ts
```

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-ecosystem.ts
git commit -m "feat: seed ecosystem capability data for 9 tools"
```

---

## Phase 3: Multi-Agent Pipeline & Observatory

**Goal:** Automated content generation via a 5-agent pipeline (Watcher → Analyst → Writer → Fact-Checker → Publisher). Observable pipeline runs. Agent Replay viewer. Monthly retrospective agent.

**Deliverable:** When a tool ships a release, the pipeline auto-generates a brief, fact-checks it, and opens a PR. Users can watch the pipeline work in real-time on the Observatory page.

---

### Task 3.1: Pipeline Database Schema

**Files:**
- Create: `supabase/migrations/010_pipeline.sql`

- [ ] **Step 1: Write migration**

Create `supabase/migrations/010_pipeline.sql`:

```sql
CREATE TABLE pipeline_runs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_type text NOT NULL CHECK (trigger_type IN ('release_detected','manual','scheduled')),
  trigger_data jsonb,
  status text DEFAULT 'running' CHECK (status IN ('running','completed','failed','needs_review')),
  total_tokens integer DEFAULT 0,
  total_cost_cents integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE pipeline_steps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid REFERENCES pipeline_runs(id) ON DELETE CASCADE NOT NULL,
  step_order integer NOT NULL,
  agent_role text NOT NULL CHECK (agent_role IN ('watcher','analyst','writer','fact_checker','publisher')),
  status text DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed','skipped')),
  input_summary text,
  output_summary text,
  full_transcript jsonb,
  tokens_used integer DEFAULT 0,
  cost_cents integer DEFAULT 0,
  duration_ms integer,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz
);

CREATE INDEX idx_pipeline_runs_status ON pipeline_runs(status, started_at DESC);
CREATE INDEX idx_pipeline_steps_run ON pipeline_steps(run_id, step_order);

ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read pipeline_runs" ON pipeline_runs FOR SELECT USING (true);
CREATE POLICY "Public read pipeline_steps" ON pipeline_steps FOR SELECT USING (true);
```

- [ ] **Step 2: Apply migration**

```bash
npx supabase db push
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/010_pipeline.sql
git commit -m "feat: pipeline_runs and pipeline_steps schema"
```

---

### Task 3.2: Agent Persona Definitions

**Files:**
- Create: `src/lib/intelligence/agents/types.ts`
- Create: `src/lib/intelligence/agents/watcher.ts`
- Create: `src/lib/intelligence/agents/analyst.ts`
- Create: `src/lib/intelligence/agents/writer.ts`
- Create: `src/lib/intelligence/agents/fact-checker.ts`
- Create: `src/lib/intelligence/agents/publisher.ts`

- [ ] **Step 1: Define agent types**

Create `src/lib/intelligence/agents/types.ts`:

```typescript
export interface AgentInput {
  [key: string]: unknown
}

export interface AgentOutput {
  summary: string
  data: Record<string, unknown>
  tokensUsed: number
}

export interface AgentDefinition {
  role: 'watcher' | 'analyst' | 'writer' | 'fact_checker' | 'publisher'
  systemPrompt: string
  execute(input: AgentInput): Promise<AgentOutput>
}
```

- [ ] **Step 2: Implement each agent**

Each agent file exports an `AgentDefinition` with a system prompt and `execute` function.

**Watcher** (`watcher.ts`): Takes raw release data from adapters. Extracts version, significance, key changes. Returns structured release summary.

**Analyst** (`analyst.ts`): Takes release summary + tool's current ecosystem_status. Diffs capabilities. Returns impact assessment: what changed, affected content slugs, capability rating updates.

**Writer** (`writer.ts`): Takes impact assessment. Reads recent briefs for voice consistency (via file system). Generates MDX brief with frontmatter. Returns complete MDX string.

**Fact-Checker** (`fact-checker.ts`): Takes draft MDX + source changelog URL. Verifies each factual claim. Returns verification report: pass/fail per claim, overall verdict.

**Publisher** (`publisher.ts`): Takes verified draft. Writes MDX file to `content/pulse/briefs/`. Creates git branch, commits, opens PR via GitHub API (or returns file content for manual commit in V1).

Each agent calls Claude API with its specific system prompt and structured output requirements.

- [ ] **Step 3: Commit**

```bash
git add src/lib/intelligence/agents/
git commit -m "feat: 5 agent persona definitions — watcher, analyst, writer, fact-checker, publisher"
```

---

### Task 3.3: Pipeline Orchestrator

**Files:**
- Create: `src/lib/intelligence/pipeline.ts`
- Create: `src/lib/intelligence/__tests__/pipeline.test.ts`

- [ ] **Step 1: Implement orchestrator**

Create `src/lib/intelligence/pipeline.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { watcherAgent } from './agents/watcher'
import { analystAgent } from './agents/analyst'
import { writerAgent } from './agents/writer'
import { factCheckerAgent } from './agents/fact-checker'
import { publisherAgent } from './agents/publisher'
import type { AgentDefinition, AgentInput, AgentOutput } from './agents/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const PIPELINE_STEPS: { agent: AgentDefinition; order: number }[] = [
  { agent: watcherAgent, order: 1 },
  { agent: analystAgent, order: 2 },
  { agent: writerAgent, order: 3 },
  { agent: factCheckerAgent, order: 4 },
  { agent: publisherAgent, order: 5 },
]

export async function runPipeline(
  triggerType: 'release_detected' | 'manual' | 'scheduled',
  triggerData: Record<string, unknown>,
) {
  // Create pipeline run
  const { data: run, error: runError } = await supabase
    .from('pipeline_runs')
    .insert({ trigger_type: triggerType, trigger_data: triggerData })
    .select()
    .single()

  if (runError || !run) throw new Error(`Failed to create pipeline run: ${runError?.message}`)

  let currentInput: AgentInput = { ...triggerData }
  let totalTokens = 0
  let totalCost = 0

  for (const { agent, order } of PIPELINE_STEPS) {
    // Create step record
    const { data: step } = await supabase
      .from('pipeline_steps')
      .insert({
        run_id: run.id,
        step_order: order,
        agent_role: agent.role,
        status: 'running',
        input_summary: JSON.stringify(currentInput).slice(0, 1000),
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    const startTime = Date.now()

    try {
      const output: AgentOutput = await agent.execute(currentInput)

      const durationMs = Date.now() - startTime
      totalTokens += output.tokensUsed
      totalCost += Math.ceil(output.tokensUsed * 0.003) // rough cost estimate

      await supabase
        .from('pipeline_steps')
        .update({
          status: 'completed',
          output_summary: output.summary,
          full_transcript: output.data,
          tokens_used: output.tokensUsed,
          cost_cents: Math.ceil(output.tokensUsed * 0.003),
          duration_ms: durationMs,
          completed_at: new Date().toISOString(),
        })
        .eq('id', step!.id)

      // Pass output to next agent as input
      currentInput = { ...currentInput, ...output.data, previousStep: agent.role }
    } catch (error) {
      const durationMs = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      await supabase
        .from('pipeline_steps')
        .update({
          status: 'failed',
          error_message: errorMessage,
          duration_ms: durationMs,
          completed_at: new Date().toISOString(),
        })
        .eq('id', step!.id)

      await supabase
        .from('pipeline_runs')
        .update({
          status: 'failed',
          total_tokens: totalTokens,
          total_cost_cents: totalCost,
          completed_at: new Date().toISOString(),
        })
        .eq('id', run.id)

      return { runId: run.id, status: 'failed', error: errorMessage, step: agent.role }
    }
  }

  await supabase
    .from('pipeline_runs')
    .update({
      status: 'completed',
      total_tokens: totalTokens,
      total_cost_cents: totalCost,
      completed_at: new Date().toISOString(),
    })
    .eq('id', run.id)

  return { runId: run.id, status: 'completed', totalTokens, totalCost }
}
```

- [ ] **Step 2: Write tests (mock Claude API)**

Create tests that mock the Anthropic SDK and verify pipeline step sequencing, error handling, and database state transitions.

- [ ] **Step 3: Integrate pipeline into tool intelligence cron**

Update `src/app/api/cron/tool-intelligence/route.ts` to call `runPipeline()` when a `major` release is detected.

- [ ] **Step 4: Create manual trigger endpoint**

Create `src/app/api/admin/trigger-pipeline/route.ts` — admin-only endpoint to manually trigger the pipeline for testing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/intelligence/pipeline.ts src/lib/intelligence/__tests__/pipeline.test.ts src/app/api/cron/tool-intelligence/ src/app/api/admin/trigger-pipeline/
git commit -m "feat: multi-agent pipeline orchestrator with step tracking"
```

---

### Task 3.4: Observatory Dashboard

**Files:**
- Create: `src/app/(marketing)/system/observatory/page.tsx`
- Create: `src/components/observatory/pipeline-run-card.tsx`
- Create: `src/components/observatory/step-detail.tsx`

- [ ] **Step 1: Create Observatory page**

Create `src/app/(marketing)/system/observatory/page.tsx`:

```tsx
import { createServerClient } from '@/lib/supabase/server'
import { PipelineRunCard } from '@/components/observatory/pipeline-run-card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agent Observatory — Prototype Studio',
  description: 'Watch real AI agents work in production. Live pipeline monitoring.',
}

export const revalidate = 60

export default async function ObservatoryPage() {
  const supabase = await createServerClient()

  const { data: runs } = await supabase
    .from('pipeline_runs')
    .select(`
      *,
      pipeline_steps (*)
    `)
    .order('started_at', { ascending: false })
    .limit(20)

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">
          Agent Observatory
        </h1>
        <p className="max-w-2xl text-lg text-white/50">
          Watch real AI agents work in production. Every pipeline run is
          visible — see which agent is active, read the handoffs, watch
          the fact-checker catch hallucinations.
        </p>
      </div>

      <div className="space-y-4">
        {runs?.map((run) => (
          <PipelineRunCard key={run.id} run={run} />
        ))}
        {(!runs || runs.length === 0) && (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-white/30">
            No pipeline runs yet. The first run will appear when a tool ships a
            major release.
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create PipelineRunCard and StepDetail components**

These render the pipeline run with expandable step details showing agent role, status, duration, tokens, cost, and transcript snippets.

- [ ] **Step 3: Commit**

```bash
git add src/app/(marketing)/system/observatory/ src/components/observatory/
git commit -m "feat: Agent Observatory dashboard with pipeline run history"
```

---

### Task 3.5: Agent Replay Viewer

**Files:**
- Create: `src/components/mdx/agent-replay.tsx`
- Update: `src/components/mdx/index.ts`

- [ ] **Step 1: Create AgentReplay component**

Create `src/components/mdx/agent-replay.tsx`:

```tsx
'use client'

import { useState } from 'react'

interface ReplayStep {
  stepNumber: number
  type: 'prompt' | 'reasoning' | 'tool_call' | 'output' | 'decision'
  content: string
  metadata?: {
    toolName?: string
    filesChanged?: string[]
    durationMs?: number
  }
  annotation?: string
}

interface AgentReplayProps {
  steps: ReplayStep[]
  title: string
  agentRole: string
}

export function AgentReplay({ steps, title, agentRole }: AgentReplayProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  const typeColors = {
    prompt: 'border-blue-500/30 bg-blue-500/5',
    reasoning: 'border-purple-500/30 bg-purple-500/5',
    tool_call: 'border-yellow-500/30 bg-yellow-500/5',
    output: 'border-green-500/30 bg-green-500/5',
    decision: 'border-red-500/30 bg-red-500/5',
  }

  return (
    <div className="my-8 rounded-xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-sm text-white/40">Agent: {agentRole}</span>
      </div>
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.stepNumber}
            className={`rounded-lg border ${typeColors[step.type]} transition-all`}
          >
            <button
              onClick={() =>
                setExpandedStep(
                  expandedStep === step.stepNumber ? null : step.stepNumber,
                )
              }
              className="flex w-full items-center justify-between p-3 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-white/30">
                  {step.stepNumber}
                </span>
                <span className="rounded px-1.5 py-0.5 text-xs font-medium uppercase text-white/60">
                  {step.type}
                </span>
                <span className="text-sm text-white/80">
                  {step.content.slice(0, 100)}
                  {step.content.length > 100 ? '...' : ''}
                </span>
              </div>
              <span className="text-white/30">
                {expandedStep === step.stepNumber ? '−' : '+'}
              </span>
            </button>
            {expandedStep === step.stepNumber && (
              <div className="border-t border-white/5 p-4">
                <pre className="mb-3 whitespace-pre-wrap text-sm text-white/70">
                  {step.content}
                </pre>
                {step.annotation && (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/50">
                    <span className="font-medium text-white/70">Note: </span>
                    {step.annotation}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Register in MDX components**

Update `src/components/mdx/index.ts` to replace the `AgentReplay: () => null` stub with the real import.

- [ ] **Step 3: Commit**

```bash
git add src/components/mdx/agent-replay.tsx src/components/mdx/index.ts
git commit -m "feat: AgentReplay interactive step-through viewer component"
```

---

### Task 3.6: Retrospective Agent

**Files:**
- Create: `src/lib/intelligence/agents/retrospective.ts`
- Create: `src/app/api/cron/retrospective/route.ts`

- [ ] **Step 1: Implement retrospective agent**

Monthly cron that queries `content_analytics`, identifies high/low-performing content, gaps (assistant queries with no match), and generates a strategy memo MDX file committed to `content/internal/strategy/`.

- [ ] **Step 2: Register monthly cron**

Add to `vercel.json`:

```json
{
  "path": "/api/cron/retrospective",
  "schedule": "0 0 1 * *"
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/intelligence/agents/retrospective.ts src/app/api/cron/retrospective/ vercel.json
git commit -m "feat: monthly Retrospective Agent — content performance analysis"
```

---

## Phase 4: Interactive Features

**Goal:** StackBlitz sandboxes embedded in content, Arena side-by-side comparison engine, knowledge graph, embedding pipeline, and AI assistant with graph-augmented RAG.

**Deliverable:** Content pages have interactive sandboxes. Arena page shows tool comparisons with voting. AI assistant answers questions using platform content.

---

### Task 4.1: StackBlitz Sandbox Integration

**Files:**
- Create: `src/components/mdx/sandbox.tsx`
- Create: `content/starters/` directory
- Update: `src/components/mdx/index.ts`

- [ ] **Step 1: Install StackBlitz SDK**

```bash
npm install @stackblitz/sdk
```

- [ ] **Step 2: Create Sandbox component**

Create `src/components/mdx/sandbox.tsx`:

```tsx
'use client'

import { useEffect, useRef } from 'react'
import sdk from '@stackblitz/sdk'

interface SandboxProps {
  template: string
  openFile?: string
  height?: number
}

export function Sandbox({
  template,
  openFile = 'src/app/page.tsx',
  height = 500,
}: SandboxProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    sdk.embedGithubProject(
      containerRef.current,
      `prototype-studio/starters/${template}`,
      {
        height,
        openFile,
        view: 'both',
        theme: 'dark',
      },
    )
  }, [template, openFile, height])

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
        <span className="text-xs text-white/50">Interactive Sandbox</span>
        <span className="text-xs text-white/30">{template}</span>
      </div>
      <div ref={containerRef} />
    </div>
  )
}
```

- [ ] **Step 3: Register in MDX components**

Update `src/components/mdx/index.ts` — replace `Sandbox: () => null` with real import.

- [ ] **Step 4: Create starter template structure**

```bash
mkdir -p content/starters/landing-page
```

Create a minimal Next.js starter in `content/starters/landing-page/` with `package.json`, `src/app/page.tsx`, and `tsconfig.json`. This starter gets embedded via StackBlitz when content references `sandboxTemplate: "landing-page"`.

- [ ] **Step 5: Commit**

```bash
git add src/components/mdx/sandbox.tsx src/components/mdx/index.ts content/starters/ package.json package-lock.json
git commit -m "feat: StackBlitz sandbox integration for interactive content"
```

---

### Task 4.2: Arena Data Model and Storage

**Files:**
- Create: `supabase/migrations/011_arena.sql`
- Create: `src/types/arena.ts`

- [ ] **Step 1: Write migration**

```sql
CREATE TABLE arena_challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  task_spec text NOT NULL,
  time_limit_minutes integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE arena_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id uuid REFERENCES arena_challenges(id) ON DELETE CASCADE NOT NULL,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  video_url text,
  duration_seconds integer,
  lines_of_code integer,
  prompt_count integer,
  iteration_count integer,
  result_score integer CHECK (result_score BETWEEN 1 AND 5),
  starter_repo_url text,
  final_repo_url text,
  builder_experience text CHECK (builder_experience IN ('beginner','intermediate','advanced')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE arena_votes (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES arena_challenges(id) ON DELETE CASCADE,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, challenge_id)
);

ALTER TABLE arena_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE arena_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE arena_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read arena" ON arena_challenges FOR SELECT USING (true);
CREATE POLICY "Public read entries" ON arena_entries FOR SELECT USING (true);
CREATE POLICY "Public read votes" ON arena_votes FOR SELECT USING (true);
CREATE POLICY "Auth insert votes" ON arena_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 2: Create types**

Create `src/types/arena.ts` with TypeScript interfaces matching the tables.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/011_arena.sql src/types/arena.ts
git commit -m "feat: Arena schema — challenges, entries, voting"
```

---

### Task 4.3: Arena UI

**Files:**
- Create: `src/app/(marketing)/build/arena/page.tsx`
- Create: `src/app/(marketing)/build/arena/[slug]/page.tsx`
- Create: `src/components/arena/side-by-side.tsx`
- Create: `src/components/arena/vote-button.tsx`

- [ ] **Step 1: Create Arena listing page**

Shows all challenges with tool counts and vote tallies. Links to individual comparison pages.

- [ ] **Step 2: Create Arena detail page**

`/build/arena/[slug]` — side-by-side view with synced video players (or screenshots), stats comparison table, forkable repo links, and voting interface.

- [ ] **Step 3: Create SideBySide component**

Renders entries for a challenge side-by-side. Shows: tool name, video embed, stats (duration, LOC, prompts, iterations, score), fork button.

- [ ] **Step 4: Create VoteButton component**

Client component with optimistic UI. Calls `/api/arena/vote` endpoint. Shows current vote counts per tool.

- [ ] **Step 5: Create vote API endpoint**

`src/app/api/arena/vote/route.ts` — authenticated POST, upserts arena_votes row.

- [ ] **Step 6: Commit**

```bash
git add src/app/(marketing)/build/arena/ src/components/arena/ src/app/api/arena/
git commit -m "feat: Arena UI — side-by-side tool comparisons with community voting"
```

---

### Task 4.4: Knowledge Graph

**Files:**
- Create: `supabase/migrations/012_knowledge_graph.sql`
- Create: `src/lib/graph/types.ts`
- Create: `src/lib/graph/queries.ts`
- Create: `scripts/populate-graph.ts`

- [ ] **Step 1: Write migration**

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

CREATE INDEX idx_knowledge_edges_source ON knowledge_edges(source_id);
CREATE INDEX idx_knowledge_edges_target ON knowledge_edges(target_id);

ALTER TABLE knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read nodes" ON knowledge_nodes FOR SELECT USING (true);
CREATE POLICY "Public read edges" ON knowledge_edges FOR SELECT USING (true);
```

- [ ] **Step 2: Create graph query utilities**

Create `src/lib/graph/queries.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function getRelatedNodes(
  slug: string,
  maxDepth: number = 2,
) {
  // BFS traversal from a starting node
  const visited = new Set<string>()
  const queue: { slug: string; depth: number }[] = [{ slug, depth: 0 }]
  const results: { node: any; edges: any[]; depth: number }[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current.slug) || current.depth > maxDepth) continue
    visited.add(current.slug)

    const { data: node } = await supabase
      .from('knowledge_nodes')
      .select('*')
      .eq('slug', current.slug)
      .single()

    if (!node) continue

    const { data: edges } = await supabase
      .from('knowledge_edges')
      .select(`
        *,
        target:target_id(slug, title, node_type)
      `)
      .eq('source_id', node.id)

    results.push({ node, edges: edges || [], depth: current.depth })

    for (const edge of edges || []) {
      if (!visited.has((edge.target as any).slug)) {
        queue.push({ slug: (edge.target as any).slug, depth: current.depth + 1 })
      }
    }
  }

  return results
}

export async function findPath(fromSlug: string, toSlug: string) {
  // Find shortest path between two nodes
  // Implementation: BFS with parent tracking
}

export async function getPrerequisites(contentSlug: string) {
  // Get all nodes connected via 'requires' edges (backward traversal)
}
```

- [ ] **Step 3: Create graph population script**

Create `scripts/populate-graph.ts` — reads all content from MDX frontmatter + tools from Supabase, creates nodes for each, then creates edges based on: content ↔ tools (uses), content ↔ content (related, requires), tools ↔ capabilities (enables).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/012_knowledge_graph.sql src/lib/graph/ scripts/populate-graph.ts
git commit -m "feat: knowledge graph — nodes, edges, traversal queries"
```

---

### Task 4.5: Embedding Pipeline

**Files:**
- Create: `supabase/migrations/013_embeddings.sql`
- Create: `src/lib/assistant/embeddings.ts`
- Create: `scripts/generate-embeddings.ts`

- [ ] **Step 1: Enable pgvector and create table**

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE content_embeddings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_slug text NOT NULL,
  chunk_index integer NOT NULL,
  heading_path text,
  chunk_text text NOT NULL,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_slug, chunk_index)
);

CREATE INDEX ON content_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

- [ ] **Step 2: Create chunking and embedding utility**

Create `src/lib/assistant/embeddings.ts`:

```typescript
import fs from 'fs/promises'
import matter from 'gray-matter'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface Chunk {
  text: string
  headingPath: string
  index: number
}

export function chunkContent(
  markdown: string,
  maxTokens: number = 1500,
): Chunk[] {
  const sections = markdown.split(/^(#{1,3}\s.+)$/m)
  const chunks: Chunk[] = []
  let currentHeading = ''
  let currentText = ''
  let chunkIndex = 0

  for (const section of sections) {
    if (section.match(/^#{1,3}\s/)) {
      currentHeading = section.replace(/^#+\s/, '').trim()
      continue
    }

    const text = section.trim()
    if (!text) continue

    // Rough token estimate: ~4 chars per token
    if (currentText.length + text.length > maxTokens * 4) {
      if (currentText) {
        chunks.push({
          text: currentText,
          headingPath: currentHeading,
          index: chunkIndex++,
        })
      }
      currentText = text
    } else {
      currentText += '\n\n' + text
    }
  }

  if (currentText) {
    chunks.push({
      text: currentText,
      headingPath: currentHeading,
      index: chunkIndex,
    })
  }

  return chunks
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

export async function embedContent(filePath: string) {
  const raw = await fs.readFile(filePath, 'utf-8')
  const { data: frontmatter, content } = matter(raw)
  const chunks = chunkContent(content)

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.text)

    await supabase.from('content_embeddings').upsert(
      {
        content_slug: frontmatter.slug,
        chunk_index: chunk.index,
        heading_path: chunk.headingPath,
        chunk_text: chunk.text,
        embedding: embedding,
        metadata: {
          pillar: frontmatter.pillar,
          tools: frontmatter.tools,
          title: frontmatter.title,
        },
      },
      { onConflict: 'content_slug,chunk_index' },
    )
  }
}
```

- [ ] **Step 3: Create batch embedding script**

Create `scripts/generate-embeddings.ts` — walks all content MDX files, calls `embedContent()` for each, with rate limiting (max 10 concurrent).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/013_embeddings.sql src/lib/assistant/ scripts/generate-embeddings.ts
git commit -m "feat: embedding pipeline — chunking, vector storage, batch generation"
```

---

### Task 4.6: AI Assistant Backend

**Files:**
- Create: `src/app/api/assistant/route.ts`
- Create: `src/lib/assistant/retrieval.ts`

- [ ] **Step 1: Create retrieval utility**

Create `src/lib/assistant/retrieval.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { generateEmbedding } from './embeddings'
import { getRelatedNodes } from '@/lib/graph/queries'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function retrieveContext(query: string, limit: number = 5) {
  const queryEmbedding = await generateEmbedding(query)

  // Vector search
  const { data: vectorResults } = await supabase.rpc('match_embeddings', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit,
  })

  if (!vectorResults || vectorResults.length === 0) return []

  // Graph augmentation: expand to related content
  const slugs = [...new Set(vectorResults.map((r: any) => r.content_slug))]
  const graphContext = []

  for (const slug of slugs.slice(0, 3)) {
    const related = await getRelatedNodes(slug, 1)
    graphContext.push(...related)
  }

  return {
    vectorResults,
    graphContext,
    sources: slugs,
  }
}
```

Note: Requires a Supabase RPC function `match_embeddings` — add to the embeddings migration:

```sql
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  content_slug text,
  chunk_text text,
  heading_path text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    content_slug,
    chunk_text,
    heading_path,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM content_embeddings
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

- [ ] **Step 2: Create assistant API endpoint**

Create `src/app/api/assistant/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { retrieveContext } from '@/lib/assistant/retrieval'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  const { query } = await request.json()

  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }

  // Rate limiting would go here (Upstash Redis)

  const context = await retrieveContext(query)

  const contextText = context.vectorResults
    ?.map(
      (r: any) =>
        `[Source: ${r.content_slug}${r.heading_path ? ' > ' + r.heading_path : ''}]\n${r.chunk_text}`,
    )
    .join('\n\n---\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are the Prototype Studio assistant. Answer questions using ONLY the provided context from the platform's content. Always cite your sources using [Source: slug] format. If the context doesn't contain the answer, say so.`,
    messages: [
      {
        role: 'user',
        content: `Context:\n${contextText || 'No relevant context found.'}\n\nQuestion: ${query}`,
      },
    ],
  })

  const answer =
    response.content[0].type === 'text' ? response.content[0].text : ''

  return NextResponse.json({
    answer,
    sources: context.sources || [],
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/assistant/ src/lib/assistant/retrieval.ts
git commit -m "feat: AI assistant API — graph-augmented RAG with source citations"
```

---

### Task 4.7: AI Assistant UI

**Files:**
- Create: `src/components/assistant/chat-widget.tsx`
- Create: `src/components/assistant/chat-message.tsx`
- Create: `src/app/(marketing)/ask/page.tsx`

- [ ] **Step 1: Create ChatWidget component**

Client component: floating button (bottom-right), expands to a chat panel. Manages message state, sends queries to `/api/assistant`, renders responses with source links. Closeable, persists messages in session.

- [ ] **Step 2: Create full-screen /ask page**

Full-page version of the chat interface at `/ask`.

- [ ] **Step 3: Add ChatWidget to marketing layout**

Add `<ChatWidget />` to `src/app/(marketing)/layout.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/components/assistant/ src/app/(marketing)/ask/ src/app/(marketing)/layout.tsx
git commit -m "feat: AI assistant UI — floating chat widget and /ask page"
```

---

## Phase 5: Community, API & Polish

**Goal:** Built With Showcase, public ecosystem API, personalization engine, transparency page, open source package scaffolding, and automated benchmarks.

**Deliverable:** The complete platform with all systems live. Public API serving ecosystem data. Community showcase accepting submissions. Transparency page showing build costs.

---

### Task 5.1: Showcase Schema and Submission Flow

**Files:**
- Create: `supabase/migrations/014_showcase.sql`
- Create: `src/app/(marketing)/showcase/page.tsx`
- Create: `src/app/(marketing)/showcase/submit/page.tsx`
- Create: `src/app/api/showcase/route.ts`

- [ ] **Step 1: Write migration**

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

ALTER TABLE showcase_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_project_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published" ON showcase_projects
  FOR SELECT USING (status = 'published');
CREATE POLICY "Auth insert" ON showcase_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own read" ON showcase_projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public read tools" ON showcase_project_tools FOR SELECT USING (true);
```

- [ ] **Step 2: Create showcase directory page**

`/showcase` — filterable grid of published projects. Filter by tool, experience level, build time range. Shows project cards with screenshots, tools used, build time, upvote count.

- [ ] **Step 3: Create submission form page**

`/showcase/submit` — authenticated only. Form with: title, URL, description, screenshot upload, GitHub URL, tools (multi-select from tracked tools), build time, experience level. Submits to API.

- [ ] **Step 4: Create API endpoints**

`/api/showcase` — GET (list published), POST (submit new).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/014_showcase.sql src/app/(marketing)/showcase/ src/app/api/showcase/
git commit -m "feat: Built With Showcase — submission flow, directory page"
```

---

### Task 5.2: Public Ecosystem API

**Files:**
- Create: `src/app/api/v1/tools/route.ts`
- Create: `src/app/api/v1/tools/[slug]/route.ts`
- Create: `src/app/api/v1/tools/[slug]/releases/route.ts`
- Create: `src/app/api/v1/compare/route.ts`
- Create: `src/app/api/v1/capabilities/route.ts`
- Create: `src/app/api/v1/pulse/route.ts`
- Create: `src/app/api/v1/showcase/route.ts`
- Create: `src/app/api/v1/stats/route.ts`
- Create: `src/lib/api/rate-limit.ts`
- Create: `src/lib/api/response.ts`

- [ ] **Step 1: Create API response wrapper**

Create `src/lib/api/response.ts`:

```typescript
import { NextResponse } from 'next/server'

export function apiResponse(data: unknown, meta?: Record<string, unknown>) {
  return NextResponse.json(
    {
      data,
      meta: {
        generatedAt: new Date().toISOString(),
        apiVersion: 'v1',
        ...meta,
      },
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    },
  )
}

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}
```

- [ ] **Step 2: Create rate limiting middleware**

Create `src/lib/api/rate-limit.ts` using Upstash Redis:

```typescript
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 3600,
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate:${identifier}`
  const current = await redis.incr(key)

  if (current === 1) {
    await redis.expire(key, windowSeconds)
  }

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
  }
}
```

- [ ] **Step 3: Implement API endpoints**

Each endpoint queries Supabase tables and returns data through the `apiResponse` wrapper:

- `GET /api/v1/tools` — all tools with current version/capabilities
- `GET /api/v1/tools/[slug]` — single tool detail + 5 latest releases
- `GET /api/v1/tools/[slug]/releases` — paginated release history
- `GET /api/v1/compare?tools=a,b,c` — ecosystem_status filtered to selected tools
- `GET /api/v1/capabilities` — distinct capabilities with tool counts
- `GET /api/v1/pulse` — latest published content from pulse pillar (via content_index)
- `GET /api/v1/showcase` — published showcase projects (paginated, filterable)
- `GET /api/v1/stats` — aggregate counts (tools, content, showcase, releases)

All endpoints apply rate limiting via `checkRateLimit()` using the request IP.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/v1/ src/lib/api/
git commit -m "feat: public ecosystem API — /api/v1/* with rate limiting and caching"
```

---

### Task 5.3: Personalization Engine

**Files:**
- Create: `supabase/migrations/015_personalization.sql`
- Create: `src/lib/personalization/user-context.ts`
- Create: `src/lib/personalization/recommender.ts`
- Create: `src/components/content/for-you-sidebar.tsx`

- [ ] **Step 1: Write migration**

```sql
CREATE TABLE user_context (
  user_id uuid REFERENCES profiles(id) PRIMARY KEY,
  experience_level text CHECK (experience_level IN ('beginner','intermediate','advanced')),
  primary_tools text[],
  content_consumed text[],
  topics_of_interest text[],
  last_active timestamptz DEFAULT now(),
  model_version integer DEFAULT 1
);

CREATE TABLE bookmarks (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content_slug text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, content_slug)
);

ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own read/write context" ON user_context
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own read/write bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);
```

- [ ] **Step 2: Create user context tracker**

Create `src/lib/personalization/user-context.ts` — functions to update user context based on implicit signals: `trackContentView(userId, slug)`, `trackToolInterest(userId, toolSlug)`, `updateTopics(userId)`.

- [ ] **Step 3: Create recommender**

Create `src/lib/personalization/recommender.ts` — given a user's context, query content_index for content they haven't consumed that matches their tools/topics, sorted by relevance. Returns top 3-5 recommendations.

- [ ] **Step 4: Create ForYouSidebar component**

Client component that fetches recommendations from an API endpoint and renders them as a sidebar of content suggestions on detail pages.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/015_personalization.sql src/lib/personalization/ src/components/content/for-you-sidebar.tsx
git commit -m "feat: personalization engine — user context tracking, recommender, sidebar"
```

---

### Task 5.4: Transparency Page

**Files:**
- Create: `supabase/migrations/016_transparency.sql`
- Create: `src/app/(marketing)/transparency/page.tsx`
- Create: `src/components/transparency/cost-ticker.tsx`
- Create: `.github/workflows/build-stats.yml`

- [ ] **Step 1: Write migration**

```sql
CREATE TABLE platform_costs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  month date NOT NULL,
  category text NOT NULL CHECK (category IN ('hosting','api_claude','api_gemini','database','redis','domain','other')),
  amount_cents integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE platform_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read costs" ON platform_costs FOR SELECT USING (true);
```

- [ ] **Step 2: Create GitHub Action for build stats**

Create `.github/workflows/build-stats.yml`:

```yaml
name: Build Stats
on:
  push:
    branches: [main]

jobs:
  stats:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Count stats
        run: |
          echo "{" > build-stats.json
          echo "  \"loc\": $(find src -name '*.ts' -o -name '*.tsx' | xargs wc -l | tail -1 | awk '{print $1}')," >> build-stats.json
          echo "  \"files\": $(find src -name '*.ts' -o -name '*.tsx' | wc -l)," >> build-stats.json
          echo "  \"contentFiles\": $(find content -name '*.mdx' 2>/dev/null | wc -l)," >> build-stats.json
          echo "  \"tests\": $(grep -r 'it(' src --include='*.test.*' | wc -l)," >> build-stats.json
          echo "  \"routes\": $(find src/app -name 'page.tsx' | wc -l)," >> build-stats.json
          echo "  \"commits\": $(git rev-list --count HEAD)," >> build-stats.json
          echo "  \"generatedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" >> build-stats.json
          echo "}" >> build-stats.json
      - name: Commit stats
        run: |
          git config user.name "github-actions"
          git config user.email "actions@github.com"
          git add build-stats.json
          git diff --staged --quiet || git commit -m "chore: update build stats"
          git push
```

- [ ] **Step 3: Create Transparency page**

`/transparency` — reads `build-stats.json` at build time, queries `platform_costs` from Supabase, queries `pipeline_runs` for pipeline stats. Renders: total build cost, monthly breakdown chart, lines of code, commit count, test count, content pieces, pipeline runs with cost/token totals.

- [ ] **Step 4: Create CostTicker MDX component**

Update `src/components/mdx/index.ts` — replace `CostTicker: () => null` with a real component that fetches current running cost total and displays it inline in content.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/016_transparency.sql src/app/(marketing)/transparency/ src/components/transparency/ .github/workflows/build-stats.yml src/components/mdx/
git commit -m "feat: transparency page — build costs, stats, pipeline metrics"
```

---

### Task 5.5: Open Source Package Scaffolding

**Files:**
- Create: `packages/agent-starter/package.json`
- Create: `packages/agent-starter/src/index.ts`
- Create: `packages/agent-starter/src/cli.ts`
- Create: `packages/personas/package.json`
- Create: `packages/personas/src/index.ts`

- [ ] **Step 1: Create packages directory**

```bash
mkdir -p packages/agent-starter/src packages/personas/src
```

- [ ] **Step 2: Scaffold agent-starter package**

Create `packages/agent-starter/package.json`:

```json
{
  "name": "@prototype-studio/agent-starter",
  "version": "0.1.0",
  "description": "Scaffold an agent-first project with AI coding tools",
  "bin": {
    "prototype-studio": "./dist/cli.js"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "prompts": "^2.4.2"
  }
}
```

Create `packages/agent-starter/src/cli.ts` — interactive CLI that prompts for tool choice and project type, then copies appropriate starter template files.

- [ ] **Step 3: Scaffold personas package**

Create `packages/personas/package.json` and `src/index.ts` — exports persona definitions that can be installed into a project.

- [ ] **Step 4: Commit**

```bash
git add packages/
git commit -m "feat: open source package scaffolding — agent-starter and personas"
```

---

### Task 5.6: Automated Benchmarks

**Files:**
- Create: `supabase/migrations/017_benchmarks.sql`
- Create: `src/lib/intelligence/benchmarks/runner.ts`
- Create: `src/lib/intelligence/benchmarks/evaluator.ts`
- Create: `src/app/api/cron/benchmarks/route.ts`

- [ ] **Step 1: Write migration**

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
  benchmark_id uuid REFERENCES benchmarks(id) ON DELETE CASCADE NOT NULL,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  run_date timestamptz DEFAULT now(),
  output_text text,
  scores jsonb,
  tokens_used integer,
  cost_cents integer,
  duration_ms integer,
  evaluator_notes text
);

ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read benchmarks" ON benchmarks FOR SELECT USING (true);
CREATE POLICY "Public read results" ON benchmark_results FOR SELECT USING (true);
```

- [ ] **Step 2: Create benchmark runner**

Create `src/lib/intelligence/benchmarks/runner.ts` — takes a benchmark definition, submits the same prompt to each tool's API (Claude, Gemini, OpenAI), collects outputs. Only works for API-accessible tools.

- [ ] **Step 3: Create evaluator agent**

Create `src/lib/intelligence/benchmarks/evaluator.ts` — takes benchmark criteria + tool outputs, uses Claude to score each output against the rubric. Returns structured scores.

- [ ] **Step 4: Create benchmark cron**

`/api/cron/benchmarks` — runs weekly. Queries active benchmarks, executes runner + evaluator for each, stores results. Budget cap enforced via platform_costs tracking.

- [ ] **Step 5: Create benchmark results page**

Add `/tools/benchmarks` or section on comparison page showing latest benchmark results per tool.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/017_benchmarks.sql src/lib/intelligence/benchmarks/ src/app/api/cron/benchmarks/
git commit -m "feat: automated benchmark runner with evaluator agent"
```

---

### Task 5.7: Final Integration and Testing

**Files:**
- Various test files
- Modify: navigation to include all new routes

- [ ] **Step 1: Update navigation with all routes**

Add links to: `/tools`, `/compare`, `/showcase`, `/transparency`, `/ask`

Either as secondary nav items or in a footer/explore section.

- [ ] **Step 2: Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 3: Build verification**

```bash
npm run build
```

Expected: Clean build, all routes generated.

- [ ] **Step 4: Update sitemap**

Ensure `src/app/sitemap.ts` includes all new routes: pillars, tools, compare, showcase, transparency, ask.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: Prototype Studio — complete platform integration"
```

---

## Appendix: Route Map

| Route | Phase | Source |
|---|---|---|
| `/` | 1 | Homepage with pillar sections |
| `/pulse` | 1 | Pulse pillar index |
| `/pulse/[slug]` | 1 | Pulse content detail |
| `/build` | 1 | Build pillar index |
| `/build/[slug]` | 1 | Build content detail |
| `/build/arena` | 4 | Arena challenge listing |
| `/build/arena/[slug]` | 4 | Arena side-by-side comparison |
| `/learn` | 1 | Learn pillar index |
| `/learn/[slug]` | 1 | Learn content detail |
| `/system` | 1 | System pillar index |
| `/system/[slug]` | 1 | System content detail |
| `/system/observatory` | 3 | Agent Observatory dashboard |
| `/tools` | 2 | Tool directory |
| `/tools/[slug]` | 2 | Tool profile + releases |
| `/compare` | 2 | Capability comparison matrix |
| `/showcase` | 5 | Built With directory |
| `/showcase/submit` | 5 | Project submission form |
| `/transparency` | 5 | Build cost and stats |
| `/ask` | 4 | AI assistant (full screen) |
| `/about` | 1 | Carried over, rebranded |
| `/pricing` | 1 | Dormant, carried over |
| `/api/v1/*` | 5 | Public ecosystem API |
| `/api/cron/tool-intelligence` | 2 | 6-hour tool tracking |
| `/api/cron/retrospective` | 3 | Monthly content analysis |
| `/api/cron/benchmarks` | 5 | Weekly benchmarks |
| `/api/assistant` | 4 | AI assistant endpoint |
| `/api/arena/vote` | 4 | Arena voting |
| `/api/showcase` | 5 | Showcase CRUD |

## Appendix: Database Migration Order

| Migration | Phase | Tables |
|---|---|---|
| 009_tool_intelligence.sql | 2 | tools, tool_releases, ecosystem_status, ecosystem_status_history, content_index, content_analytics |
| 010_pipeline.sql | 3 | pipeline_runs, pipeline_steps |
| 011_arena.sql | 4 | arena_challenges, arena_entries, arena_votes |
| 012_knowledge_graph.sql | 4 | knowledge_nodes, knowledge_edges |
| 013_embeddings.sql | 4 | content_embeddings + match_embeddings RPC |
| 014_showcase.sql | 5 | showcase_projects, showcase_project_tools |
| 015_personalization.sql | 5 | user_context, bookmarks |
| 016_transparency.sql | 5 | platform_costs |
| 017_benchmarks.sql | 5 | benchmarks, benchmark_results |

## Appendix: Environment Variables (New)

| Variable | Phase | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | 2 | GitHub API for release fetching (optional, higher rate limit) |
| `ANTHROPIC_API_KEY` | 2 | Claude API for classification + pipeline agents (already set) |
| `OPENAI_API_KEY` | 4 | Embeddings via text-embedding-3-small |
| `GOOGLE_AI_API_KEY` | 5 | Gemini API for benchmarks + video generation |
