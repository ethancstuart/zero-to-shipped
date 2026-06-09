'use client'

import { useMemo, useState } from 'react'
import {
  IMPORTANCE_LABEL,
  IMPORTANCE_ORDER,
  rankTools,
  uniqueCategories,
  type Importance,
  type ScoringCapability,
} from '@/lib/compare-scoring'
import { CapabilityMatrix } from '@/components/tools/capability-matrix'

interface Tool {
  id: string
  name: string
  slug: string
  company_slug?: string | null
}

type PlaygroundCapability = ScoringCapability & { maturity: string | null }

interface ComparePlaygroundProps {
  tools: Tool[]
  capabilities: PlaygroundCapability[]
}

const DEFAULT_IMPORTANCE: Importance = 'nice'

function formatCategory(category: string): string {
  return category
    .split(/[_-\s]+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

export function ComparePlayground({ tools, capabilities }: ComparePlaygroundProps) {
  const categories = useMemo(() => uniqueCategories(capabilities), [capabilities])

  const [weights, setWeights] = useState<Record<string, Importance>>(() =>
    Object.fromEntries(categories.map((c) => [c, DEFAULT_IMPORTANCE])),
  )

  const ranked = useMemo(
    () => rankTools(tools, capabilities, weights),
    [tools, capabilities, weights],
  )

  const allSkipped = Object.values(weights).every((w) => w === 'skip')
  const winner = !allSkipped && ranked.length > 0 ? ranked[0] : null
  const runnersUp = winner ? ranked.slice(1, 4) : []

  const reset = () =>
    setWeights(Object.fromEntries(categories.map((c) => [c, DEFAULT_IMPORTANCE])))

  if (tools.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[hsl(var(--border-base))] p-12 text-center text-[hsl(var(--fg-faint))]">
        Select tools above to compare capabilities.
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-[hsl(var(--border-base))] bg-[hsl(var(--bg-muted))]/40 p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-mono-data text-[10px] tracking-wider uppercase text-[hsl(var(--fg-muted))]">
              What matters to you
            </h2>
            <button
              type="button"
              onClick={reset}
              className="font-mono-data text-[10px] tracking-wider uppercase text-[hsl(var(--fg-faint))] hover:text-[hsl(var(--fg-secondary))]"
            >
              Reset
            </button>
          </div>
          <p className="mb-4 text-xs text-[hsl(var(--fg-faint))]">
            Mark each area Must, Important, Nice, or Skip. Scores update live.
          </p>
          <div className="space-y-4">
            {categories.map((category) => {
              const current = weights[category] ?? DEFAULT_IMPORTANCE
              return (
                <div key={category}>
                  <div className="mb-1.5 text-sm text-[hsl(var(--fg))]">
                    {formatCategory(category)}
                  </div>
                  <div className="grid grid-cols-4 gap-1" role="radiogroup" aria-label={`${formatCategory(category)} importance`}>
                    {IMPORTANCE_ORDER.map((imp) => {
                      const selected = current === imp
                      return (
                        <button
                          key={imp}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() =>
                            setWeights((prev) => ({ ...prev, [category]: imp }))
                          }
                          className={`rounded-md border px-1 py-1.5 text-[11px] font-medium transition-colors ${
                            selected
                              ? 'border-[hsl(var(--pillar-system))] bg-[hsl(var(--pillar-system-surface))] text-[hsl(var(--fg))]'
                              : 'border-[hsl(var(--border-base))] text-[hsl(var(--fg-muted))] hover:border-[hsl(var(--border-hover))] hover:text-[hsl(var(--fg-secondary))]'
                          }`}
                        >
                          {IMPORTANCE_LABEL[imp]}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </aside>

      <div className="space-y-8">
        <BestFitCallout winner={winner} runnersUp={runnersUp} allSkipped={allSkipped} />
        <CapabilityMatrix tools={tools} capabilities={capabilities} />
      </div>
    </div>
  )
}

interface BestFitProps {
  winner: { id: string; name: string; slug: string; score: number; company_slug?: string | null } | null
  runnersUp: { id: string; name: string; slug: string; score: number; company_slug?: string | null }[]
  allSkipped: boolean
}

function BestFitCallout({ winner, runnersUp, allSkipped }: BestFitProps) {
  if (allSkipped) {
    return (
      <div className="rounded-xl border border-dashed border-[hsl(var(--border-base))] p-5 text-sm text-[hsl(var(--fg-faint))]">
        Move at least one area above <em>Skip</em> to see a recommendation.
      </div>
    )
  }
  if (!winner) return null
  const tied = runnersUp.length > 0 && runnersUp[0].score === winner.score
  return (
    <div className="rounded-xl border border-[hsl(var(--pillar-system-border))] bg-[hsl(var(--pillar-system-surface))] p-5">
      <div className="font-mono-data mb-1 text-[10px] tracking-wider uppercase text-[hsl(var(--pillar-system))]">
        Best fit for your priorities
      </div>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-2xl font-bold tracking-tight text-[hsl(var(--fg))]">
          {winner.name}
        </span>
        <span className="font-mono-data text-sm text-[hsl(var(--fg-secondary))]">
          {winner.score} / 100
        </span>
        {tied && (
          <span className="font-mono-data text-[10px] tracking-wider uppercase text-[hsl(var(--fg-faint))]">
            (tied — multiple match)
          </span>
        )}
      </div>
      {runnersUp.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[hsl(var(--fg-muted))]">
          {runnersUp.map((t) => (
            <span key={t.id}>
              {t.name} <span className="font-mono-data text-[hsl(var(--fg-faint))]">{t.score}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
