import { listContentByPillar } from '@/lib/content/loader'
import { FilterableContentGrid } from '@/components/content/filterable-content-grid'
import { LearningPath } from '@/components/content/learning-path'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn — Prototype Studio',
  description: 'Guides, lessons, design patterns, and resources for building with AI.',
}

export const revalidate = 3600

export default async function LearnPage() {
  const allItems = await listContentByPillar('learn')

  const lessons = allItems
    .filter(i => i.frontmatter.type === 'lesson')
    .map(i => i.frontmatter)

  const nonLessons = allItems
    .filter(i => i.frontmatter.type !== 'lesson')
    .map(i => i.frontmatter)

  return (
    <>
      <section className="bg-[hsl(var(--pillar-learn-surface))] border-b border-[hsl(var(--pillar-learn-border))] py-20 px-6 lg:px-12">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-[10px] tracking-wider font-medium uppercase text-[hsl(var(--pillar-learn))] mb-4">
            LEARN
          </div>
          <h1 className="text-h1 mb-3">Learn</h1>
          <p className="text-[hsl(var(--fg-secondary))] max-w-lg">
            Guides, lessons, design patterns, and resources for building with AI.
          </p>
        </div>
      </section>

      <section className="max-w-[1300px] mx-auto px-6 lg:px-12 py-12">
        <LearningPath lessons={lessons} />

        <div className="mt-8">
          <h2 className="text-h2 mb-6">Also available</h2>
          <FilterableContentGrid
            items={nonLessons}
            types={['guide', 'resource', 'pattern']}
            pillar="learn"
          />
        </div>
      </section>
    </>
  )
}
