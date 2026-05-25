import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/api/response'
import { checkRateLimit } from '@/lib/api/rate-limit'

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const { allowed, remaining } = checkRateLimit(ip)
  if (!allowed) return apiError('Rate limit exceeded', 429)

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('showcase_projects')
    .select(
      'title, description, url, screenshot_url, github_url, build_time_minutes, builder_experience, created_at',
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) return apiError(error.message, 500)

  return apiResponse(data, { count: data?.length ?? 0, remaining })
}
