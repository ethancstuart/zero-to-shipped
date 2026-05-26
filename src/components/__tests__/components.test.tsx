import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'

/**
 * Component render tests — verify that key shared/content/motion components
 * render without throwing. Uses @testing-library/react render().
 */

// ── Mock next/link ────────────────────────────────────────────────
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}))

// ── Mock next/image ───────────────────────────────────────────────
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) =>
    React.createElement('img', props),
}))

// ── Mock GSAP (not available in jsdom) ────────────────────────────
vi.mock('@/lib/gsap', () => ({
  gsap: {
    set: vi.fn(),
    to: vi.fn(),
    registerPlugin: vi.fn(),
  },
  ScrollTrigger: {
    create: vi.fn(() => ({ kill: vi.fn() })),
  },
}))

vi.mock('@/lib/use-gsap', () => ({
  useGsapReveal: vi.fn(() => ({ current: null })),
}))

// ── Pill ──────────────────────────────────────────────────────────
import { Pill } from '@/components/shared/pill'

describe('Pill', () => {
  it('renders without crashing', () => {
    const { container } = render(<Pill>Tag</Pill>)
    expect(container.textContent).toContain('Tag')
  })

  it('renders with pulse pillar', () => {
    const { container } = render(<Pill pillar="pulse">Pulse</Pill>)
    expect(container.textContent).toContain('Pulse')
  })

  it('renders with build pillar', () => {
    const { container } = render(<Pill pillar="build">Build</Pill>)
    expect(container.textContent).toContain('Build')
  })

  it('renders with learn pillar', () => {
    const { container } = render(<Pill pillar="learn">Learn</Pill>)
    expect(container.textContent).toContain('Learn')
  })

  it('renders with system pillar', () => {
    const { container } = render(<Pill pillar="system">System</Pill>)
    expect(container.textContent).toContain('System')
  })

  it('renders without pillar (default style)', () => {
    const { container } = render(<Pill>Default</Pill>)
    expect(container.querySelector('span')).toBeTruthy()
  })

  it('applies custom className', () => {
    const { container } = render(<Pill className="custom-class">Test</Pill>)
    expect(container.querySelector('.custom-class')).toBeTruthy()
  })
})

// ── SectionDivider ────────────────────────────────────────────────
import { SectionDivider } from '@/components/shared/section-divider'

describe('SectionDivider', () => {
  it('renders without crashing', () => {
    const { container } = render(<SectionDivider number="01" label="OVERVIEW" />)
    expect(container.textContent).toContain('01')
    expect(container.textContent).toContain('OVERVIEW')
  })

  it('renders with different number and label', () => {
    const { container } = render(<SectionDivider number="03" label="TOOLS" />)
    expect(container.textContent).toContain('03')
    expect(container.textContent).toContain('TOOLS')
  })
})

// ── MagneticButton ────────────────────────────────────────────────
import { MagneticButton } from '@/components/shared/magnetic-button'

describe('MagneticButton', () => {
  it('renders primary variant by default', () => {
    const { container } = render(<MagneticButton href="/test">Click me</MagneticButton>)
    expect(container.textContent).toContain('Click me')
    expect(container.querySelector('a')).toBeTruthy()
  })

  it('renders secondary variant', () => {
    const { container } = render(
      <MagneticButton variant="secondary" href="/test">Secondary</MagneticButton>,
    )
    expect(container.textContent).toContain('Secondary')
  })

  it('renders ghost variant', () => {
    const { container } = render(
      <MagneticButton variant="ghost" href="/test">Ghost</MagneticButton>,
    )
    expect(container.textContent).toContain('Ghost')
  })

  it('passes href to anchor', () => {
    const { container } = render(<MagneticButton href="/tools">Link</MagneticButton>)
    const anchor = container.querySelector('a')
    expect(anchor?.getAttribute('href')).toBe('/tools')
  })
})

// ── ContentCard ───────────────────────────────────────────────────
import { ContentCard } from '@/components/content/content-card'
import type { ContentFrontmatter } from '@/types/content'

const mockContent: ContentFrontmatter = {
  title: 'Test Content Card',
  slug: 'test-content-card',
  pillar: 'learn',
  type: 'lesson',
  format: 'written',
  tools: ['claude-code', 'cursor'],
  toolVersions: { 'claude-code': '1.0.32' },
  difficulty: 'beginner',
  estimatedMinutes: 15,
  tags: ['testing'],
  isPremium: false,
  isFeatured: false,
  status: 'published',
  publishedAt: '2026-05-25',
}

