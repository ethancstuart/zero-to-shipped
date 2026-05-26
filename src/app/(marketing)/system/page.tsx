import { listContentByPillar } from '@/lib/content/loader'
import { FilterableContentGrid } from '@/components/content/filterable-content-grid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'System — Prototype Studio',
  description: 'Set up AI agents as your operating system.',
}

export const revalidate = 3600

export default async function SystemPage() {
  const items = await listContentByPillar('system')

  return (
    <>
      <section className="bg-[hsl(var(--pillar-system-surface))] border-b border-[hsl(var(--pillar-system-border))] py-20 px-6 lg:px-12">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-[10px] tracking-wider font-medium uppercase text-[hsl(var(--pillar-system))] mb-4">
            SYSTEM
          </div>
          <h1 className="text-h1 mb-3">System</h1>
          <p className="text-[hsl(var(--fg-secondary))] max-w-lg">
            Set up AI agents as your operating system.
          </p>
        </div>
      </section>

      <section className="max-w-[1300px] mx-auto px-6 lg:px-12 py-12">
        <FilterableContentGrid
          items={items.map(i => i.frontmatter)}
          types={['playbook', 'persona', 'starter']}
          pillar="system"
        />
      </section>
    </>
  )
}
