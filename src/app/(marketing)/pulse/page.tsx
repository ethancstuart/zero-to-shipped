import { listContentByPillar } from '@/lib/content/loader'
import { FilterableContentGrid } from '@/components/content/filterable-content-grid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pulse — Prototype Studio',
  description: "What's happening across AI coding tools.",
}

export const revalidate = 900

export default async function PulsePage() {
  const items = await listContentByPillar('pulse')

  return (
    <>
      <section className="bg-[hsl(var(--pillar-pulse-surface))] border-b border-[hsl(var(--pillar-pulse-border))] py-20 px-6 lg:px-12">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-[10px] tracking-wider font-medium uppercase text-[hsl(var(--pillar-pulse))] mb-4">
            PULSE
          </div>
          <h1 className="text-h1 mb-3">Pulse</h1>
          <p className="text-[hsl(var(--fg-secondary))] max-w-lg">
            What&apos;s happening across AI coding tools.
          </p>
        </div>
      </section>

      <section className="max-w-[1300px] mx-auto px-6 lg:px-12 py-12">
        <FilterableContentGrid
          items={items.map(i => i.frontmatter)}
          types={['brief', 'comparison', 'release']}
          pillar="pulse"
        />
      </section>
    </>
  )
}
