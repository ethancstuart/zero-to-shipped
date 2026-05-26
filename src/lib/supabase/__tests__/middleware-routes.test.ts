import { describe, it, expect } from 'vitest'

/**
 * Tests for the middleware route-matching logic.
 *
 * The real middleware delegates to `updateSession` which uses Supabase. Instead
 * of mocking the entire Next.js request/response cycle, we extract and test the
 * public-route matching logic directly — the critical path that decides whether
 * an unauthenticated request is allowed through or redirected.
 */

// Extracted from src/lib/supabase/middleware.ts — keep in sync.
const publicRoutes = [
  '/',
  '/auth/callback',
  '/pricing',
  '/leaderboard',
  '/guides',
  '/resources',
  '/agents',
  '/privacy',
  '/terms',
]

function isPublicRoute(pathname: string): boolean {
  return (
    publicRoutes.some((route) => pathname === route) ||
    pathname.startsWith('/u/') ||
    pathname.startsWith('/verify/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/guides/') ||
    pathname.startsWith('/resources/') ||
    pathname.startsWith('/learn/') ||
    pathname === '/learn'
  )
}

describe('middleware public route matching', () => {
  describe('exact public routes', () => {
    it.each(publicRoutes)('allows %s', (route) => {
      expect(isPublicRoute(route)).toBe(true)
    })
  })

  describe('prefix-based public routes', () => {
    it('allows /u/username profiles', () => {
      expect(isPublicRoute('/u/johndoe')).toBe(true)
      expect(isPublicRoute('/u/some-user-123')).toBe(true)
    })

    it('allows /verify/* routes', () => {
      expect(isPublicRoute('/verify/certificate-abc')).toBe(true)
    })

    it('allows /api/* routes', () => {
      expect(isPublicRoute('/api/v1/tools')).toBe(true)
      expect(isPublicRoute('/api/v1/stats')).toBe(true)
      expect(isPublicRoute('/api/cron/tool-intelligence')).toBe(true)
      expect(isPublicRoute('/api/assistant')).toBe(true)
    })

    it('allows /guides/* nested routes', () => {
      expect(isPublicRoute('/guides/getting-started')).toBe(true)
      expect(isPublicRoute('/guides/advanced/prompt-engineering')).toBe(true)
    })

    it('allows /resources/* nested routes', () => {
      expect(isPublicRoute('/resources/templates')).toBe(true)
    })

    it('allows /learn and /learn/* routes', () => {
      expect(isPublicRoute('/learn')).toBe(true)
      expect(isPublicRoute('/learn/lessons/test-lesson')).toBe(true)
    })
  })

  describe('protected routes', () => {
    it('blocks /dashboard', () => {
      expect(isPublicRoute('/dashboard')).toBe(false)
    })

    it('blocks /profile', () => {
      expect(isPublicRoute('/profile')).toBe(false)
    })

    it('blocks /admin', () => {
      expect(isPublicRoute('/admin')).toBe(false)
    })

    it('blocks /skill-tree', () => {
      expect(isPublicRoute('/skill-tree')).toBe(false)
    })

    it('blocks /build-log', () => {
      expect(isPublicRoute('/build-log')).toBe(false)
    })

    it('blocks /cheat-sheets', () => {
      expect(isPublicRoute('/cheat-sheets')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('does not match partial route names', () => {
      // /pricingx should NOT match /pricing
      expect(isPublicRoute('/pricingx')).toBe(false)
    })

    it('root path is public', () => {
      expect(isPublicRoute('/')).toBe(true)
    })

    it('/auth/callback is public but /auth is not', () => {
      expect(isPublicRoute('/auth/callback')).toBe(true)
      expect(isPublicRoute('/auth')).toBe(false)
    })
  })
})
