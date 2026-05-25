import { createClient } from '@/lib/supabase/server'
import { apiResponse, apiError } from '@/lib/api/response'
import { checkRateLimit } from '@/lib/api/rate-limit'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const { allowed, remaining } = checkRateLimit(ip)
  if (!allowed) return apiError('Rate limit exceeded', 429)

  const { slug } = await params

  const supabase = await createClient()

  const { data: tool, error: toolError } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .single()

  if (toolError || !tool) return apiError('Tool not found', 404)

  const { data: releases, error: releasesError } = await supabase
    .from('tool_releases')
    .select('version, release_date, release_notes, breaking_changes, highlights')
    .eq('tool_id', tool.id)
    .order('release_date', { ascending: false })
    .limit(5)

  if (releasesError) return apiError(releasesError.message, 500)

  return apiResponse({ ...tool, releases }, { remaining })
}
