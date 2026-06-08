import { listContentByPillar, listAllContent } from '@/lib/content/loader'
import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/hero/hero-section'
import { FirstVisitBanner } from '@/components/homepage/first-visit-banner'
import { StartHereRow } from '@/components/homepage/start-here-row'
import { PinnedPillars } from '@/components/homepage/pinned-pillars'
import type { PillarData } from '@/components/homepage/pinned-pillars'
import { NumberTheater } from '@/components/homepage/number-theater'
import { BentoGrid } from '@/components/homepage/bento-grid'
import { GradientBreak } from '@/components/homepage/gradient-break'
import { HorizontalShowcase } from '@/components/homepage/horizontal-showcase'
import { SectionDivider } from '@/components/shared/section-divider'
import { ErrorBoundary } from '@/components/error-boundary'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prototype Studio — Build Real Products with AI',
  description:
    'The AI prototyping platform for PMs, analysts, and builders who want to ship. Watch sessions. Follow guides. Set up your own agent system.',
}

async function getPillarCounts() {
  try {
    const supabase = await createClient()
    const pillars = ['pulse', 'build', 'learn', 'system'] as const
    const counts: Record<string, number> = {}

    for (const pillar of pillars) {
      const items = await listContentByPillar(pillar)
      counts[pillar] = items.length
    }

    // Try to get tool count from Supabase
    let toolCount = 9
    try {
      const { count } = await supabase
        .from('tools')
        .select('*', { count: 'exact', head: true })
      if (count !== null) toolCount = count
    } catch {
      // Fallback to default
    }

    return { counts, toolCount }
  } catch {
    return {
      counts: { pulse: 0, build: 0, learn: 0, system: 0 },
      toolCount: 9,
    }
  }
}

async function getPlatformCost(): Promise<string> {
  try {
    const supabase = await createClient()
    let totalCents = 0

    // Prefer platform_costs (manual ledger). Fallback to pipeline_runs aggregate.
    const { data: ledger } = await supabase
      .from('platform_costs')
      .select('amount_cents')
    if (ledger && ledger.length > 0) {
      totalCents = ledger.reduce(
        (sum, r) => sum + (r.amount_cents || 0),
        0,
      )
    }

    if (totalCents === 0) {
      const { data: runs } = await supabase
        .from('pipeline_runs')
        .select('total_cost_cents')
      if (runs && runs.length > 0) {
        totalCents = runs.reduce(
          (sum, r) => sum + (r.total_cost_cents || 0),
          0,
        )
      }
    }

    if (totalCents <= 0) return '< $0.01'
    return `$${(totalCents / 100).toFixed(2)}`
  } catch {
    return '< $0.01'
  }
}

async function getRecentReleases() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('tool_releases')
      .select('tool_id, version, tools(name)')
      .order('released_at', { ascending: false })
      .limit(6)

    if (!data || data.length === 0) return []

    const colors = [
      'hsl(var(--pillar-pulse))',
      'hsl(var(--pillar-build))',
      'hsl(var(--pillar-learn))',
      'hsl(var(--pillar-system))',
    ]

    return data.map((r, i) => ({
      toolName: (r.tools as unknown as { name: string })?.name ?? 'Unknown',
      version: r.version ?? '',
      color: colors[i % colors.length],
    }))
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [{ counts, toolCount }, recentReleases, allItems, platformCost] = await Promise.all([
    getPillarCounts(),
    getRecentReleases(),
    listAllContent(),
    getPlatformCost(),
  ])

  // /api/v1 paths in docs/api/openapi.yaml: tools, tools/{slug}, tools/{slug}/releases,
  // compare, capabilities, capabilities/{capability}, pulse, pulse/weekly, showcase,
  // stats, benchmarks, benchmarks/{slug}/results = 12
  const endpointCount = 12

  const pillarData: PillarData[] = [
    {
      name: 'pulse',
      title: "What's happening",
      description:
        'Real-time tracking of AI coding tools. Release briefs, comparisons, and capability analysis across the ecosystem.',
      stats: [
        { value: toolCount, label: 'tools tracked' },
        { value: counts.pulse || 0, label: 'briefs' },
        { value: 270, label: 'capabilities' },
      ],
    },
    {
      name: 'build',
      title: 'Watch it get built',
      description:
        'Full build sessions recorded from zero to shipped product. Real decisions, real agent prompts, real outcomes.',
      stats: [
        { value: counts.build || 0, label: 'sessions' },
        { value: 4, label: 'projects shipped' },
        { value: 34, label: 'features built' },
      ],
    },
    {
      name: 'learn',
      title: 'Pick up the skills',
      description:
        'Guides, patterns, and resources for non-engineers building with AI tools. From first prompt to production.',
      stats: [
        { value: counts.learn || 0, label: 'resources' },
        { value: 3, label: 'difficulty levels' },
        { value: allItems.length, label: 'total items' },
      ],
    },
    {
      name: 'system',
      title: 'Your agent operating system',
      description:
        'Starters, playbooks, and configurations for setting up multi-agent workflows. Copy, customize, ship.',
      stats: [
        { value: counts.system || 0, label: 'configs' },
        { value: 5, label: 'agent patterns' },
        { value: 12, label: 'API endpoints' },
      ],
    },
  ]

  return (
    <>
      <ErrorBoundary section="hero">
        <HeroSection />
      </ErrorBoundary>
      <FirstVisitBanner />

      <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
        <ErrorBoundary section="start-here-row">
          <StartHereRow />
        </ErrorBoundary>
        <SectionDivider number="01" label="Platform" />
      </div>

      <ErrorBoundary section="pinned-pillars">
        <PinnedPillars pillarData={pillarData} />
      </ErrorBoundary>

      <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
        <ErrorBoundary section="number-theater">
          <NumberTheater />
        </ErrorBoundary>
        <SectionDivider number="02" label="Features" />
        <ErrorBoundary section="bento-grid">
          <BentoGrid
            recentReleases={recentReleases}
            platformCost={platformCost}
            endpointCount={endpointCount}
          />
        </ErrorBoundary>
      </div>

      <ErrorBoundary section="gradient-break">
        <GradientBreak />
      </ErrorBoundary>

      <div className="max-w-[1300px] mx-auto px-6 lg:px-12 py-40">
        <SectionDivider number="03" label="Showcase" />
      </div>

      <ErrorBoundary section="horizontal-showcase">
        <HorizontalShowcase />
      </ErrorBoundary>
    </>
  )
}
