import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdapter } from '@/lib/intelligence/adapters/registry'
import { classifyRelease } from '@/lib/intelligence/classifier'
import { checkContentStaleness } from '@/lib/intelligence/staleness'
import type { AdapterConfig } from '@/lib/intelligence/adapters/types'
import { withCronMonitoring } from '@/lib/cron-monitor'
import { supabaseBreaker } from '@/lib/circuit-breaker'
import { log } from '@/lib/logger'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Array<Record<string, unknown>> = []

  try {
    await withCronMonitoring('tool-intelligence', async () => {
      const tools = await supabaseBreaker.execute(
        async () => {
          const { data, error } = await supabase
            .from('tools')
            .select('*')
            .order('name')
          if (error) throw error
          return data
        },
        () => {
          log('warn', 'Supabase unavailable, skipping tool-intelligence cron')
          return null
        },
      )

      if (!tools) {
        return {
          itemsProcessed: 0,
          metadata: { skipped: 'supabase_unavailable' },
        }
      }

      let totalNewReleases = 0

      for (const tool of tools) {
        try {
          const config = tool.scraper_config as AdapterConfig
          if (!config?.type) {
            results.push({ tool: tool.slug, status: 'skipped', reason: 'no scraper config' })
            continue
          }

          const adapter = getAdapter(config)
          const releases = await adapter.fetch(config)

          if (releases.length === 0) {
            results.push({ tool: tool.slug, status: 'no_releases' })
            continue
          }

          let newReleases = 0

          for (const release of releases) {
            const hash = crypto
              .createHash('md5')
              .update(release.rawChangelog)
              .digest('hex')

            const { data: existing } = await supabase
              .from('tool_releases')
              .select('id')
              .eq('tool_id', tool.id)
              .eq('response_hash', hash)
              .limit(1)

            if (existing && existing.length > 0) continue

            const classification = await classifyRelease(
              tool.name,
              release.version,
              release.rawChangelog,
            )

            await supabase.from('tool_releases').upsert(
              {
                tool_id: tool.id,
                version: release.version,
                release_date: release.releaseDate,
                summary: classification.summary,
                significance: classification.significance,
                raw_changelog: release.rawChangelog,
                source_url: release.sourceUrl,
                capabilities: classification.capabilities,
                response_hash: hash,
                brief_status: classification.significance === 'major' ? 'pending' : 'skipped',
              },
              { onConflict: 'tool_id,version' },
            )

            // IMPORTANT: This update is intentionally scoped to release-tracking
            // fields only. The `description` column is EDITORIAL CONTENT written
            // in Ethan's voice and must NEVER be overwritten by the scraper.
            // Scraped vendor copy (marketing taglines, gallery captions, etc.)
            // bleeds into the UI and breaks brand voice. If you need to refresh
            // descriptions, do it manually via SQL or a one-off seed script.
            // Allowed fields: current_version, last_release_date, updated_at.
            await supabase
              .from('tools')
              .update({
                current_version: release.version,
                last_release_date: release.releaseDate,
                updated_at: new Date().toISOString(),
              })
              .eq('id', tool.id)

            await checkContentStaleness(tool.slug, release.version)

            // Pipeline integration point: for major releases, the multi-agent content
            // pipeline can be triggered here via runPipeline('release_detected', { ... }).
            // Not called inline to keep this cron fast and avoid Vercel timeout limits.
            // Use POST /api/admin/trigger-pipeline or a dedicated pipeline cron instead.

            newReleases++
          }

          results.push({ tool: tool.slug, status: 'ok', newReleases })
          totalNewReleases += newReleases
        } catch (error) {
          results.push({
            tool: tool.slug,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      return {
        itemsProcessed: totalNewReleases,
        metadata: { toolsProcessed: tools.length },
      }
    })

    return NextResponse.json({ results, processedAt: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Cron failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        results,
      },
      { status: 500 },
    )
  }
}
