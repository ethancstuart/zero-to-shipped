'use client'

import { useSyncExternalStore, useCallback, useState } from 'react'
import Link from 'next/link'

function getSnapshot(): boolean {
  try {
    return !localStorage.getItem('ps-visited')
  } catch {
    return false
  }
}

function getServerSnapshot(): boolean {
  return false
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

export function FirstVisitBanner() {
  const shouldShow = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [dismissed, setDismissed] = useState(false)

  const dismiss = useCallback(() => {
    setDismissed(true)
    try {
      localStorage.setItem('ps-visited', 'true')
    } catch {
      // localStorage not available
    }
  }, [])

  if (!shouldShow || dismissed) return null

  return (
    <div className="relative bg-[hsl(var(--pillar-learn-surface))] border border-[hsl(var(--pillar-learn-border))] px-4 py-2.5 flex items-center justify-center gap-3">
      <span className="text-sm text-[hsl(var(--fg-secondary))]">
        New here?{' '}
        <Link
          href="/learn"
          className="font-medium text-[hsl(var(--pillar-learn))] hover:underline"
        >
          Start with Learn &rarr;
        </Link>
      </span>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))] transition-colors text-sm leading-none"
        aria-label="Dismiss banner"
      >
        &times;
      </button>
    </div>
  )
}
