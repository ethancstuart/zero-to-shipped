import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, applyApiRateLimit } from '@/lib/api/response'
import { log } from '@/lib/logger'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const startTime = Date.now()
  const requestId =
    request.headers.get('x-request-id') || crypto.randomUUID()
  const route = '/api/v1/tools/[slug]/releases'
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

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    const supabase = await createClient()

    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('id, name, slug')
      .eq('slug', slug)
      .single()

    if (toolError || !tool) {
      log('info', 'API request', {
        requestId,
        route,
        slug,
        method: 'GET',
        status: 404,
        duration_ms: Date.now() - startTime,
      })
      return apiError('Tool not found', 404)
    }

    const { data, error, count } = await supabase
      .from('tool_releases')
      .select('version, release_date, release_notes, breaking_changes, highlights', { count: 'exact' })
      .eq('tool_id', tool.id)
      .order('release_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      log('error', 'API request failed', {
        requestId,
        route,
        slug,
        method: 'GET',
        status: 500,
        duration_ms: Date.now() - startTime,
        error: error.message,
      })
      return apiError(error.message, 500)
    }

    const response = apiResponse(data, {
      tool: { name: tool.name, slug: tool.slug },
      count: data?.length ?? 0,
      total: count ?? 0,
      limit,
      offset,
      remaining,
    })
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
