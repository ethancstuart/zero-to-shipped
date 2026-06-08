'use client'

import { useState } from 'react'
import { ContentCard } from '@/components/content/content-card'
import { StaggerGrid } from '@/components/motion/stagger-grid'
import type { ContentFrontmatter } from '@/types/content'

type PillarName = 'pulse' | 'build' | 'learn' | 'system'

const pillarActiveStyles: Record<PillarName, string> = {
  pulse: 'bg-[hsl(var(--pillar-pulse-surface))] text-[hsl(var(--pillar-pulse))] border-[hsl(var(--pillar-pulse-border))]',
  build: 'bg-[hsl(var(--pillar-build-surface))] text-[hsl(var(--pillar-build))] border-[hsl(var(--pillar-build-border))]',
  learn: 'bg-[hsl(var(--pillar-learn-surface))] text-[hsl(var(--pillar-learn))] border-[hsl(var(--pillar-learn-border))]',
  system: 'bg-[hsl(var(--pillar-system-surface))] text-[hsl(var(--pillar-system))] border-[hsl(var(--pillar-system-border))]',
}

interface FilterableContentGridProps {
  items: ContentFrontmatter[]
  types: string[]
  pillar: PillarName
}

export function FilterableContentGrid({ items, types, pillar }: FilterableContentGridProps) {
  // Only surface filter pills for types that actually have content in this set,
  // so we never render a pill that leads to an empty grid.
  const availableTypes = types.filter((t) => items.some((i) => i.type === t))

  const [activeType, setActiveType] = useState<string>('all')
  // If the previously active type became unavailable, treat as 'all'.
  const effectiveType =
    activeType !== 'all' && !availableTypes.includes(activeType) ? 'all' : activeType
  const filtered =
    effectiveType === 'all' ? items : items.filter((i) => i.type === effectiveType)

  const inactiveClass = 'bg-[hsl(var(--bg-muted))] text-[hsl(var(--fg-muted))] border-[hsl(var(--border-base))]'
  const activeClass = pillarActiveStyles[pillar]

  return (
    <>
      {availableTypes.length > 0 && (
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setActiveType('all')}
            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium tracking-wide border transition-colors ${
              effectiveType === 'all' ? activeClass : inactiveClass
            }`}
          >
            All
          </button>
          {availableTypes.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium tracking-wide border transition-colors capitalize ${
                effectiveType === type ? activeClass : inactiveClass
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}
      {filtered.length > 0 ? (
        <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <ContentCard key={item.slug} content={item} />
          ))}
        </StaggerGrid>
      ) : (
        <div className="border border-dashed border-[hsl(var(--border-base))] rounded-xl p-12 text-center">
          <span className="font-mono-data text-sm text-[hsl(var(--fg-muted))]">Coming soon</span>
        </div>
      )}
    </>
  )
}
