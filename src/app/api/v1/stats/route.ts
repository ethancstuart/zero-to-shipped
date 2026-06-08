import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, applyApiRateLimit } from '@/lib/api/response'
import { log } from '@/lib/logger'

export async function GET(request: Request) {
  const startTime = Date.now()
  const requestId =
    request.headers.get('x-request-id') || crypto.randomUUID()
  const route = '/api/v1/stats'

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

    const supabase = await createClient()

    const [toolsResult, contentResult, showcaseResult, releasesResult, costsResult] =
      await Promise.all([
        supabase.from('tools').select('id', { count: 'exact', head: true }),
        supabase
          .from('content_index')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published'),
        supabase
          .from('showcase_projects')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published'),
        supabase.from('tool_releases').select('id', { count: 'exact', head: true }),
        supabase.from('platform_costs').select('amount_cents'),
      ])

    if (toolsResult.error) {
      log('error', 'API request failed', {
        requestId, route, method: 'GET', status: 500,
        duration_ms: Date.now() - startTime,
        error: toolsResult.error.message,
      })
      return apiError(toolsResult.error.message, 500)
    }
    if (contentResult.error) {
      log('error', 'API request failed', {
        requestId, route, method: 'GET', status: 500,
        duration_ms: Date.now() - startTime,
        error: contentResult.error.message,
      })
      return apiError(contentResult.error.message, 500)
    }
    if (showcaseResult.error) {
      log('error', 'API request failed', {
        requestId, route, method: 'GET', status: 500,
        duration_ms: Date.now() - startTime,
        error: showcaseResult.error.message,
      })
      return apiError(showcaseResult.error.message, 500)
    }
    if (releasesResult.error) {
      log('error', 'API request failed', {
        requestId, route, method: 'GET', status: 500,
        duration_ms: Date.now() - startTime,
        error: releasesResult.error.message,
      })
      return apiError(releasesResult.error.message, 500)
    }

    const totalCostCents = (costsResult.data || []).reduce(
      (sum, c) => sum + (c.amount_cents ?? 0),
      0,
    )

    const response = apiResponse(
      {
        toolsTracked: toolsResult.count ?? 0,
        contentPieces: contentResult.count ?? 0,
        showcaseEntries: showcaseResult.count ?? 0,
        totalReleases: releasesResult.count ?? 0,
        totalCostCents,
      },
      { remaining },
    )
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
