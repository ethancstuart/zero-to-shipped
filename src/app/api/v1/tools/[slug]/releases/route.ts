import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError, applyApiRateLimit } from '@/lib/api/response'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const rl = await applyApiRateLimit(request)
  if (rl.response) return rl.response
  const { remaining } = rl

  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const supabase = await createClient()

  const { data: tool, error: toolError } = await supabase
    .from('tools')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (toolError || !tool) return apiError('Tool not found', 404)

  const { data, error, count } = await supabase
    .from('tool_releases')
    .select('version, release_date, release_notes, breaking_changes, highlights', { count: 'exact' })
    .eq('tool_id', tool.id)
    .order('release_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return apiError(error.message, 500)

  return apiResponse(data, {
    tool: { name: tool.name, slug: tool.slug },
    count: data?.length ?? 0,
    total: count ?? 0,
    limit,
    offset,
    remaining,
  })
}
