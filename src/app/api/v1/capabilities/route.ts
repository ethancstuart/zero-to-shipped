import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, applyApiRateLimit } from '@/lib/api/response'

export async function GET(request: Request) {
  const rl = await applyApiRateLimit(request)
  if (rl.response) return rl.response
  const { remaining } = rl

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
