import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ToolDetailTabs } from './tool-detail-tabs'
import { Pill } from '@/components/shared/pill'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { ErrorBoundary } from '@/components/error-boundary'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ company: string; product: string }>
}

export const revalidate = 300

// Map tool category to pillar color for OG band
function categoryToPillar(category: string | null): string {
  switch (category) {
    case 'ide':
    case 'cli':
      return 'pulse'
    case 'platform':
      return 'system'
    case 'framework':
      return 'build'
    default:
      return 'pulse'
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { company, product } = await params
  const supabase = await createClient()
  const { data: tool } = await supabase
    .from('tools')
    .select('name, description, current_version, category, parent_company, company_slug')
    .eq('slug', product)
    .single()
  if (!tool) return { title: 'Not Found' }

  const description =
    tool.description || `Track ${tool.name} releases and capabilities`
  // First sentence only for a clean OG tagline
  const firstSentence = description.split(/(?<=[.!?])\s+/)[0] ?? description
  const companyLabel = tool.parent_company || tool.company_slug || company
  const pillar = categoryToPillar(tool.category)

  const ogParams = new URLSearchParams({
    tool: tool.name,
    pillar,
  })
  if (tool.current_version) ogParams.set('version', tool.current_version)
  if (companyLabel) ogParams.set('company', companyLabel)
  if (firstSentence) ogParams.set('tagline', firstSentence)
  if (tool.category) ogParams.set('type', tool.category)

  const ogImage = `/api/og?${ogParams.toString()}`

  return {
    title: `${tool.name} — Prototype Studio`,
    description,
    openGraph: {
      title: `${tool.name} — Prototype Studio`,
      description: firstSentence,
      images: [{ url: ogImage, width: 1200, height: 630, alt: tool.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} — Prototype Studio`,
      description: firstSentence,
      images: [ogImage],
    },
  }
}

export default async function ToolDetailPage({ params }: Props) {
  const { company, product } = await params
  const supabase = await createClient()

  const { data: tool } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', product)
    .single()
  if (!tool) notFound()

  // Canonicalize: if the URL company segment doesn't match the tool's actual
  // company_slug, redirect to the canonical URL so we don't fragment SEO.
  if (tool.company_slug && tool.company_slug !== company) {
    redirect(`/tools/${tool.company_slug}/${product}`)
  }

  // Parallelize releases + capabilities so the Capabilities tab is hydrated as
  // fast as Overview. Previously these ran sequentially, doubling TTFB on a
  // cache miss.
  const [{ data: releases }, { data: capabilities }] = await Promise.all([
    supabase
      .from('tool_releases')
      .select('id, version, release_date, summary, significance, source_url')
      .eq('tool_id', tool.id)
      .order('release_date', { ascending: false })
      .limit(10),
    supabase
      .from('ecosystem_status')
      .select('capability, category, supported, maturity, quality_score')
      .eq('tool_id', tool.id)
      .order('category'),
  ])

  // Group capabilities by category
  const capsByCategory: Record<
    string,
    {
      capability: string
      category: string
      supported: boolean
      maturity: string | null
      quality_score: number | null
    }[]
  > = {}
  for (const cap of capabilities || []) {
    if (!capsByCategory[cap.category]) capsByCategory[cap.category] = []
    capsByCategory[cap.category].push(cap)
  }

  const companyName = tool.parent_company || company

  return (
    <>
      {/* Tool header */}
      <section className="border-b border-[hsl(var(--border-base))] px-6 py-10 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-[900px]">
          <ScrollReveal>
            <div className="font-mono-data mb-4 flex items-center gap-2 text-[10px] uppercase tracking-wider text-[hsl(var(--fg-muted))]">
              <Link href="/tools" className="hover:text-[hsl(var(--fg-secondary))]">
                TOOLS
              </Link>
              <span aria-hidden>/</span>
              <Link
                href={`/tools/${tool.company_slug || company}`}
                className="hover:text-[hsl(var(--fg-secondary))]"
              >
                {companyName.toUpperCase()}
              </Link>
            </div>
            <div className="mb-6 flex items-center gap-4">
              {tool.logo_url && (
                <Image
                  src={tool.logo_url}
                  alt={tool.name}
                  width={48}
                  height={48}
                  className="rounded-xl"
                />
              )}
              <h1 className="text-h1">{tool.name}</h1>
              {tool.current_version && (
                <span className="font-mono-data rounded-full border border-[hsl(var(--border-base))] px-2.5 py-0.5 text-[10px] text-[hsl(var(--fg-muted))]">
                  v{tool.current_version}
                </span>
              )}
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                live
              </span>
            </div>
            <p className="mb-4 max-w-xl text-[hsl(var(--fg-secondary))]">
              {tool.description}
            </p>
            <div className="flex items-center gap-3">
              <Pill>{tool.category}</Pill>
              {tool.website && (
                <a
                  href={tool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[hsl(var(--fg-muted))] underline underline-offset-2 transition-colors hover:text-[hsl(var(--fg-secondary))]"
                >
                  Website
                </a>
              )}
              {tool.github_repo && (
                <a
                  href={`https://github.com/${tool.github_repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[hsl(var(--fg-muted))] underline underline-offset-2 transition-colors hover:text-[hsl(var(--fg-secondary))]"
                >
                  GitHub
                </a>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Tabbed content */}
      <section className="mx-auto max-w-[900px] px-6 py-6 lg:px-12 lg:py-8">
        <ErrorBoundary section="tool-detail-tabs">
          <ToolDetailTabs
            tool={tool}
            releases={releases || []}
            capsByCategory={capsByCategory}
          />
        </ErrorBoundary>
      </section>
    </>
  )
}
