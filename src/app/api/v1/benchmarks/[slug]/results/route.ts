import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, applyApiRateLimit } from '@/lib/api/response'
import { log } from '@/lib/logger'

interface Props {
  params: Promise<{ slug: string }>
}

export async function GET(request: Request, { params }: Props) {
  const startTime = Date.now()
  const requestId =
    request.headers.get('x-request-id') || crypto.randomUUID()
  const route = '/api/v1/benchmarks/[slug]/results'
  const { slug } = await params

  try {
    const rl = await applyApiRateLimit(request)
    if (rl.response) {
      log('info', 'API request rate limited', {
        requestId,
        route,
        slug,
        method: 'GET',
        status: 429,
        duration_ms: Date.now() - startTime,
      })
      return rl.response
    }
    const { remaining } = rl

    const supabase = await createClient()

    const { data: benchmark } = await supabase
      .from('benchmarks')
      .select('id, slug, task')
      .eq('slug', slug)
      .single()

    if (!benchmark) {
      log('info', 'API request', {
        requestId,
        route,
        slug,
        method: 'GET',
        status: 404,
        duration_ms: Date.now() - startTime,
      })
      return apiError('Benchmark not found', 404)
    }

    const { data: results } = await supabase
      .from('benchmark_results')
      .select('*, tools:tool_id(name, slug)')
      .eq('benchmark_id', benchmark.id)
      .order('run_date', { ascending: false })
      .limit(50)

    const response = apiResponse({
      benchmark: { slug: benchmark.slug, task: benchmark.task },
      results: results || [],
    }, { count: results?.length || 0, remaining })
    log('info', 'API request', {
      requestId,
      route,
      slug,
      method: 'GET',
      status: 200,
      duration_ms: Date.now() - startTime,
    })
    return response
  } catch (error) {
    log('error', 'API request failed', {
      requestId,
      route,
      slug,
      method: 'GET',
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}
