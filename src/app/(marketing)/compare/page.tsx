import { createClient } from '@/lib/supabase/server'
import { CapabilityMatrix } from '@/components/tools/capability-matrix'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare AI Coding Tools — Prototype Studio',
  description: 'Side-by-side capability comparison of AI coding tools.',
}

export const revalidate = 3600

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ tools?: string }>
}) {
  const { tools: toolsParam } = await searchParams
  const supabase = await createClient()

  const { data: allTools } = await supabase
    .from('tools')
    .select('id, name, slug')
    .order('name')

  const selectedSlugs =
    toolsParam?.split(',').filter(Boolean) || allTools?.map((t) => t.slug) || []

  const { data: selectedTools } = await supabase
    .from('tools')
    .select('id, name, slug, company_slug')
    .in('slug', selectedSlugs)
    .order('name')

  const toolIds = selectedTools?.map((t) => t.id) || []

  const { data: capabilities } = await supabase
    .from('ecosystem_status')
    .select('*')
    .in('tool_id', toolIds)
    .order('category')

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-[hsl(var(--fg))]">Compare Tools</h1>
      <p className="mb-8 max-w-2xl text-lg text-[hsl(var(--fg-secondary))]">
        Side-by-side capability comparison across AI coding tools.
      </p>

      {/* Tool selector */}
      <div className="mb-8 flex flex-wrap gap-2">
        {allTools?.map((tool) => {
          const isSelected = selectedSlugs.includes(tool.slug)
          return (
            <a
              key={tool.slug}
              href={`/compare?tools=${
                isSelected
                  ? selectedSlugs.filter((s) => s !== tool.slug).join(',')
                  : [...selectedSlugs, tool.slug].join(',')
              }`}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                isSelected
                  ? 'border-[hsl(var(--border-hover))] bg-[hsl(var(--bg-muted))] text-[hsl(var(--fg))]'
                  : 'border-[hsl(var(--border-base))] text-[hsl(var(--fg-muted))] hover:border-[hsl(var(--border-hover))] hover:text-[hsl(var(--fg-secondary))]'
              }`}
            >
              {tool.name}
            </a>
          )
        })}
      </div>

      <CapabilityMatrix
        tools={selectedTools || []}
        capabilities={capabilities || []}
      />
    </div>
  )
}
