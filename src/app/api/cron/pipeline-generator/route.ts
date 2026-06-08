import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withCronMonitoring } from '@/lib/cron-monitor'
import { claudeBreaker } from '@/lib/circuit-breaker'
import { log } from '@/lib/logger'
import { runPipeline } from '@/lib/intelligence/pipeline'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const MAX_PER_RUN = 3

type PipelineRunResult = Awaited<ReturnType<typeof runPipeline>>
type FallbackSentinel = { __fallback: true }
type PipelineExecResult = PipelineRunResult | FallbackSentinel

const FALLBACK_SENTINEL: FallbackSentinel = { __fallback: true }

function isFallback(value: PipelineExecResult): value is FallbackSentinel {
  return (value as FallbackSentinel).__fallback === true
}

type PipelineRow = {
  id: string
  version: string
  summary: string | null
  raw_changelog: string | null
  source_url: string | null
  tools: { name: string } | { name: string }[] | null
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let captured: {
    itemsProcessed: number
    metadata: { failed: number; skipped: number; attempted: number }
  } = {
    itemsProcessed: 0,
    metadata: { failed: 0, skipped: 0, attempted: 0 },
  }

  try {
    await withCronMonitoring('pipeline-generator', async () => {
      const { data: pending, error } = await supabase
        .from('tool_releases')
        .select('id, version, summary, raw_changelog, source_url, tools(name)')
        .eq('brief_status', 'pending')
        .in('significance', ['major', 'minor'])
        .order('release_date', { ascending: false })
        .limit(MAX_PER_RUN)

      if (error) {
        log('error', 'Failed to fetch pending releases', {
          cron: 'pipeline-generator',
          error: error.message,
        })
        throw error
      }

      const rows = (pending ?? []) as PipelineRow[]

      let succeeded = 0
      let failed = 0
      let skipped = 0

      for (const release of rows) {
        const toolRel = release.tools
        const toolName = Array.isArray(toolRel)
          ? toolRel[0]?.name
          : toolRel?.name
        const resolvedToolName = toolName ?? 'unknown-tool'
        const rawChangelog = release.summary || release.raw_changelog || ''
        const sourceUrl = release.source_url || ''
        const startedAt = Date.now()

        try {
          const result = await claudeBreaker.execute<PipelineExecResult>(
            async () =>
              runPipeline('release_detected', {
                toolName: resolvedToolName,
                version: release.version,
                rawChangelog,
                sourceUrl,
              }),
            () => FALLBACK_SENTINEL,
          )

          const durationMs = Date.now() - startedAt

          if (isFallback(result)) {
            skipped++
            await supabase
              .from('tool_releases')
              .update({ brief_status: 'failed' })
              .eq('id', release.id)

            log('warn', 'Pipeline skipped via circuit breaker fallback', {
              cron: 'pipeline-generator',
              releaseId: release.id,
              toolName: resolvedToolName,
              version: release.version,
              status: 'skipped',
              durationMs,
            })
            continue
          }

          const pipelineResult = result

          if (pipelineResult.status === 'completed') {
            succeeded++
            await supabase
              .from('tool_releases')
              .update({ brief_status: 'generated' })
              .eq('id', release.id)

            log('info', 'Pipeline completed for release', {
              cron: 'pipeline-generator',
              releaseId: release.id,
              toolName: resolvedToolName,
              version: release.version,
              status: 'generated',
              runId: pipelineResult.runId,
              durationMs,
            })
          } else {
            failed++
            await supabase
              .from('tool_releases')
              .update({ brief_status: 'failed' })
              .eq('id', release.id)

            const failureDetail =
              pipelineResult.status === 'failed'
                ? { step: pipelineResult.step, error: pipelineResult.error }
                : {}

            log('error', 'Pipeline failed for release', {
              cron: 'pipeline-generator',
              releaseId: release.id,
              toolName: resolvedToolName,
              version: release.version,
              status: 'failed',
              runId: pipelineResult.runId,
              ...failureDetail,
              durationMs,
            })
          }
        } catch (err) {
          const durationMs = Date.now() - startedAt
          failed++
          await supabase
            .from('tool_releases')
            .update({ brief_status: 'failed' })
            .eq('id', release.id)

          log('error', 'Pipeline threw for release', {
            cron: 'pipeline-generator',
            releaseId: release.id,
            toolName: resolvedToolName,
            version: release.version,
            status: 'failed',
            durationMs,
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }

      captured = {
        itemsProcessed: succeeded,
        metadata: {
          failed,
          skipped,
          attempted: succeeded + failed + skipped,
        },
      }

      return captured
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
