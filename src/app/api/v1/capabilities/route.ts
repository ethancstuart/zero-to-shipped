import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/api/response'
import { checkRateLimit } from '@/lib/api/rate-limit'

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const { allowed, remaining } = checkRateLimit(ip)
  if (!allowed) return apiError('Rate limit exceeded', 429)

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ecosystem_status')
    .select('capability, category')
    .order('category')
    .order('capability')

  if (error) return apiError(error.message, 500)

  // Deduplicate by capability+category pair
  const seen = new Set<string>()
  const distinct = (data ?? []).filter((row) => {
    const key = `${row.category}::${row.capability}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return apiResponse(distinct, { count: distinct.length, remaining })
}
