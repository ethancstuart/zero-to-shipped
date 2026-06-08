import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, applyApiRateLimit } from '@/lib/api/response'
import { log } from '@/lib/logger'

export async function GET(request: Request) {
  const startTime = Date.now()
  const requestId =
    request.headers.get('x-request-id') || crypto.randomUUID()
  const route = '/api/v1/capabilities'

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
      .from('ecosystem_status')
      .select('capability, category')
      .order('category')
      .order('capability')

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

    // Deduplicate by capability+category pair
    const seen = new Set<string>()
    const distinct = (data ?? []).filter((row) => {
      const key = `${row.category}::${row.capability}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    const response = apiResponse(distinct, { count: distinct.length, remaining })
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
