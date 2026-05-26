'use client'

import { useState } from 'react'
import { ToolCard } from '@/components/content/tool-card'
import { StaggerGrid } from '@/components/motion/stagger-grid'

interface Tool {
  slug: string
  name: string
  category: string
  description: string | null
  current_version: string | null
  logo_url: string | null
}

interface ToolsCategoryFilterProps {
  tools: Tool[]
  categories: string[]
}

export function ToolsCategoryFilter({ tools, categories }: ToolsCategoryFilterProps) {
  const [active, setActive] = useState<string | null>(null)

  const filtered = active
    ? tools.filter((t) => t.category === active)
    : tools

  return (
    <>
      {/* Category filter pills */}
      <div className="mb-10 flex flex-wrap gap-2">
        <button
          onClick={() => setActive(null)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
            !active
              ? 'border-[hsl(var(--fg))] bg-[hsl(var(--fg))] text-[hsl(var(--bg))]'
              : 'border-[hsl(var(--border-base))] text-[hsl(var(--fg-muted))] hover:border-[hsl(var(--border-hover))] hover:text-[hsl(var(--fg-secondary))]'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
              active === cat
                ? 'border-[hsl(var(--fg))] bg-[hsl(var(--fg))] text-[hsl(var(--bg))]'
                : 'border-[hsl(var(--border-base))] text-[hsl(var(--fg-muted))] hover:border-[hsl(var(--border-hover))] hover:text-[hsl(var(--fg-secondary))]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tool cards grid */}
      <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tool) => (
          <ToolCard
            key={tool.slug}
            slug={tool.slug}
            name={tool.name}
            category={tool.category}
            description={tool.description}
            currentVersion={tool.current_version}
            logoUrl={tool.logo_url}
          />
        ))}
      </StaggerGrid>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border-base))] p-12 text-center">
          <p className="font-mono-data text-sm text-[hsl(var(--fg-muted))]">
            No tools in this category yet.
          </p>
        </div>
      )}
    </>
  )
}
