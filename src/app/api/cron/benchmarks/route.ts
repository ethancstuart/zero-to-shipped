import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runBenchmark } from '@/lib/intelligence/benchmarks/runner'
import { evaluateOutput } from '@/lib/intelligence/benchmarks/evaluator'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get active weekly benchmarks
  const { data: benchmarks } = await supabase
    .from('benchmarks')
    .select('id')
    .eq('is_active', true)
    .eq('run_frequency', 'weekly')

  if (!benchmarks || benchmarks.length === 0) {
    return NextResponse.json({ message: 'No active benchmarks', results: [] })
  }

  const allResults = []

  for (const { id: benchmarkId } of benchmarks) {
    try {
      const { benchmark, results } = await runBenchmark(benchmarkId)

      for (const result of results) {
        const evaluation = await evaluateOutput(
          result.output,
          benchmark.evaluation_criteria,
          benchmark.task,
        )

        await supabase.from('benchmark_results').insert({
          benchmark_id: benchmarkId,
          tool_id: result.toolId,
          output_text: result.output,
          scores: evaluation.scores,
          tokens_used: result.tokensUsed,
          cost_cents: Math.ceil(result.tokensUsed * 0.003),
          duration_ms: result.durationMs,
          evaluator_notes: evaluation.notes,
        })

        allResults.push({
          benchmark: benchmark.slug,
          tool: result.toolSlug,
          scores: evaluation.scores,
        })
      }
    } catch (error) {
      allResults.push({
        benchmark: benchmarkId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({ results: allResults })
}
