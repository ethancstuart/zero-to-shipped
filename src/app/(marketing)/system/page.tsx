import { listContentByPillar } from '@/lib/content/loader'
import { ContentCard } from '@/components/content/content-card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'System — Prototype Studio',
  description: 'Set up AI agents as your operating system.',
}

export const revalidate = 3600

export default async function SystemPage() {
  const playbooks = await listContentByPillar('system', { type: 'playbook' })
  const personas = await listContentByPillar('system', { type: 'persona' })
  const starters = await listContentByPillar('system', { type: 'starter' })

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">System</h1>
        <p className="max-w-2xl text-lg text-white/60">
          Set up AI agents as your operating system. Playbooks, personas, and
          starter configs to build your personal development stack.
        </p>
      </div>

      {playbooks.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Playbook</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {playbooks.map((item) => (
              <ContentCard key={item.frontmatter.slug} content={item.frontmatter} />
            ))}
          </div>
        </section>
      )}

      {personas.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Personas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {personas.map((item) => (
              <ContentCard key={item.frontmatter.slug} content={item.frontmatter} />
            ))}
          </div>
        </section>
      )}

      {starters.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Starters</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {starters.map((item) => (
              <ContentCard key={item.frontmatter.slug} content={item.frontmatter} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
