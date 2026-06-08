'use client'

import { useCallback, useState, useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'ps-cookie-consent'

type StoredConsent = 'accepted' | 'declined' | null

function readConsent(): StoredConsent {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'accepted' || value === 'declined') return value
    return null
  } catch {
    return null
  }
}

function writeConsent(consent: 'accepted' | 'declined') {
  try {
    localStorage.setItem(STORAGE_KEY, consent)
  } catch {
    // localStorage unavailable — silently ignore
  }
}

function getSnapshot(): StoredConsent {
  return readConsent()
}

function getServerSnapshot(): StoredConsent {
  // Pretend consent is already given during SSR so the banner stays hidden
  // until we know the real client-side value.
  return 'accepted'
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

export function CookieConsent() {
  const storedConsent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )
  const [dismissed, setDismissed] = useState(false)

  const accept = useCallback(() => {
    writeConsent('accepted')
    setDismissed(true)
  }, [])

  const decline = useCallback(() => {
    writeConsent('declined')
    setDismissed(true)
    try {
      window.dispatchEvent(new CustomEvent('ps-analytics-declined'))
    } catch {
      // ignore
    }
  }, [])

  if (storedConsent !== null || dismissed) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className={cn(
        'fixed bottom-4 left-4 right-4 z-50',
        'sm:left-auto sm:right-4 sm:max-w-md',
        'rounded-lg border border-[hsl(var(--border-base))]',
        'bg-[hsl(var(--bg))] backdrop-blur-sm',
        'p-4 shadow-lg',
      )}
    >
      <p className="text-sm text-[hsl(var(--fg-secondary))] mb-3 leading-relaxed">
        This site uses essential cookies for authentication and optional cookies
        for analytics. You can change your preference any time.
      </p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={decline}
          className={cn(
            'text-xs px-3 py-1.5 rounded-md',
            'text-[hsl(var(--fg-secondary))] hover:text-[hsl(var(--fg))]',
            'transition-colors',
          )}
        >
          Decline
        </button>
        <button
          onClick={accept}
          className={cn(
            'text-xs px-3 py-1.5 rounded-md',
            'bg-[hsl(var(--fg))] text-[hsl(var(--bg))]',
            'hover:opacity-90 transition-opacity',
          )}
        >
          Accept
        </button>
      </div>
    </div>
  )
}
