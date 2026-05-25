import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/api/response'
import { checkRateLimit } from '@/lib/api/rate-limit'

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const { allowed, remaining } = checkRateLimit(ip)
  if (!allowed) return apiError('Rate limit exceeded', 429)

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
