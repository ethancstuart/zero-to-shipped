import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Coding Tools — Prototype Studio',
  description: 'Track 9 AI coding tools — releases, capabilities, and comparisons.',
}

export default async function ToolsPage() {
  const supabase = await createClient()
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .order('name')

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">
        AI Coding Tools
      </h1>
      <p className="mb-12 max-w-2xl text-lg text-white/50">
        We track releases and capabilities across {tools?.length || 0} AI coding
        tools so you always know what&apos;s current.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools?.map((tool) => (
          <a
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/40">
                {tool.category}
              </span>
            </div>
            <p className="mb-3 text-sm text-white/50">{tool.description}</p>
            {tool.current_version && (
              <span className="text-xs text-white/30">
                v{tool.current_version}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}
