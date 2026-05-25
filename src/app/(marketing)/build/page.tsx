import { listContentByPillar } from '@/lib/content/loader'
import { ContentCard } from '@/components/content/content-card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Build — Prototype Studio',
  description: 'Watch someone build, then do it yourself.',
}

export default async function BuildPage() {
  const sessions = await listContentByPillar('build', { type: 'session' })
  const challenges = await listContentByPillar('build', { type: 'challenge' })
  const walkthroughs = await listContentByPillar('build', { type: 'walkthrough' })

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">Build</h1>
        <p className="max-w-2xl text-lg text-white/60">
          Watch someone build, then do it yourself. Live sessions, step-by-step
          walkthroughs, and hands-on challenges.
        </p>
      </div>

      {sessions.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Sessions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((item) => (
              <ContentCard key={item.frontmatter.slug} content={item.frontmatter} />
            ))}
          </div>
        </section>
      )}

      {challenges.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Challenges</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {challenges.map((item) => (
              <ContentCard key={item.frontmatter.slug} content={item.frontmatter} />
            ))}
          </div>
        </section>
      )}

      {walkthroughs.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Walkthroughs</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {walkthroughs.map((item) => (
              <ContentCard key={item.frontmatter.slug} content={item.frontmatter} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
