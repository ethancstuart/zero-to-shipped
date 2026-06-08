import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, applyApiRateLimit } from '@/lib/api/response'

interface Props {
  params: Promise<{ capability: string }>
}

export async function GET(request: Request, { params }: Props) {
  const rl = await applyApiRateLimit(request)
  if (rl.response) return rl.response
  const { remaining } = rl

  const { capability } = await params
  const decoded = decodeURIComponent(capability).replace(/-/g, ' ')

  const supabase = await createClient()

  const { data } = await supabase
    .from('ecosystem_status')
    .select('*, tools:tool_id(name, slug)')
    .ilike('capability', `%${decoded}%`)
    .order('quality_score', { ascending: false })

  if (!data || data.length === 0) {
    return apiError(`Capability "${decoded}" not found`, 404)
  }

  type EcosystemRow = typeof data[number] & {
    tools: { name: string; slug: string } | null
  }

  return apiResponse({
    capability: data[0].capability,
    category: data[0].category,
    tools: (data as EcosystemRow[]).map((d) => ({
      name: d.tools?.name,
      slug: d.tools?.slug,
      supported: d.supported,
      maturity: d.maturity,
      qualityScore: d.quality_score,
      notes: d.notes,
    })),
  }, { remaining })
}
