import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function checkContentStaleness(
  toolSlug: string,
  newVersion: string,
) {
  const { data: staleContent } = await supabase
    .from('content_index')
    .select('slug, title, tool_versions')
    .contains('tools', [toolSlug])
    .eq('freshness', 'current')

  if (!staleContent || staleContent.length === 0) return []

  const flagged: { slug: string; title: string; oldVersion: string }[] = []

  for (const item of staleContent) {
    const versions = item.tool_versions as Record<string, string> | null
    const currentVersion = versions?.[toolSlug]
    if (currentVersion && currentVersion !== newVersion) {
      flagged.push({
        slug: item.slug as string,
        title: item.title as string,
        oldVersion: currentVersion,
      })

      await supabase
        .from('content_index')
        .update({
          freshness: 'needs_refresh',
          freshness_checked_at: new Date().toISOString(),
          freshness_reason: `${toolSlug} updated from ${currentVersion} to ${newVersion}`,
        })
        .eq('slug', item.slug)
    }
  }

  return flagged
}
