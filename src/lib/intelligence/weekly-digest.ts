/**
 * Weekly digest composer.
 *
 * Pure function — no I/O. Takes the past 7 days of releases and pulse content
 * plus a wrap-up paragraph in Ethan's voice (generated separately by Claude in
 * the cron) and produces a publish-ready MDX brief.
 *
 * Used by /api/cron/weekly-digest. Kept here so it's easy to unit test in
 * isolation and re-run by hand against any week.
 */

export interface DigestRelease {
  tool: { name: string; slug: string }
  version: string
  significance: string
  summary: string | null
  release_date: string
}

export interface DigestContentRef {
  slug: string
  title: string
  published_at: string | null
}

export interface ComposeDigestInput {
  /** Start of the week being digested — ISO date (YYYY-MM-DD). */
  weekStarting: string
  /** End of the week — ISO date (YYYY-MM-DD). Defaults to weekStarting + 6d. */
  weekEnding?: string
  /** Releases observed in the past 7 days, newest first. */
  releases: DigestRelease[]
  /** Pulse content published in the past 7 days (auto-generated briefs etc.). */
  newContent: DigestContentRef[]
  /** Ethan-voiced 2-3 sentence wrap-up. The cron generates this via Claude. */
  wrapUp: string
}

export interface ComposeDigestResult {
  slug: string
  title: string
  description: string
  publishedAt: string
  /** Full MDX (frontmatter + body) ready to persist. */
  mdx: string
}

const SIGNIFICANCE_RANK: Record<string, number> = {
  major: 0,
  minor: 1,
  patch: 2,
  unknown: 3,
}

function rankSignificance(s: string): number {
  return SIGNIFICANCE_RANK[s.toLowerCase()] ?? SIGNIFICANCE_RANK.unknown
}

function addDaysIso(dateIso: string, days: number): string {
  const d = new Date(`${dateIso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function formatHuman(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00Z`)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function groupByTool(releases: DigestRelease[]): Map<string, DigestRelease[]> {
  const groups = new Map<string, DigestRelease[]>()
  for (const r of releases) {
    const key = r.tool.slug
    const arr = groups.get(key) ?? []
    arr.push(r)
    groups.set(key, arr)
  }
  for (const arr of groups.values()) {
    arr.sort(
      (a, b) =>
        rankSignificance(a.significance) - rankSignificance(b.significance) ||
        b.release_date.localeCompare(a.release_date),
    )
  }
  return groups
}

export function composeWeeklyDigest(input: ComposeDigestInput): ComposeDigestResult {
  const weekStarting = input.weekStarting
  const weekEnding = input.weekEnding ?? addDaysIso(weekStarting, 6)
  const slug = `weekly-digest-${weekStarting}`
  const humanRange = `${formatHuman(weekStarting)}–${formatHuman(weekEnding)}`
  const title = `This Week in AI Coding — ${humanRange}`

  const toolGroups = groupByTool(input.releases)
  const toolsInvolved = Array.from(
    new Set(input.releases.map((r) => r.tool.slug)),
  )

  const description =
    input.releases.length === 0
      ? `A quiet week in AI coding (${humanRange}). What that means, and what I'm still watching.`
      : `${input.releases.length} release${input.releases.length === 1 ? '' : 's'} across ${toolGroups.size} tool${toolGroups.size === 1 ? '' : 's'} between ${humanRange}. What changed, what matters, and what I'd reach for now.`

  const frontmatter = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `slug: ${JSON.stringify(slug)}`,
    'pillar: "pulse"',
    'type: "brief"',
    'format: "written"',
    'difficulty: "beginner"',
    'estimatedMinutes: 4',
    `tools: ${JSON.stringify(toolsInvolved)}`,
    'tags: ["weekly-digest", "this-week-in-ai-coding"]',
    'series: "weekly-digest"',
    'isPremium: false',
    'isFeatured: false',
    'status: "published"',
    `publishedAt: ${JSON.stringify(weekEnding)}`,
    `description: ${JSON.stringify(description)}`,
    '---',
    '',
  ].join('\n')

  const body: string[] = []
  body.push(`# This Week in AI Coding`)
  body.push('')
  body.push(`*${humanRange} · ${input.releases.length} release${input.releases.length === 1 ? '' : 's'} across ${toolGroups.size} tool${toolGroups.size === 1 ? '' : 's'}*`)
  body.push('')

  body.push('## Releases')
  body.push('')
  if (input.releases.length === 0) {
    body.push('A quiet week. No releases in the tools I track. That happens — and it usually means everyone is heads-down on something larger that will land in the next week or two.')
    body.push('')
  } else {
    for (const [, releases] of toolGroups) {
      const tool = releases[0].tool
      body.push(`### ${tool.name}`)
      body.push('')
      for (const r of releases) {
        const sig = r.significance ? ` _(${r.significance})_` : ''
        const summary = r.summary?.trim() || 'No summary available.'
        body.push(`- **${r.version}**${sig} — ${summary}`)
      }
      body.push('')
    }
  }

  body.push('## What I wrote about it')
  body.push('')
  if (input.newContent.length === 0) {
    body.push('No new briefs this week. The next deep-dive lands when the next major release does.')
    body.push('')
  } else {
    for (const c of input.newContent) {
      body.push(`- [${c.title}](/pulse/${c.slug})`)
    }
    body.push('')
  }

  body.push('## My take')
  body.push('')
  body.push(input.wrapUp.trim())
  body.push('')

  body.push('---')
  body.push('')
  body.push('*This digest is auto-published every Monday morning. The releases come from the tool intelligence cron; the take is mine.*')
  body.push('')

  return {
    slug,
    title,
    description,
    publishedAt: weekEnding,
    mdx: frontmatter + body.join('\n'),
  }
}
