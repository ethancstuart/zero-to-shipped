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
  const route = '/api/v1/tools/[slug]'
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

    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('*')
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

    const { data: releases, error: releasesError } = await supabase
      .from('tool_releases')
      .select('version, release_date, release_notes, breaking_changes, highlights')
      .eq('tool_id', tool.id)
      .order('release_date', { ascending: false })
      .limit(5)

    if (releasesError) {
      log('error', 'API request failed', {
        requestId,
        route,
        slug,
        method: 'GET',
        status: 500,
        duration_ms: Date.now() - startTime,
        error: releasesError.message,
      })
      return apiError(releasesError.message, 500)
    }

    const response = apiResponse({ ...tool, releases }, { remaining })
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
