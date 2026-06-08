import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, applyApiRateLimit } from '@/lib/api/response'

export async function GET(request: Request) {
  const rl = await applyApiRateLimit(request)
  if (rl.response) return rl.response
  const { remaining } = rl

  const { searchParams } = new URL(request.url)
  const toolsParam = searchParams.get('tools')
  if (!toolsParam) return apiError('Missing required query param: tools', 400)

  const slugs = toolsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (slugs.length < 2) return apiError('Provide at least 2 tool slugs to compare', 400)
  if (slugs.length > 5) return apiError('Maximum 5 tools can be compared at once', 400)

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ecosystem_status')
    .select(`
      *,
      tools!inner(name, slug, category, current_version, description, website)
    `)
    .in('tools.slug', slugs)

  if (error) return apiError(error.message, 500)

  return apiResponse(data, { count: data?.length ?? 0, remaining })
}
