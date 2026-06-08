import { createClient } from '@/lib/supabase/server'
import { apiResponse, applyApiRateLimit } from '@/lib/api/response'

export async function GET(request: Request) {
  const rl = await applyApiRateLimit(request)
  if (rl.response) return rl.response
  const { remaining } = rl

  const supabase = await createClient()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: releases } = await supabase
    .from('tool_releases')
    .select('version, significance, summary, release_date, tool_id, tools:tool_id(name, slug)')
    .gte('release_date', weekAgo)
    .order('release_date', { ascending: false })

  const { data: pulseContent } = await supabase
    .from('content_index')
    .select('slug, title, published_at')
    .eq('pillar', 'pulse')
    .eq('status', 'published')
    .gte('published_at', weekAgo)
    .order('published_at', { ascending: false })

  return apiResponse({
    weekStarting: weekAgo.split('T')[0],
    releases: releases || [],
    newContent: pulseContent || [],
    releaseSummary: `${(releases || []).length} releases across ${new Set((releases || []).map((r) => r.tool_id)).size} tools`,
  }, { remaining })
}
