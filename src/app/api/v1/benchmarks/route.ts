import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/api/response'
import { checkRateLimit } from '@/lib/api/rate-limit'

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const { allowed, remaining } = checkRateLimit(ip)
  if (!allowed) return apiError('Rate limit exceeded', 429)

  const supabase = await createClient()

  const { data } = await supabase
    .from('benchmarks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return apiResponse(data || [], { count: data?.length || 0, remaining })
}
