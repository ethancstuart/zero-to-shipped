import { notFound } from 'next/navigation'
import { getContentBySlug, getContentSlugs } from '@/lib/content/loader'
import { mdxComponents } from '@/components/mdx'
import { ToolBadge } from '@/components/mdx/tool-badge'
import { ForYouSidebar } from '@/components/content/for-you-sidebar'
import { BookmarkButton } from '@/components/content/bookmark-button'
import { ViewTracker } from '@/components/content/view-tracker'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getContentSlugs('system')
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getContentBySlug('system', slug, mdxComponents)
  if (!result) return { title: 'Not Found' }
  return {
    title: `${result.frontmatter.title} — Prototype Studio`,
    description: `${result.frontmatter.difficulty} · ${result.frontmatter.estimatedMinutes} min · ${result.frontmatter.tools.join(', ')}`,
  }
}

export default async function SystemDetailPage({ params }: Props) {
  const { slug } = await params
  const result = await getContentBySlug('system', slug, mdxComponents)

  if (!result) notFound()

  const { frontmatter, content } = result

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <article>
          <header className="mb-12">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/50">
                {frontmatter.type}
              </span>
              <span className="text-xs text-white/40">
                {frontmatter.difficulty} · {frontmatter.estimatedMinutes} min
              </span>
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">
              {frontmatter.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {frontmatter.tools.map((tool) => (
                <ToolBadge
                  key={tool}
                  name={tool}
                  version={frontmatter.toolVersions[tool]}
                />
              ))}
              <BookmarkButton slug={frontmatter.slug} />
            </div>
          </header>

          <ViewTracker slug={frontmatter.slug} />

          <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-blue-400 prose-code:rounded prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-pre:border prose-pre:border-white/10">
            {content}
          </div>
        </article>
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ForYouSidebar />
          </div>
        </aside>
      </div>
    </div>
  )
}
