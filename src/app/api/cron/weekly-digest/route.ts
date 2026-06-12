import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { withCronMonitoring } from '@/lib/cron-monitor'
import { claudeBreaker } from '@/lib/circuit-breaker'
import { log } from '@/lib/logger'
import {
  composeWeeklyDigest,
  type DigestContentRef,
  type DigestRelease,
} from '@/lib/intelligence/weekly-digest'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const anthropic = new Anthropic()

const FALLBACK_WRAP_UP =
  "The tools are moving fast — pay attention to what shipped, not who shipped it. I'll be back next Monday with another read."

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

async function generateWrapUp(
  releases: DigestRelease[],
  newContent: DigestContentRef[],
  weekRange: string,
): Promise<string> {
  if (releases.length === 0 && newContent.length === 0) {
    return "A quiet week. That's almost always the calm before something big drops next."
  }

  const releaseLines = releases
    .slice(0, 12)
    .map(
      (r) =>
        `- ${r.tool.name} ${r.version} (${r.significance}): ${r.summary?.trim() || 'no summary'}`,
    )
    .join('\n')
  const contentLines = newContent
    .slice(0, 8)
    .map((c) => `- ${c.title}`)
    .join('\n')

  const prompt = `Write a 2-3 sentence "my take" wrap-up paragraph for a weekly digest of AI coding tool releases. Write in Ethan Stuart's voice: first person, direct, no hype, no emoji, no exclamation points. Short sentences. Frame what you'd reach for this week and why.

Week: ${weekRange}

Releases:
${releaseLines || '(none)'}

New briefs published:
${contentLines || '(none)'}

Output the paragraph only. No preamble, no quotes, no markdown.`

  const wrapUp = await claudeBreaker.execute<string>(
    async () => {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      })
      const block = response.content.find((b) => b.type === 'text')
      const text = block && 'text' in block ? block.text.trim() : ''
      return text || FALLBACK_WRAP_UP
    },
    async () => FALLBACK_WRAP_UP,
  )

  return wrapUp
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let captured: { slug: string; releases: number; newContent: number } = {
    slug: '',
    releases: 0,
    newContent: 0,
  }

  try {
    await withCronMonitoring('weekly-digest', async () => {
      const now = new Date()
      const weekAgoDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const weekStarting = isoDate(weekAgoDate)
      const weekEnding = isoDate(now)
      const weekAgoIso = weekAgoDate.toISOString()

      const { data: releasesRaw, error: releaseErr } = await supabase
        .from('tool_releases')
        .select(
          'version, significance, summary, release_date, tool_id, tools:tool_id(name, slug)',
        )
        .gte('release_date', weekAgoIso)
        .order('release_date', { ascending: false })

      if (releaseErr) {
        log('error', 'Failed to fetch releases for weekly digest', {
          cron: 'weekly-digest',
          error: releaseErr.message,
        })
        throw releaseErr
      }

      const releases: DigestRelease[] = (releasesRaw ?? []).map((r) => {
        const toolField = r.tools as
          | { name: string; slug: string }
          | { name: string; slug: string }[]
          | null
        const tool = Array.isArray(toolField) ? toolField[0] : toolField
        return {
          tool: {
            name: tool?.name ?? 'Unknown',
            slug: tool?.slug ?? 'unknown',
          },
          version: r.version,
          significance: r.significance ?? 'unknown',
          summary: r.summary ?? null,
          release_date: r.release_date,
        }
      })

      const { data: newContentRaw, error: contentErr } = await supabase
        .from('content_index')
        .select('slug, title, published_at')
        .eq('pillar', 'pulse')
        .eq('status', 'published')
        .neq('series', 'weekly-digest')
        .gte('published_at', weekAgoIso)
        .order('published_at', { ascending: false })

      if (contentErr) {
        log('error', 'Failed to fetch content for weekly digest', {
          cron: 'weekly-digest',
          error: contentErr.message,
        })
        throw contentErr
      }

      const newContent: DigestContentRef[] = (newContentRaw ?? []).map((c) => ({
        slug: c.slug,
        title: c.title,
        published_at: c.published_at,
      }))

      const weekRange = `${weekStarting} → ${weekEnding}`
      const wrapUp = await generateWrapUp(releases, newContent, weekRange)

      const digest = composeWeeklyDigest({
        weekStarting,
        weekEnding,
        releases,
        newContent,
        wrapUp,
      })

      const { error: upsertErr } = await supabase
        .from('content_index')
        .upsert(
          {
            slug: digest.slug,
            pillar: 'pulse',
            content_type: 'brief',
            title: digest.title,
            description: digest.description,
            tools: Array.from(new Set(releases.map((r) => r.tool.slug))),
            status: 'published',
            is_premium: false,
            is_featured: false,
            published_at: `${digest.publishedAt}T00:00:00Z`,
            series: 'weekly-digest',
            body_mdx: digest.mdx,
          },
          { onConflict: 'slug' },
        )

      if (upsertErr) {
        log('error', 'Failed to upsert weekly digest', {
          cron: 'weekly-digest',
          slug: digest.slug,
          error: upsertErr.message,
        })
        throw upsertErr
      }

      log('info', 'Weekly digest published', {
        cron: 'weekly-digest',
        slug: digest.slug,
        releases: releases.length,
        newContent: newContent.length,
      })

      captured = {
        slug: digest.slug,
        releases: releases.length,
        newContent: newContent.length,
      }

      return { itemsProcessed: 1, metadata: captured }
    })

    return NextResponse.json({ success: true, ...captured })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Cron failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