describe('ContentCard', () => {
  it('renders without crashing', () => {
    const { container } = render(<ContentCard content={mockContent} />)
    expect(container.textContent).toContain('Test Content Card')
  })

  it('displays pillar and type pills', () => {
    const { container } = render(<ContentCard content={mockContent} />)
    expect(container.textContent).toContain('learn')
    expect(container.textContent).toContain('lesson')
  })

  it('displays tools', () => {
    const { container } = render(<ContentCard content={mockContent} />)
    expect(container.textContent).toContain('claude-code')
  })

  it('displays estimated minutes', () => {
    const { container } = render(<ContentCard content={mockContent} />)
    expect(container.textContent).toContain('15 min')
  })

  it('displays difficulty', () => {
    const { container } = render(<ContentCard content={mockContent} />)
    expect(container.textContent).toContain('Beginner')
  })

  it('links to correct path', () => {
    const { container } = render(<ContentCard content={mockContent} />)
    const link = container.querySelector('a')
    expect(link?.getAttribute('href')).toBe('/learn/test-content-card')
  })
})

// ── PillarCard ────────────────────────────────────────────────────
import { PillarCard } from '@/components/content/pillar-card'

describe('PillarCard', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <PillarCard pillar="pulse" title="Pulse" description="Latest updates" count="12 items" />,
    )
    expect(container.textContent).toContain('Pulse')
    expect(container.textContent).toContain('Latest updates')
  })

  it('renders with build pillar', () => {
    const { container } = render(
      <PillarCard pillar="build" title="Build" description="Walkthroughs" count="8 items" />,
    )
    expect(container.textContent).toContain('Build')
    expect(container.textContent).toContain('8 items')
  })

  it('links to the correct pillar page', () => {
    const { container } = render(
      <PillarCard pillar="learn" title="Learn" description="Lessons" count="20 items" />,
    )
    const link = container.querySelector('a')
    expect(link?.getAttribute('href')).toBe('/learn')
  })

  it('renders count string', () => {
    const { container } = render(
      <PillarCard pillar="system" title="System" description="Config" count="5 items" />,
    )
    expect(container.textContent).toContain('5 items')
  })
})

// ── ToolCard ──────────────────────────────────────────────────────
import { ToolCard } from '@/components/content/tool-card'

describe('ToolCard', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ToolCard
        slug="claude-code"
        name="Claude Code"
        category="IDE"
        description="AI coding assistant"
        currentVersion="1.0.32"
        logoUrl={null}
      />,
    )
    expect(container.textContent).toContain('Claude Code')
  })

  it('displays category as pill', () => {
    const { container } = render(
      <ToolCard slug="cursor" name="Cursor" category="IDE" description="Editor" currentVersion={null} logoUrl={null} />,
    )
    expect(container.textContent).toContain('IDE')
  })

  it('displays version when provided', () => {
    const { container } = render(
      <ToolCard slug="test" name="Test" category="AI" description={null} currentVersion="2.0.0" logoUrl={null} />,
    )
    expect(container.textContent).toContain('2.0.0')
  })

  it('renders without version when null', () => {
    const { container } = render(
      <ToolCard slug="test" name="Test" category="AI" description={null} currentVersion={null} logoUrl={null} />,
    )
    // Should not crash
    expect(container.textContent).toContain('Test')
  })

  it('renders description when provided', () => {
    const { container } = render(
      <ToolCard slug="test" name="Test" category="AI" description="A great tool" currentVersion={null} logoUrl={null} />,
    )
    expect(container.textContent).toContain('A great tool')
  })

  it('links to correct tool page', () => {
    const { container } = render(
      <ToolCard slug="claude-code" name="Claude Code" category="IDE" description={null} currentVersion={null} logoUrl={null} />,
    )
    const link = container.querySelector('a')
    expect(link?.getAttribute('href')).toBe('/tools/claude-code')
  })
})

// ── GrainOverlay ──────────────────────────────────────────────────
import { GrainOverlay } from '@/components/motion/grain-overlay'

describe('GrainOverlay', () => {
  it('renders without crashing', () => {
    const { container } = render(<GrainOverlay />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders a fixed-position div', () => {
    const { container } = render(<GrainOverlay />)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('fixed')
    expect(div.className).toContain('pointer-events-none')
  })
})

// ── ScrollProgress ────────────────────────────────────────────────
import { ScrollProgress } from '@/components/motion/scroll-progress'

describe('ScrollProgress', () => {
  it('renders without crashing', () => {
    const { container } = render(<ScrollProgress />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders a fixed-position progress bar', () => {
    const { container } = render(<ScrollProgress />)
    const outer = container.firstChild as HTMLElement
    expect(outer.className).toContain('fixed')
  })

  it('starts with 0% width', () => {
    const { container } = render(<ScrollProgress />)
    const inner = container.querySelector('[style]') as HTMLElement
    expect(inner?.style.width).toBe('0%')
  })
})
