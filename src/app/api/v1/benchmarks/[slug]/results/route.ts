import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/api/response'
import { checkRateLimit } from '@/lib/api/rate-limit'

interface Props {
  params: Promise<{ slug: string }>
}

export async function GET(request: Request, { params }: Props) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const { allowed, remaining } = checkRateLimit(ip)
  if (!allowed) return apiError('Rate limit exceeded', 429)

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
