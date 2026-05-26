'use client'

import { useEffect } from 'react'
import { trackContentView } from '@/lib/analytics'

interface ViewTrackerProps {
  slug: string
  pillar?: string
  type?: string
}

export function ViewTracker({ slug, pillar, type }: ViewTrackerProps) {
  useEffect(() => {
    // Supabase content_analytics tracking (existing)
    fetch('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {})

    // Vercel Analytics custom event for redesign success metrics
    if (pillar && type) {
      trackContentView(pillar, type, slug)
    }
  }, [slug, pillar, type])

  return null
}
