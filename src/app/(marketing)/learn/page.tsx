import { listContentByPillar } from '@/lib/content/loader'
import { ContentCard } from '@/components/content/content-card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn — Prototype Studio',
  description: 'Guides, lessons, design patterns, and resources for building with AI.',
}

export const revalidate = 3600

export default async function LearnPage() {
  const lessons = await listContentByPillar('learn', { type: 'lesson' })
  const guides = await listContentByPillar('learn', { type: 'guide' })
  const resources = await listContentByPillar('learn', { type: 'resource' })
  const patterns = await listContentByPillar('learn', { type: 'pattern' })

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">Learn</h1>
        <p className="max-w-2xl text-lg text-white/60">
          Pick up the skills you need. Lessons, guides, design patterns, and
          resources — all organized so you can learn at your own pace.
        </p>
      </div>

      {lessons.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Lessons</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((item) => (
              <ContentCard key={item.frontmatter.slug} content={item.frontmatter} />
            ))}
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Guides</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((item) => (
              <ContentCard key={item.frontmatter.slug} content={item.frontmatter} />
            ))}
          </div>
        </section>
      )}

      {resources.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Resources</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((item) => (
              <ContentCard key={item.frontmatter.slug} content={item.frontmatter} />
            ))}
          </div>
        </section>
      )}

      {patterns.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Patterns</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patterns.map((item) => (
              <ContentCard key={item.frontmatter.slug} content={item.frontmatter} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
