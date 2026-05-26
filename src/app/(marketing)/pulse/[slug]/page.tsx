import { notFound } from 'next/navigation'
import { getContentBySlug, getContentSlugs } from '@/lib/content/loader'
import { mdxComponents } from '@/components/mdx'
import { ToolBadge } from '@/components/mdx/tool-badge'
import { ScrollProgress } from '@/components/motion/scroll-progress'
import { Pill } from '@/components/shared/pill'
import { TocSidebar } from '@/components/content/toc-sidebar'
import { MobileToc } from '@/components/content/mobile-toc'
import { BookmarkButton } from '@/components/content/bookmark-button'
import { ViewTracker } from '@/components/content/view-tracker'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 900

export async function generateStaticParams() {
  const slugs = await getContentSlugs('pulse')
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getContentBySlug('pulse', slug, mdxComponents)
  if (!result) return { title: 'Not Found' }
  return {
    title: `${result.frontmatter.title} — Prototype Studio`,
    description: `${result.frontmatter.difficulty} · ${result.frontmatter.estimatedMinutes} min · ${result.frontmatter.tools.join(', ')}`,
  }
}

export default async function PulseDetailPage({ params }: Props) {
  const { slug } = await params
  const result = await getContentBySlug('pulse', slug, mdxComponents)

  if (!result) notFound()

  const { frontmatter, content } = result

  return (
    <>
      <ScrollProgress />
      <article className="max-w-[1300px] mx-auto px-6 lg:px-12 pt-32 pb-20">
        {/* Metadata row */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Pill pillar={frontmatter.pillar}>{frontmatter.pillar}</Pill>
          <Pill>{frontmatter.type}</Pill>
          {frontmatter.estimatedMinutes > 0 && (
            <Pill>{frontmatter.estimatedMinutes} min</Pill>
          )}
          <Pill>{frontmatter.difficulty}</Pill>
        </div>

        {/* Title */}
        <h1 className="text-h1 mb-4">{frontmatter.title}</h1>

        {/* Tools + bookmark */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {frontmatter.tools.map((tool) => (
            <ToolBadge
              key={tool}
              name={tool}
              version={frontmatter.toolVersions[tool]}
            />
          ))}
          <BookmarkButton slug={frontmatter.slug} />
        </div>

        {/* Divider */}
        <div className="h-px bg-[hsl(var(--border-base))] my-8" />

        {/* Mobile ToC */}
        <MobileToc />

        <ViewTracker slug={frontmatter.slug} pillar={frontmatter.pillar} type={frontmatter.type} />

        {/* Two-column layout */}
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12">
          {/* Prose */}
          <div
            data-prose
            className="prose prose-neutral dark:prose-invert max-w-[720px] prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[hsl(var(--accent-hsl))] prose-code:rounded prose-code:bg-[hsl(var(--bg-muted))] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-pre:border prose-pre:border-[hsl(var(--border-base))]"
          >
            {content}
          </div>

          {/* Sidebar */}
          <TocSidebar />
        </div>
      </article>
    </>
  )
}
