import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function getRecommendations(
  userId: string,
  limit: number = 5,
): Promise<{ slug: string; title: string; pillar: string; reason: string }[]> {
  // Get user context
  const { data: context } = await supabase
    .from('user_context')
    .select('*')
    .eq('user_id', userId)
    .single()

  const consumed = context?.content_consumed || []
  const tools = context?.primary_tools || []

  // Get all published content not yet consumed
  const { data: allContent } = await supabase
    .from('content_index')
    .select('slug, title, pillar, tools, content_type')
    .eq('status', 'published')
    .limit(50)

  if (!allContent) return []

  // Filter out consumed content
  const unseen = allContent.filter((c) => !consumed.includes(c.slug))

  // Score by relevance
  const scored = unseen.map((content) => {
    let score = 0
    let reason = ''

    // Boost content matching user's tools
    const contentTools: string[] = content.tools || []
    const toolOverlap = contentTools.filter((t) => tools.includes(t))
    if (toolOverlap.length > 0) {
      score += toolOverlap.length * 10
      reason = `Uses ${toolOverlap.join(', ')}`
    }

    // Boost based on pillar diversity (if user hasn't seen much from a pillar)
    const pillarCounts: Record<string, number> = {}
    for (const slug of consumed) {
      const item = allContent.find((c) => c.slug === slug)
      if (item) pillarCounts[item.pillar] = (pillarCounts[item.pillar] || 0) + 1
    }
    if (!pillarCounts[content.pillar]) {
      score += 5
      reason = reason || `Explore ${content.pillar}`
    }

    if (!reason) reason = 'Recommended for you'

    return { ...content, score, reason }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((c) => ({
    slug: c.slug,
    title: c.title,
    pillar: c.pillar,
    reason: c.reason,
  }))
}
