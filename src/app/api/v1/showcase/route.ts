import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, applyApiRateLimit } from '@/lib/api/response'
import { log } from '@/lib/logger'

export async function GET(request: Request) {
  const startTime = Date.now()
  const requestId =
    request.headers.get('x-request-id') || crypto.randomUUID()
  const route = '/api/v1/showcase'

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

    const { data, error } = await supabase
      .from('showcase_projects')
      .select(
        'title, description, url, screenshot_url, github_url, build_time_minutes, builder_experience, created_at',
      )
      .eq('status', 'published')
      .order('created_at', { ascending: false })

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
