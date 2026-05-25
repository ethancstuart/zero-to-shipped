import { listContentByPillar } from '@/lib/content/loader'
import { ContentCard } from '@/components/content/content-card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pulse — Prototype Studio',
  description: "What's happening across AI coding tools.",
}

export default async function PulsePage() {
  const briefs = await listContentByPillar('pulse', { type: 'brief' })
  const comparisons = await listContentByPillar('pulse', { type: 'comparison' })
  const releases = await listContentByPillar('pulse', { type: 'release' })

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">Pulse</h1>
        <p className="max-w-2xl text-lg text-white/60">
          Stay current. Briefs, tool comparisons, and release notes — everything
          happening across the AI coding landscape in one place.
        </p>
      </div>

      {briefs.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Briefs</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {briefs.map((item) => (
              <ContentCard key={item.frontmatter.slug} content={item.frontmatter} />
            ))}
          </div>
        </section>
      )}

      {comparisons.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Comparisons</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {comparisons.map((item) => (
              <ContentCard key={item.frontmatter.slug} content={item.frontmatter} />
            ))}
          </div>
        </section>
      )}

      {releases.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Releases</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {releases.map((item) => (
              <ContentCard key={item.frontmatter.slug} content={item.frontmatter} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
