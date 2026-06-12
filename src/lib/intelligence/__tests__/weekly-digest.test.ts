import { describe, it, expect } from 'vitest'
import matter from 'gray-matter'
import {
  composeWeeklyDigest,
  type DigestRelease,
  type DigestContentRef,
} from '../weekly-digest'

const releases: DigestRelease[] = [
  {
    tool: { name: 'Claude Code', slug: 'claude-code' },
    version: '2.4.0',
    significance: 'major',
    summary: 'Added skills, longer-running tasks, new memory model.',
    release_date: '2026-06-09',
  },
  {
    tool: { name: 'Claude Code', slug: 'claude-code' },
    version: '2.3.5',
    significance: 'patch',
    summary: 'Bug fixes.',
    release_date: '2026-06-07',
  },
  {
    tool: { name: 'Cursor', slug: 'cursor' },
    version: '0.51.0',
    significance: 'minor',
    summary: 'Composer panel overhaul.',
    release_date: '2026-06-08',
  },
]

const content: DigestContentRef[] = [
  {
    slug: 'claude-code-2-4-0-release',
    title: 'Claude Code 2.4.0 — skills land for real',
    published_at: '2026-06-09T00:00:00Z',
  },
]

const wrapUp = "Claude Code's 2.4 is the big story. I'm switching back this week."

describe('composeWeeklyDigest', () => {
  it('builds a slug + title scoped to the week start', () => {
    const out = composeWeeklyDigest({
      weekStarting: '2026-06-08',
      releases,
      newContent: content,
      wrapUp,
    })
    expect(out.slug).toBe('weekly-digest-2026-06-08')
    expect(out.title).toMatch(/This Week in AI Coding/)
  })

  it('produces parseable frontmatter with series: weekly-digest', () => {
    const out = composeWeeklyDigest({
      weekStarting: '2026-06-08',
      releases,
      newContent: content,
      wrapUp,
    })
    const parsed = matter(out.mdx)
    expect(parsed.data.series).toBe('weekly-digest')
    expect(parsed.data.pillar).toBe('pulse')
    expect(parsed.data.type).toBe('brief')
    expect(parsed.data.status).toBe('published')
    expect(parsed.data.slug).toBe(out.slug)
    expect(parsed.data.tools).toEqual(['claude-code', 'cursor'])
    expect(parsed.data.tags).toContain('weekly-digest')
  })

  it('defaults weekEnding to weekStarting + 6 days', () => {
    const out = composeWeeklyDigest({
      weekStarting: '2026-06-08',
      releases: [],
      newContent: [],
      wrapUp,
    })
    expect(out.publishedAt).toBe('2026-06-14')
  })

  it('groups releases by tool and orders within tool by significance', () => {
    const out = composeWeeklyDigest({
      weekStarting: '2026-06-08',
      releases,
      newContent: content,
      wrapUp,
    })
    const body = out.mdx
    expect(body).toContain('### Claude Code')
    expect(body).toContain('### Cursor')
    // major (2.4.0) should appear before patch (2.3.5) under Claude Code
    expect(body.indexOf('2.4.0')).toBeLessThan(body.indexOf('2.3.5'))
  })

  it('handles a quiet week with no releases', () => {
    const out = composeWeeklyDigest({
      weekStarting: '2026-06-08',
      releases: [],
      newContent: [],
      wrapUp: "Quiet weeks come before loud ones — that's the pattern.",
    })
    expect(out.mdx).toMatch(/quiet week|Quiet week/)
    const parsed = matter(out.mdx)
    expect(parsed.data.tools).toEqual([])
  })

  it('embeds the Ethan-voiced wrap-up verbatim', () => {
    const out = composeWeeklyDigest({
      weekStarting: '2026-06-08',
      releases,
      newContent: content,
      wrapUp,
    })
    expect(out.mdx).toContain(wrapUp)
  })

  it('links published briefs to /pulse/[slug]', () => {
    const out = composeWeeklyDigest({
      weekStarting: '2026-06-08',
      releases,
      newContent: content,
      wrapUp,
    })
    expect(out.mdx).toContain('[Claude Code 2.4.0 — skills land for real](/pulse/claude-code-2-4-0-release)')
  })
})
