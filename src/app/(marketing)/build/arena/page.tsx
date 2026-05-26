import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SectionDivider } from '@/components/shared/section-divider'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { Pill } from '@/components/shared/pill'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Arena — Prototype Studio',
  description:
    'Side-by-side AI tool comparisons. Same task, different tools, real results.',
}

export const revalidate = 3600

export default async function ArenaPage() {
  const supabase = await createClient()

  const { data: challenges } = await supabase
    .from('arena_challenges')
    .select(
      `
      *,
      arena_entries (id, tool_id, tools:tool_id(name))
    `
    )
    .order('created_at', { ascending: false })

  const hasChallenges = challenges && challenges.length > 0

  return (
    <>
      {/* Header */}
      <section className="border-b border-[hsl(var(--border-base))] px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-[1300px]">
          <div className="font-mono-data mb-4 text-[10px] uppercase tracking-wider text-[hsl(var(--fg-muted))]">
            BUILD / ARENA
          </div>
          <h1 className="text-h1 mb-3">The Arena</h1>
          <p className="max-w-lg text-[hsl(var(--fg-secondary))]">
            Same task. Different tools. Real results. Watch side-by-side
            comparisons and vote on which tool handles it best.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1300px] px-6 py-12 lg:px-12">
        <SectionDivider
          number="01"
          label={
            hasChallenges
              ? `${challenges.length} challenge${challenges.length === 1 ? '' : 's'}`
              : 'challenges'
          }
        />

        {hasChallenges ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {challenges.map((challenge, i) => {
              // Extract unique tool names from entries
              const toolNames = Array.from(
                new Set(
                  (challenge.arena_entries || [])
                    .map(
                      (e: { tools?: { name: string } }) =>
                        e.tools?.name
                    )
                    .filter(Boolean)
                )
              ) as string[]

              const entryCount = (challenge.arena_entries || []).length

              return (
                <ScrollReveal key={challenge.id} delay={i * 0.05}>
                  <Link
                    href={`/build/arena/${challenge.slug}`}
                    className="group block rounded-xl border border-[hsl(var(--border-base))] p-6 transition-all duration-300 hover:border-[hsl(var(--border-hover))] hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <h3 className="text-h3 group-hover:text-[hsl(var(--accent-hsl))] transition-colors">
                        {challenge.title}
                      </h3>
                    </div>

                    <p className="mb-4 text-sm leading-relaxed text-[hsl(var(--fg-secondary))] line-clamp-2">
                      {challenge.description}
                    </p>

                    {/* Split info row */}
                    <div className="flex items-center justify-between border-t border-[hsl(var(--border-base))] pt-4">
                      <div className="flex flex-wrap gap-1.5">
                        {toolNames.length > 0 ? (
                          toolNames.map((name) => (
                            <Pill key={name}>{name}</Pill>
                          ))
                        ) : (
                          <span className="text-[10px] text-[hsl(var(--fg-faint))]">
                            No entries yet
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[hsl(var(--fg-muted))]">
                        <span className="font-mono-data text-[10px]">
                          {entryCount}{' '}
                          {entryCount === 1 ? 'entry' : 'entries'}
                        </span>
                        {challenge.time_limit_minutes && (
                          <span className="font-mono-data text-[10px]">
                            {challenge.time_limit_minutes}m limit
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border-base))] p-16 text-center">
            <p className="font-mono-data mb-2 text-sm text-[hsl(var(--fg-muted))]">
              No active challenges yet.
            </p>
            <p className="text-xs text-[hsl(var(--fg-faint))]">
              The first Arena challenge will appear soon.
            </p>
          </div>
        )}
      </section>
    </>
  )
}
