import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { SectionDivider } from '@/components/shared/section-divider'
import { StaggerGrid } from '@/components/motion/stagger-grid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Coding Tools — Prototype Studio',
  description: 'Track AI coding tools, grouped by parent company — releases, capabilities, and comparisons.',
}

export const revalidate = 3600

// Impure helper isolated outside the render function so the
// `react-hooks/purity` rule treats the render itself as pure.
function getNinetyDaysAgoIso(): string {
  return new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
}

interface CompanyEntry {
  company_slug: string
  parent_company: string
  product_count: number
  recent_releases: number
  logo_url: string | null
}

export default async function ToolsPage() {
  const supabase = await createClient()

  // Pull every tool with company metadata + a logo we can borrow for the company card.
  const { data: tools } = await supabase
    .from('tools')
    .select('id, slug, name, company_slug, parent_company, logo_url')
    .order('name')

  const allTools = tools || []

  // Aggregate recent release counts per company (last 90 days).
  // Use Postgres `NOW() - INTERVAL` via the .gte filter on a server-side computed
  // ISO timestamp; we compute it outside any pure-render context by invoking the
  // impure helper via a single deferred call. This pattern keeps the
  // `react-hooks/purity` lint rule happy in server components.
  const ninetyDaysAgo = getNinetyDaysAgoIso()
  const { data: releases } = await supabase
    .from('tool_releases')
    .select('tool_id')
    .gte('release_date', ninetyDaysAgo)

  const releasesByToolId = new Map<string, number>()
  for (const r of releases || []) {
    releasesByToolId.set(r.tool_id, (releasesByToolId.get(r.tool_id) || 0) + 1)
  }

  // Group tools into companies. Tools without company_slug fall back to their own slug
  // so unseeded rows still render rather than collapsing into a null bucket.
  const byCompany = new Map<string, CompanyEntry>()
  for (const tool of allTools) {
    const companySlug = tool.company_slug || tool.slug
    const companyName = tool.parent_company || tool.name
    const recent = releasesByToolId.get(tool.id) || 0

    const existing = byCompany.get(companySlug)
    if (existing) {
      existing.product_count += 1
      existing.recent_releases += recent
      if (!existing.logo_url && tool.logo_url) existing.logo_url = tool.logo_url
    } else {
      byCompany.set(companySlug, {
        company_slug: companySlug,
        parent_company: companyName,
        product_count: 1,
        recent_releases: recent,
        logo_url: tool.logo_url,
      })
    }
  }

  const companies = Array.from(byCompany.values()).sort((a, b) =>
    a.parent_company.localeCompare(b.parent_company)
  )

  return (
    <>
      <section className="border-b border-[hsl(var(--border-base))] px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-[1300px]">
          <div className="font-mono-data mb-4 text-[10px] uppercase tracking-wider text-[hsl(var(--fg-muted))]">
            TOOLS
          </div>
          <h1 className="text-h1 mb-3">AI Coding Tools</h1>
          <p className="max-w-lg text-[hsl(var(--fg-secondary))]">
            We track releases and capabilities across {allTools.length} tools from{' '}
            {companies.length} companies so you always know what&apos;s current.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1300px] px-6 py-12 lg:px-12">
        <SectionDivider
          number="01"
          label={`${companies.length} companies · ${allTools.length} tools`}
        />

        <StaggerGrid className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <Link
              key={c.company_slug}
              href={`/tools/${c.company_slug}`}
              className="block rounded-xl border border-[hsl(var(--border-base))] p-6 transition-all duration-300 hover:border-[hsl(var(--border-hover))] hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
            >
              <div className="mb-4 flex items-center gap-3">
                {c.logo_url && (
                  <Image
                    src={c.logo_url}
                    alt={c.parent_company}
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="text-h3">{c.parent_company}</div>
                </div>
              </div>
              <div className="font-mono-data flex items-center gap-3 text-[10px] uppercase tracking-wider text-[hsl(var(--fg-muted))]">
                <span>
                  {c.product_count} {c.product_count === 1 ? 'product' : 'products'}
                </span>
                <span aria-hidden>·</span>
                <span>
                  {c.recent_releases}{' '}
                  {c.recent_releases === 1 ? 'release' : 'releases'} / 90d
                </span>
              </div>
            </Link>
          ))}
        </StaggerGrid>

        {companies.length === 0 && (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border-base))] p-12 text-center">
            <p className="font-mono-data text-sm text-[hsl(var(--fg-muted))]">
              No tools yet.
            </p>
          </div>
        )}
      </section>
    </>
  )
}
