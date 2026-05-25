import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Arena — Prototype Studio',
  description: 'Side-by-side AI tool comparisons. Same task, different tools, real results.',
}

export const revalidate = 3600

export default async function ArenaPage() {
  const supabase = await createClient()

  const { data: challenges } = await supabase
    .from('arena_challenges')
    .select(`
      *,
      arena_entries (id, tool_id)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">The Arena</h1>
        <p className="max-w-2xl text-lg text-white/50">
          Same task. Different tools. Real results. Watch side-by-side comparisons
          and vote on which tool handles it best.
        </p>
      </div>

      {challenges && challenges.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {challenges.map((challenge) => (
            <Link
              key={challenge.id}
              href={`/build/arena/${challenge.slug}`}
              className="group rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]"
            >
              <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-white/90">
                {challenge.title}
              </h3>
              <p className="mb-3 text-sm text-white/50">{challenge.description}</p>
              <div className="flex items-center gap-3 text-xs text-white/30">
                <span>{(challenge.arena_entries || []).length} entries</span>
                {challenge.time_limit_minutes && (
                  <span>{challenge.time_limit_minutes} min limit</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-white/30">
          No challenges yet. The first Arena challenge will appear soon.
        </div>
      )}
    </div>
  )
}
