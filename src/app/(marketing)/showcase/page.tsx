import { createClient } from '@/lib/supabase/server'
import { SectionDivider } from '@/components/shared/section-divider'
import { MagneticButton } from '@/components/shared/magnetic-button'
import { ShowcaseGrid } from './showcase-grid'
import type { Metadata } from 'next'
import type { ShowcaseProject } from '@/types/showcase'

export const metadata: Metadata = {
  title: 'Showcase — Prototype Studio',
  description: 'See what people are building with AI coding tools.',
}

export const revalidate = 3600

const seedProjects = [
  {
    id: 'seed-1',
    title: 'Meridian Intelligence',
    description:
      'Non-QM lending intelligence platform with 34 features.',
    tools: ['Claude Code'],
    buildTime: '4 weeks',
  },
  {
    id: 'seed-2',
    title: 'RidgeCap Capital',
    description:
      'CRE investment platform with deal flow and analytics.',
    tools: ['Claude Code'],
    buildTime: '3 weeks',
  },
  {
    id: 'seed-3',
    title: 'NexusWatch',
    description:
      'Geopolitical intelligence with 45+ data layers and AI analysis.',
    tools: ['Claude Code'],
    buildTime: '6 weeks',
  },
  {
    id: 'seed-4',
    title: 'LongTable',
    description:
      'AI-powered travel planning with booking and cost optimization.',
    tools: ['Claude Code'],
    buildTime: '2 weeks',
  },
]

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>
}) {
  const { tool } = await searchParams
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('showcase_projects')
    .select(
      `*, showcase_project_tools(tool_id, tools:tool_id(name, slug))`
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  // Get all tools for filter
  const { data: tools } = await supabase
    .from('tools')
    .select('name, slug')
    .order('name')

  // Filter by tool client-side
  const filtered = tool
    ? (projects || []).filter((p: ShowcaseProject) =>
        (p.showcase_project_tools || []).some(
          (t) => t.tools?.slug === tool
        )
      )
    : projects || []

  const hasDbProjects = filtered.length > 0

  return (
    <>
      {/* Header */}
      <section className="border-b border-[hsl(var(--border-base))] px-6 py-20 lg:px-12">
        <div className="mx-auto flex max-w-[1300px] items-end justify-between">
          <div>
            <div className="font-mono-data mb-4 text-[10px] uppercase tracking-wider text-[hsl(var(--fg-muted))]">
              SHOWCASE
            </div>
            <h1 className="text-h1 mb-3">Showcase</h1>
            <p className="max-w-lg text-[hsl(var(--fg-secondary))]">
              See what people are building with AI coding tools.
            </p>
          </div>
          <MagneticButton href="/showcase/submit" variant="primary">
            Submit your build
          </MagneticButton>
        </div>
      </section>

      <section className="mx-auto max-w-[1300px] px-6 py-12 lg:px-12">
        <SectionDivider
          number="01"
          label={hasDbProjects ? `${filtered.length} projects` : `${seedProjects.length} projects`}
        />

        {/* Tool filter pills */}
        <div className="mb-10 flex flex-wrap gap-2">
          <a
            href="/showcase"
            className={`rounded-full border px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
              !tool
                ? 'border-[hsl(var(--fg))] bg-[hsl(var(--fg))] text-[hsl(var(--bg))]'
                : 'border-[hsl(var(--border-base))] text-[hsl(var(--fg-muted))] hover:border-[hsl(var(--border-hover))] hover:text-[hsl(var(--fg-secondary))]'
            }`}
          >
            All
          </a>
          {tools?.map((t) => (
            <a
              key={t.slug}
              href={`/showcase?tool=${t.slug}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
                tool === t.slug
                  ? 'border-[hsl(var(--fg))] bg-[hsl(var(--fg))] text-[hsl(var(--bg))]'
                  : 'border-[hsl(var(--border-base))] text-[hsl(var(--fg-muted))] hover:border-[hsl(var(--border-hover))] hover:text-[hsl(var(--fg-secondary))]'
              }`}
            >
              {t.name}
            </a>
          ))}
        </div>

        {/* Projects */}
        {hasDbProjects ? (
          <ShowcaseGrid projects={filtered} />
        ) : (
          <ShowcaseGrid seeds={seedProjects} />
        )}
      </section>
    </>
  )
}
