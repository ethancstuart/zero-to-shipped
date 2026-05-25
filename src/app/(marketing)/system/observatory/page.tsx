import { createClient } from '@/lib/supabase/server'
import { PipelineRunCard } from '@/components/observatory/pipeline-run-card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agent Observatory — Prototype Studio',
  description: 'Watch real AI agents work in production. Live pipeline monitoring.',
}

export const revalidate = 60

export default async function ObservatoryPage() {
  const supabase = await createClient()

  const { data: runs } = await supabase
    .from('pipeline_runs')
    .select(`
      *,
      pipeline_steps (*)
    `)
    .order('started_at', { ascending: false })
    .limit(20)

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">
          Agent Observatory
        </h1>
        <p className="max-w-2xl text-lg text-white/50">
          Watch real AI agents work in production. Every pipeline run is
          visible — see which agent is active, read the handoffs, watch
          the fact-checker catch hallucinations.
        </p>
      </div>

      <div className="space-y-4">
        {runs?.map((run) => (
          <PipelineRunCard key={run.id} run={run} />
        ))}
        {(!runs || runs.length === 0) && (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-white/30">
            No pipeline runs yet. The first run will appear when a tool ships a
            major release.
          </div>
        )}
      </div>
    </div>
  )
}
