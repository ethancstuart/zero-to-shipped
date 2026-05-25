import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/api/response'
import { checkRateLimit } from '@/lib/api/rate-limit'

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const { allowed, remaining } = checkRateLimit(ip)
  if (!allowed) return apiError('Rate limit exceeded', 429)

  const supabase = await createClient()

  const [toolsResult, contentResult, showcaseResult, releasesResult] = await Promise.all([
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
  ])

  if (toolsResult.error) return apiError(toolsResult.error.message, 500)
  if (contentResult.error) return apiError(contentResult.error.message, 500)
  if (showcaseResult.error) return apiError(showcaseResult.error.message, 500)
  if (releasesResult.error) return apiError(releasesResult.error.message, 500)

  return apiResponse(
    {
      toolsTracked: toolsResult.count ?? 0,
      contentPieces: contentResult.count ?? 0,
      showcaseEntries: showcaseResult.count ?? 0,
      totalReleases: releasesResult.count ?? 0,
    },
    { remaining },
  )
}
