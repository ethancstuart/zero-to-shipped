import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs/promises'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function runRetrospective() {
  // Gather data
  const now = new Date()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Content analytics for the last 30 days
  const { data: analytics } = await supabase
    .from('content_analytics')
    .select('*')
    .gte('period_start', monthAgo.toISOString().split('T')[0])

  // Pipeline runs for the last 30 days
  const { data: pipelineRuns } = await supabase
    .from('pipeline_runs')
    .select('status, total_tokens, total_cost_cents, started_at')
    .gte('started_at', monthAgo.toISOString())

  // Stale content
  const { data: staleContent } = await supabase
    .from('content_index')
    .select('slug, title, freshness, freshness_reason')
    .neq('freshness', 'current')

  // Tool releases this month
  const { data: recentReleases } = await supabase
    .from('tool_releases')
    .select('version, significance, summary, created_at, tool_id')
    .gte('created_at', monthAgo.toISOString())
    .order('created_at', { ascending: false })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: `You are the Retrospective Agent for Prototype Studio. You analyze monthly platform performance and produce strategy recommendations.

Write a concise strategy memo in markdown format with these sections:
## Content Performance
- Top performing content (by views)
- Underperforming content
- Content gaps identified

## Pipeline Health
- Runs this month, success rate
- Total tokens and cost
- Any recurring failures

## Ecosystem Activity
- Notable tool releases
- Stale content needing refresh

## Recommendations
- What to create next (3 specific content ideas)
- What to update
- What to retire

Be data-driven and specific. No filler.`,
    messages: [
      {
        role: 'user',
        content: `Monthly retrospective data:

Content analytics (${(analytics || []).length} records):
${JSON.stringify(analytics || [], null, 2).slice(0, 2000)}

Pipeline runs (${(pipelineRuns || []).length} runs):
${JSON.stringify(pipelineRuns || [], null, 2).slice(0, 1000)}

Stale content (${(staleContent || []).length} pieces):
${JSON.stringify(staleContent || [], null, 2).slice(0, 1000)}

Recent releases (${(recentReleases || []).length}):
${JSON.stringify(recentReleases || [], null, 2).slice(0, 1000)}

Generate the monthly strategy memo.`,
      },
    ],
  })

  const memoContent = response.content[0].type === 'text' ? response.content[0].text : ''
  const tokensUsed = response.usage.input_tokens + response.usage.output_tokens

  // Write the memo as an MDX file
  const monthStr = now.toISOString().slice(0, 7) // YYYY-MM
  const filename = `${monthStr}-strategy-memo.mdx`
  const memoDir = path.join(process.cwd(), 'content', 'internal', 'strategy')
  await fs.mkdir(memoDir, { recursive: true })

  const frontmatter = `---
title: "Strategy Memo — ${monthStr}"
slug: ${monthStr}-strategy-memo
pillar: system
type: playbook
format: written
tools: []
toolVersions: {}
difficulty: advanced
estimatedMinutes: 5
tags: [strategy, retrospective, internal]
isPremium: false
isFeatured: false
status: draft
publishedAt: "${now.toISOString().split('T')[0]}"
---

`

  await fs.writeFile(
    path.join(memoDir, filename),
    frontmatter + memoContent,
    'utf-8',
  )

  return {
    filename,
    tokensUsed,
    analyticsCount: (analytics || []).length,
    pipelineRunsCount: (pipelineRuns || []).length,
    staleContentCount: (staleContent || []).length,
    recentReleasesCount: (recentReleases || []).length,
  }
}
