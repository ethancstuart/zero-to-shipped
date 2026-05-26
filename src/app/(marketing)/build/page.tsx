import { listContentByPillar } from '@/lib/content/loader'
import { FilterableContentGrid } from '@/components/content/filterable-content-grid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Build — Prototype Studio',
  description: 'Watch someone build, then do it yourself.',
}

export const revalidate = 3600

export default async function BuildPage() {
  const items = await listContentByPillar('build')

  return (
    <>
      <section className="bg-[hsl(var(--pillar-build-surface))] border-b border-[hsl(var(--pillar-build-border))] py-20 px-6 lg:px-12">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-[10px] tracking-wider font-medium uppercase text-[hsl(var(--pillar-build))] mb-4">
            BUILD
          </div>
          <h1 className="text-h1 mb-3">Build</h1>
          <p className="text-[hsl(var(--fg-secondary))] max-w-lg">
            Watch someone build, then do it yourself.
          </p>
        </div>
      </section>

      <section className="max-w-[1300px] mx-auto px-6 lg:px-12 py-12">
        <FilterableContentGrid
          items={items.map(i => i.frontmatter)}
          types={['session', 'challenge', 'walkthrough']}
          pillar="build"
        />
      </section>
    </>
  )
}
