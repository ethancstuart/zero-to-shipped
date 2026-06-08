import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, applyApiRateLimit } from '@/lib/api/response'
import { log } from '@/lib/logger'

interface Props {
  params: Promise<{ capability: string }>
}

export async function GET(request: Request, { params }: Props) {
  const startTime = Date.now()
  const requestId =
    request.headers.get('x-request-id') || crypto.randomUUID()
  const route = '/api/v1/capabilities/[capability]'
  const { capability } = await params
  const decoded = decodeURIComponent(capability).replace(/-/g, ' ')

  try {
    const rl = await applyApiRateLimit(request)
    if (rl.response) {
      log('info', 'API request rate limited', {
        requestId,
        route,
        capability: decoded,
        method: 'GET',
        status: 429,
        duration_ms: Date.now() - startTime,
      })
      return rl.response
    }
    const { remaining } = rl

    const supabase = await createClient()

    const { data } = await supabase
      .from('ecosystem_status')
      .select('*, tools:tool_id(name, slug)')
      .ilike('capability', `%${decoded}%`)
      .order('quality_score', { ascending: false })

    if (!data || data.length === 0) {
      log('info', 'API request', {
        requestId,
        route,
        capability: decoded,
        method: 'GET',
        status: 404,
        duration_ms: Date.now() - startTime,
      })
      return apiError(`Capability "${decoded}" not found`, 404)
    }

    type EcosystemRow = typeof data[number] & {
      tools: { name: string; slug: string } | null
    }

    const response = apiResponse({
      capability: data[0].capability,
      category: data[0].category,
      tools: (data as EcosystemRow[]).map((d) => ({
        name: d.tools?.name,
        slug: d.tools?.slug,
        supported: d.supported,
        maturity: d.maturity,
        qualityScore: d.quality_score,
        notes: d.notes,
      })),
    }, { remaining })
    log('info', 'API request', {
      requestId,
      route,
      capability: decoded,
      method: 'GET',
      status: 200,
      duration_ms: Date.now() - startTime,
    })
    return response
  } catch (error) {
    log('error', 'API request failed', {
      requestId,
      route,
      capability: decoded,
      method: 'GET',
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}
