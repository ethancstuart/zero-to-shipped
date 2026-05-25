import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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
  const capsByCategory: Record<string, { capability: string; category: string; supported: boolean; maturity: string | null; quality_score: number | null }[]> = {}
  for (const cap of capabilities || []) {
    if (!capsByCategory[cap.category]) capsByCategory[cap.category] = []
    capsByCategory[cap.category].push(cap)
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-white">{tool.name}</h1>
          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/50">
            {tool.category}
          </span>
        </div>
        <p className="mb-4 text-lg text-white/60">{tool.description}</p>
        <div className="flex items-center gap-4 text-sm text-white/40">
          {tool.current_version && <span>v{tool.current_version}</span>}
          {tool.website && (
            <a
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/60"
            >
              Website &rarr;
            </a>
          )}
          {tool.github_repo && (
            <a
              href={`https://github.com/${tool.github_repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/60"
            >
              GitHub &rarr;
            </a>
          )}
        </div>
      </div>

      {/* Capabilities */}
      {Object.keys(capsByCategory).length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-white">Capabilities</h2>
          <div className="space-y-8">
            {Object.entries(capsByCategory).map(([category, caps]) => (
              <div key={category}>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-white/40">
                  {category}
                </h3>
                <div className="space-y-2">
                  {caps.map((cap) => (
                    <div
                      key={cap.capability}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
                    >
                      <span className="text-sm text-white/80">{cap.capability}</span>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs ${cap.supported ? 'text-green-400' : 'text-white/20'}`}
                        >
                          {cap.supported ? '✓ Supported' : '✗ Not supported'}
                        </span>
                        {cap.maturity && (
                          <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/40">
                            {cap.maturity}
                          </span>
                        )}
                        {cap.quality_score && (
                          <span className="text-xs text-white/30">
                            {'★'.repeat(cap.quality_score)}
                            {'☆'.repeat(5 - cap.quality_score)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Release History */}
      {releases && releases.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-white">Release History</h2>
          <div className="space-y-4">
            {releases.map((release) => (
              <div
                key={release.id}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-white">
                    v{release.version}
                  </span>
                  {release.significance && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        release.significance === 'major'
                          ? 'bg-blue-500/10 text-blue-400'
                          : release.significance === 'minor'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-white/5 text-white/40'
                      }`}
                    >
                      {release.significance}
                    </span>
                  )}
                  <span className="text-xs text-white/30">
                    {new Date(release.release_date).toLocaleDateString()}
                  </span>
                </div>
                {release.summary && (
                  <p className="text-sm text-white/60">{release.summary}</p>
                )}
                {release.source_url && (
                  <a
                    href={release.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-white/30 underline hover:text-white/50"
                  >
                    View release &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
