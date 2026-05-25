import { describe, it, expect } from 'vitest'
import {
  type ContentFrontmatter,
  PILLARS,
  CONTENT_TYPES,
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
