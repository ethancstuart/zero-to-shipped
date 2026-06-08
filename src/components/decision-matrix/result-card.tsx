'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Recommendation, ToolSlug } from '@/lib/decision-matrix'
import { getToolMeta } from '@/lib/decision-matrix'

interface ResultCardProps {
  recommendation: Recommendation
  shareUrl: string
  onRestart: () => void
}

export function ResultCard({ recommendation, shareUrl, onRestart }: ResultCardProps) {
  const [copied, setCopied] = useState(false)
  const primaryMeta = getToolMeta(recommendation.primary.slug as ToolSlug)

  async function handleShare() {
    try {
      const fullUrl =
        typeof window !== 'undefined'
          ? new URL(shareUrl, window.location.origin).toString()
          : shareUrl
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable — no-op.
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Headline */}
      <div className="flex flex-col gap-4">
        <span className="font-mono-data text-[10px] tracking-wider uppercase text-[hsl(var(--pillar-system))]">
          My recommendation
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[hsl(var(--fg))] leading-tight">
          For your situation, I&rsquo;d reach for{' '}
          <span className="text-[hsl(var(--pillar-system))] font-normal">{primaryMeta.name}</span>.
        </h2>
        <p className="text-base sm:text-lg text-[hsl(var(--fg-secondary))] leading-relaxed max-w-2xl">
          {recommendation.primary.reasoning}
        </p>
        <div className="pt-2">
          <Link
            href={`/tools/${recommendation.primary.company}/${recommendation.primary.slug}`}
            className="inline-flex items-center gap-2 text-sm text-[hsl(var(--fg))] underline decoration-[hsl(var(--pillar-system))] underline-offset-4 hover:decoration-2 transition-all"
          >
            Read more about {primaryMeta.name}
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Honorable mentions */}
      {recommendation.alternates.length > 0 && (
        <div className="border-t border-[hsl(var(--border-base))] pt-8">
          <div className="font-mono-data text-[10px] tracking-wider uppercase text-[hsl(var(--fg-faint))] mb-4">
            Honorable mentions
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {recommendation.alternates.map((alt) => {
              const altMeta = getToolMeta(alt.slug as ToolSlug)
              return (
                <Link
                  key={alt.slug}
                  href={`/tools/${alt.company}/${alt.slug}`}
                  className="group rounded-xl border border-[hsl(var(--border-base))] p-5 transition-colors hover:border-[hsl(var(--border-strong))] hover:bg-[hsl(var(--bg-muted))]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-lg text-[hsl(var(--fg))]">
                      {altMeta.name}
                    </span>
                    <span
                      aria-hidden
                      className="text-[hsl(var(--fg-faint))] transition-transform group-hover:translate-x-0.5"
                    >
                      &rarr;
                    </span>
                  </div>
                  <p className="text-sm text-[hsl(var(--fg-muted))] leading-relaxed">
                    {alt.whenToPick}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-4 border-t border-[hsl(var(--border-base))] pt-6">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border-strong))] px-5 py-2 text-xs text-[hsl(var(--fg-secondary))] hover:text-[hsl(var(--fg))] hover:border-[hsl(var(--fg))] transition-all"
        >
          {copied ? 'Link copied' : 'Share my recommendation'}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="text-xs text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))] underline underline-offset-4"
        >
          Try the wizard again
        </button>
      </div>
    </div>
  )
}
