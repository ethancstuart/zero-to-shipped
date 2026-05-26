'use client'

import { useEffect } from 'react'
import { trackReturnVisit } from '@/lib/analytics'

/**
 * Fires a return_visit event when a visitor comes back within 7 days.
 * Renders nothing — drop into any layout that should track return visits.
 */
export function ReturnVisitTracker() {
  useEffect(() => {
    trackReturnVisit()
  }, [])

  return null
}
