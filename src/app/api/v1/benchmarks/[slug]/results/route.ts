import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, applyApiRateLimit } from '@/lib/api/response'

interface Props {
  params: Promise<{ slug: string }>
}

export async function GET(request: Request, { params }: Props) {
  const rl = await applyApiRateLimit(request)
  if (rl.response) return rl.response
  const { remaining } = rl

  const { slug } = await params
  const supabase = await createClient()

  const { data: benchmark } = await supabase
    .from('benchmarks')
    .select('id, slug, task')
    .eq('slug', slug)
    .single()

  if (!benchmark) return apiError('Benchmark not found', 404)

  const { data: results } = await supabase
    .from('benchmark_results')
    .select('*, tools:tool_id(name, slug)')
    .eq('benchmark_id', benchmark.id)
    .order('run_date', { ascending: false })
    .limit(50)

  return apiResponse({
    benchmark: { slug: benchmark.slug, task: benchmark.task },
    results: results || [],
  }, { count: results?.length || 0, remaining })
}
