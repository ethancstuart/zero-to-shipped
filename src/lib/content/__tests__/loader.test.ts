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
