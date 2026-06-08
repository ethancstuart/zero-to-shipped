import { createClient } from '@/lib/supabase/server'
import { apiResponse, applyApiRateLimit } from '@/lib/api/response'
import { log } from '@/lib/logger'

export async function GET(request: Request) {
  const startTime = Date.now()
  const requestId =
    request.headers.get('x-request-id') || crypto.randomUUID()
  const route = '/api/v1/pulse/weekly'

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
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: releases } = await supabase
      .from('tool_releases')
      .select('version, significance, summary, release_date, tool_id, tools:tool_id(name, slug)')
      .gte('release_date', weekAgo)
      .order('release_date', { ascending: false })

    const { data: pulseContent } = await supabase
      .from('content_index')
      .select('slug, title, published_at')
      .eq('pillar', 'pulse')
      .eq('status', 'published')
      .gte('published_at', weekAgo)
      .order('published_at', { ascending: false })

    const response = apiResponse({
      weekStarting: weekAgo.split('T')[0],
      releases: releases || [],
      newContent: pulseContent || [],
      releaseSummary: `${(releases || []).length} releases across ${new Set((releases || []).map((r) => r.tool_id)).size} tools`,
    }, { remaining })
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
