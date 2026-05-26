'use client'

import { useEffect } from 'react'
import { trackSignup } from '@/lib/analytics'

/**
 * Fires a signup event once on mount.
 * Place on the welcome page (or any page only new users see).
 */
export function SignupTracker() {
  useEffect(() => {
    trackSignup()
  }, [])

  return null
}
