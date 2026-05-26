import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ToolDetailTabs } from './tool-detail-tabs'
import { Pill } from '@/components/shared/pill'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import Image from 'next/image'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: tool } = await supabase
    .from('tools')
    .select('name, description')
    .eq('slug', slug)
    .single()
  if (!tool) return { title: 'Not Found' }
  return {
    title: `${tool.name} — Prototype Studio`,
    description: tool.description || `Track ${tool.name} releases and capabilities`,
  }
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tool } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .single()
  if (!tool) notFound()

  const { data: releases } = await supabase
    .from('tool_releases')
    .select('*')
    .eq('tool_id', tool.id)
    .order('release_date', { ascending: false })
    .limit(10)

  const { data: capabilities } = await supabase
    .from('ecosystem_status')
    .select('*')
    .eq('tool_id', tool.id)
    .order('category')

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

  return (
    <>
      {/* Tool header */}
      <section className="border-b border-[hsl(var(--border-base))] px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-[900px]">
          <ScrollReveal>
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
      <section className="mx-auto max-w-[900px] px-6 py-12 lg:px-12">
        <ToolDetailTabs
          tool={tool}
          releases={releases || []}
          capsByCategory={capsByCategory}
        />
      </section>
    </>
  )
}
