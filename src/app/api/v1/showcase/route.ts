import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, applyApiRateLimit } from '@/lib/api/response'

export async function GET(request: Request) {
  const rl = await applyApiRateLimit(request)
  if (rl.response) return rl.response
  const { remaining } = rl

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
