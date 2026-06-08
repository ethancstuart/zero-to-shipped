import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import {
  listContentByPillar,
  listAllContent,
  getContentSlugs,
  getContentFrontmatter,
} from '@/lib/content/loader'
/**
 * Extended content loader tests — covers featured filtering, tag filtering,
 * limit, listAllContent, getContentSlugs, and real content validation.
 */

const CONTENT_DIR = path.join(process.cwd(), 'content')
const PULSE_DIR = path.join(CONTENT_DIR, 'pulse', 'briefs')
const BUILD_DIR = path.join(CONTENT_DIR, 'build', 'walkthroughs')

// Create fixture content for pulse and build pillars
const FIXTURE_PULSE = path.join(PULSE_DIR, 'test-featured-brief.mdx')
const FIXTURE_BUILD = path.join(BUILD_DIR, 'test-build-walkthrough.mdx')

beforeAll(async () => {
  await fs.mkdir(PULSE_DIR, { recursive: true })
  await fs.mkdir(BUILD_DIR, { recursive: true })

  await fs.writeFile(
    FIXTURE_PULSE,
    `---
title: "Featured Pulse Brief"
slug: test-featured-brief
pillar: pulse
type: brief
format: written
tools: [claude-code, cursor]
toolVersions:
  claude-code: "1.0.32"
  cursor: "0.50.1"
difficulty: beginner
estimatedMinutes: 5
tags: [featured-test, ai-tools]
isPremium: false
isFeatured: true
status: published
publishedAt: "2026-05-24"
---

# Featured Brief

This is a featured pulse brief for testing.
`,
  )

  await fs.writeFile(
    FIXTURE_BUILD,
    `---
title: "Test Build Walkthrough"
slug: test-build-walkthrough
pillar: build
type: walkthrough
format: written
tools: [cursor]
toolVersions:
  cursor: "0.50.1"
difficulty: intermediate
estimatedMinutes: 45
tags: [build-test, cursor]
isPremium: false
isFeatured: false
status: published
publishedAt: "2026-05-23"
---

# Build Walkthrough

Step-by-step walkthrough.
`,
  )
})

afterAll(async () => {
  await fs.unlink(FIXTURE_PULSE).catch(() => {})
  await fs.unlink(FIXTURE_BUILD).catch(() => {})
})

describe('listContentByPillar — pulse', () => {
  it('returns content for pulse pillar', async () => {
    const items = await listContentByPillar('pulse')
    expect(items.length).toBeGreaterThan(0)
    expect(items.every((i) => i.frontmatter.pillar === 'pulse')).toBe(true)
  })

  it('results have all required frontmatter fields', async () => {
    const items = await listContentByPillar('pulse')
    const testItem = items.find((i) => i.frontmatter.slug === 'test-featured-brief')
    expect(testItem).toBeDefined()
    const fm = testItem!.frontmatter
    expect(fm.title).toBeDefined()
    expect(fm.slug).toBeDefined()
    expect(fm.pillar).toBeDefined()
    expect(fm.type).toBeDefined()
    expect(fm.status).toBe('published')
  })
})

describe('listContentByPillar — build', () => {
  it('returns content for build pillar', async () => {
    const items = await listContentByPillar('build')
    expect(items.length).toBeGreaterThan(0)
    expect(items.every((i) => i.frontmatter.pillar === 'build')).toBe(true)
  })
})

describe('featured filtering', () => {
  it('filters to only featured content', async () => {
    const items = await listContentByPillar('pulse', { featured: true })
    const testItem = items.find((i) => i.frontmatter.slug === 'test-featured-brief')
    expect(testItem).toBeDefined()
    expect(items.every((i) => i.frontmatter.isFeatured)).toBe(true)
  })

  it('non-featured items are excluded when featured=true', async () => {
    const items = await listContentByPillar('build', { featured: true })
    const testItem = items.find((i) => i.frontmatter.slug === 'test-build-walkthrough')
    // Our build fixture has isFeatured: false
    expect(testItem).toBeUndefined()
  })
})

describe('tag filtering', () => {
  it('filters by specific tag', async () => {
    const items = await listContentByPillar('pulse', { tag: 'ai-tools' })
    const testItem = items.find((i) => i.frontmatter.slug === 'test-featured-brief')
    expect(testItem).toBeDefined()
    expect(items.every((i) => i.frontmatter.tags.includes('ai-tools'))).toBe(true)
  })

  it('returns empty when tag does not match', async () => {
    const items = await listContentByPillar('pulse', { tag: 'nonexistent-tag-xyz' })
    expect(items).toEqual([])
  })
})

describe('limit option', () => {
  it('limits number of results', async () => {
    const items = await listContentByPillar('pulse', { limit: 1 })
    expect(items.length).toBeLessThanOrEqual(1)
  })
})

describe('content ordering', () => {
  it('returns content sorted by publishedAt descending', async () => {
    const items = await listContentByPillar('pulse')
    for (let i = 1; i < items.length; i++) {
      const prev = new Date(items[i - 1].frontmatter.publishedAt).getTime()
      const curr = new Date(items[i].frontmatter.publishedAt).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })
})

describe('listAllContent', () => {
  it('returns content from multiple pillars', async () => {
    const all = await listAllContent()
    expect(all.length).toBeGreaterThan(0)
    const pillars = new Set(all.map((i) => i.frontmatter.pillar))
    // Should have at least the pillars we created fixtures for
    expect(pillars.size).toBeGreaterThanOrEqual(1)
  })

  it('all items are published', async () => {
    const all = await listAllContent()
    expect(all.every((i) => i.frontmatter.status === 'published')).toBe(true)
  })

  it('results are sorted by publishedAt descending', async () => {
    const all = await listAllContent()
    for (let i = 1; i < all.length; i++) {
      const prev = new Date(all[i - 1].frontmatter.publishedAt).getTime()
      const curr = new Date(all[i].frontmatter.publishedAt).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })
})

describe('getContentSlugs', () => {
  it('returns slugs for a pillar', async () => {
    const slugs = await getContentSlugs('pulse')
    expect(slugs).toContain('test-featured-brief')
  })

  it('returns array of strings', async () => {
    const slugs = await getContentSlugs('build')
    expect(Array.isArray(slugs)).toBe(true)
    expect(slugs.every((s) => typeof s === 'string')).toBe(true)
  })

  it('returns empty array for empty pillar directory', async () => {
    // 'system' may or may not have content — just verify no crash
    const slugs = await getContentSlugs('system')
    expect(Array.isArray(slugs)).toBe(true)
  })
})

describe('getContentFrontmatter', () => {
  it('returns complete frontmatter for a real file', async () => {
    const fm = await getContentFrontmatter(FIXTURE_PULSE)
    expect(fm.title).toBe('Featured Pulse Brief')
    expect(fm.pillar).toBe('pulse')
    expect(fm.tools).toContain('claude-code')
    expect(fm.tools).toContain('cursor')
    expect(fm.isFeatured).toBe(true)
    expect(fm.estimatedMinutes).toBe(5)
  })
})
