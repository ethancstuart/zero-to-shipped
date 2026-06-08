import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, applyApiRateLimit } from '@/lib/api/response'
import { log } from '@/lib/logger'

export async function GET(request: Request) {
  const startTime = Date.now()
  const requestId =
    request.headers.get('x-request-id') || crypto.randomUUID()
  const route = '/api/v1/compare'

  try {
    const rl = await applyApiRateLimit(request)
    if (rl.response) {
      log('info', 'API request rate limited', {
        requestId,
        route,
        method: 'GET',
        status: 429,
        duration_ms: Date.now() - startTime,
      })
      return rl.response
    }
    const { remaining } = rl

    const { searchParams } = new URL(request.url)
    const toolsParam = searchParams.get('tools')
    if (!toolsParam) {
      log('info', 'API request', {
        requestId,
        route,
        method: 'GET',
        status: 400,
        duration_ms: Date.now() - startTime,
      })
      return apiError('Missing required query param: tools', 400)
    }

    const slugs = toolsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (slugs.length < 2) {
      log('info', 'API request', {
        requestId,
        route,
        method: 'GET',
        status: 400,
        duration_ms: Date.now() - startTime,
      })
      return apiError('Provide at least 2 tool slugs to compare', 400)
    }
    if (slugs.length > 5) {
      log('info', 'API request', {
        requestId,
        route,
        method: 'GET',
        status: 400,
        duration_ms: Date.now() - startTime,
      })
      return apiError('Maximum 5 tools can be compared at once', 400)
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ecosystem_status')
      .select(`
        *,
        tools!inner(name, slug, category, current_version, description, website)
      `)
      .in('tools.slug', slugs)

    if (error) {
      log('error', 'API request failed', {
        requestId,
        route,
        method: 'GET',
        status: 500,
        duration_ms: Date.now() - startTime,
        error: error.message,
      })
      return apiError(error.message, 500)
    }

    const response = apiResponse(data, { count: data?.length ?? 0, remaining })
    log('info', 'API request', {
      requestId,
      route,
      method: 'GET',
      status: 200,
      duration_ms: Date.now() - startTime,
    })
    return response
  } catch (error) {
    log('error', 'API request failed', {
      requestId,
      route,
      method: 'GET',
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}
