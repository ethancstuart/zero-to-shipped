import { createClient } from '@/lib/supabase/server'
import { CapabilityMatrix } from '@/components/tools/capability-matrix'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare AI Coding Tools — Prototype Studio',
  description: 'Side-by-side capability comparison of AI coding tools.',
}

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
    .select('id, name, slug')
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
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">Compare Tools</h1>
      <p className="mb-8 max-w-2xl text-lg text-white/50">
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
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
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
