import { createClient } from '@/lib/supabase/server'
import { SectionDivider } from '@/components/shared/section-divider'
import { ToolsCategoryFilter } from './tools-category-filter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Coding Tools — Prototype Studio',
  description: 'Track 9 AI coding tools — releases, capabilities, and comparisons.',
}

export const revalidate = 3600

export default async function ToolsPage() {
  const supabase = await createClient()
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .order('name')

  const allTools = tools || []

  // Extract distinct categories
  const categories = Array.from(
    new Set(allTools.map((t) => t.category).filter(Boolean))
  ).sort() as string[]

  return (
    <>
      <section className="border-b border-[hsl(var(--border-base))] px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-[1300px]">
          <div className="font-mono-data mb-4 text-[10px] uppercase tracking-wider text-[hsl(var(--fg-muted))]">
            TOOLS
          </div>
          <h1 className="text-h1 mb-3">AI Coding Tools</h1>
          <p className="max-w-lg text-[hsl(var(--fg-secondary))]">
            We track releases and capabilities across {allTools.length} AI coding
            tools so you always know what&apos;s current.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1300px] px-6 py-12 lg:px-12">
        <SectionDivider number="01" label={`${allTools.length} tools`} />

        <ToolsCategoryFilter tools={allTools} categories={categories} />
      </section>
    </>
  )
}
