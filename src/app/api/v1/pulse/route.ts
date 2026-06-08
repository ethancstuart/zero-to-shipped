import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, applyApiRateLimit } from '@/lib/api/response'

export async function GET(request: Request) {
  const rl = await applyApiRateLimit(request)
  if (rl.response) return rl.response
  const { remaining } = rl

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_index')
    .select('title, slug, summary, published_at, content_type, tags, external_url')
    .eq('pillar', 'pulse')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) return apiError(error.message, 500)

  return apiResponse(data, { count: data?.length ?? 0, remaining })
}
