'use client'

import { useSyncExternalStore } from 'react'

interface LiveIndicatorProps {
  timestamp?: string | null
}

function formatRelative(then: Date, now: Date): string {
  const diffMs = Math.max(0, now.getTime() - then.getTime())
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hr ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`
  const diffMonth = Math.floor(diffDay / 30)
  return `${diffMonth} mo ago`
}

// useSyncExternalStore-based "ticking clock" so we never call setState in an
// effect. The store fires every 60s, which is the cadence we need for the
// "X min ago" label.
function subscribeMinute(onChange: () => void): () => void {
  const id = setInterval(onChange, 60_000)
  return () => clearInterval(id)
}

function getClientNow(): number {
  return Date.now()
}

function getServerNow(): number {
  // Stable server snapshot to avoid hydration drift; client will replace.
  return 0
}

export function LiveIndicator({ timestamp }: LiveIndicatorProps) {
  const nowMs = useSyncExternalStore(subscribeMinute, getClientNow, getServerNow)

  if (!timestamp) return null
  const then = new Date(timestamp)
  if (isNaN(then.getTime())) return null

  const label = nowMs > 0 ? formatRelative(then, new Date(nowMs)) : ''

  return (
    <div
      className="inline-flex items-center gap-2 text-[11px] font-mono-data tracking-wider uppercase text-[hsl(var(--fg-muted))]"
      aria-live="polite"
    >
      <span className="relative inline-flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/60 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span>Last brief: {label || '—'}</span>
    </div>
  )
}
