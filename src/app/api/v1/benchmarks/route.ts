import { createClient } from '@/lib/supabase/server'
import { apiResponse, applyApiRateLimit } from '@/lib/api/response'

export async function GET(request: Request) {
  const rl = await applyApiRateLimit(request)
  if (rl.response) return rl.response
  const { remaining } = rl

  const supabase = await createClient()

  const { data } = await supabase
    .from('benchmarks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return apiResponse(data || [], { count: data?.length || 0, remaining })
}
