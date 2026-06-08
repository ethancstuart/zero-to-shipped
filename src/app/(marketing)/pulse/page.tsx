import { listContentByPillar } from '@/lib/content/loader'
import { FilterableContentGrid } from '@/components/content/filterable-content-grid'
import { LiveIndicator } from '@/components/pulse/live-indicator'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pulse — Prototype Studio',
  description: "What's happening across AI coding tools.",
}

export const revalidate = 900

async function getLatestBriefTimestamp(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('content_index')
      .select('published_at')
      .eq('pillar', 'pulse')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .single()
    return data?.published_at ?? null
  } catch {
    return null
  }
}

export default async function PulsePage() {
  const [items, latestAt] = await Promise.all([
    listContentByPillar('pulse'),
    getLatestBriefTimestamp(),
  ])

  return (
    <>
      <section className="bg-[hsl(var(--pillar-pulse-surface))] border-b border-[hsl(var(--pillar-pulse-border))] py-20 px-6 lg:px-12">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-[10px] tracking-wider font-medium uppercase text-[hsl(var(--pillar-pulse))] mb-4">
            PULSE
          </div>
          <div className="flex flex-wrap items-end gap-x-6 gap-y-3 mb-3">
            <h1 className="text-h1">Pulse</h1>
            <LiveIndicator timestamp={latestAt} />
          </div>
          <p className="text-[hsl(var(--fg-secondary))] max-w-lg">
            What&apos;s happening across AI coding tools.
          </p>
        </div>
      </section>

      <section className="max-w-[1300px] mx-auto px-6 lg:px-12 py-12">
        <FilterableContentGrid
          items={items.map(i => i.frontmatter)}
          types={['brief', 'comparison', 'release']}
          pillar="pulse"
        />
      </section>
    </>
  )
}
