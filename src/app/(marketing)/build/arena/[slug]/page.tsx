import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SideBySide } from '@/components/arena/side-by-side'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('arena_challenges')
    .select('title, description')
    .eq('slug', slug)
    .single()
  if (!data) return { title: 'Not Found' }
  return {
    title: `${data.title} — The Arena — Prototype Studio`,
    description: data.description,
  }
}

export default async function ArenaDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: challenge } = await supabase
    .from('arena_challenges')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!challenge) notFound()

  const { data: entries } = await supabase
    .from('arena_entries')
    .select(`
      *,
      tools:tool_id (name, slug)
    `)
    .eq('challenge_id', challenge.id)
    .order('created_at')

  // Get vote counts per tool for this challenge
  const { data: votes } = await supabase
    .from('arena_votes')
    .select('tool_id')
    .eq('challenge_id', challenge.id)

  const voteCounts: Record<string, number> = {}
  for (const vote of votes || []) {
    voteCounts[vote.tool_id] = (voteCounts[vote.tool_id] || 0) + 1
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-[hsl(var(--fg))]">{challenge.title}</h1>
        <p className="mb-4 max-w-2xl text-[hsl(var(--fg-secondary))]">{challenge.description}</p>
        <div className="rounded-lg border border-[hsl(var(--border-base))] bg-[hsl(var(--bg-subtle))] p-4">
          <h3 className="mb-2 text-sm font-medium text-[hsl(var(--fg-muted))]">Task Specification</h3>
          <p className="text-sm text-[hsl(var(--fg-muted))]">{challenge.task_spec}</p>
        </div>
      </div>

      {entries && entries.length > 0 ? (
        <SideBySide entries={entries} voteCounts={voteCounts} challengeId={challenge.id} />
      ) : (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border-base))] p-12 text-center text-[hsl(var(--fg-faint))]">
          No entries for this challenge yet.
        </div>
      )}
    </div>
  )
}
