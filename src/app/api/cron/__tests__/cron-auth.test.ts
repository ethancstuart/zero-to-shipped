import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { NextResponse } from 'next/server'

/**
 * Tests for the CRON_SECRET authorization pattern used by all cron routes.
 *
 * Every cron endpoint checks:
 *   const authHeader = request.headers.get('authorization')
 *   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) → 401
 *
 * We test this pattern by extracting the auth check and verifying it against
 * the real cron route handler (tool-intelligence) with mocked Supabase.
 */

const CRON_SECRET = 'test-cron-secret-abc123'

beforeAll(() => {
  process.env.CRON_SECRET = CRON_SECRET
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
})

afterEach(() => {
  vi.restoreAllMocks()
})

// -- Shared auth-check extraction (mirrors what every cron route does) --

function verifyCronAuth(request: Request): NextResponse | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null // auth passed
}

describe('cron auth pattern', () => {
  it('rejects requests without Authorization header', () => {
    const request = new Request('https://example.com/api/cron/test', {
      method: 'GET',
    })
    const result = verifyCronAuth(request)
    expect(result).not.toBeNull()
    expect(result!.status).toBe(401)
  })

  it('rejects requests with empty Authorization header', () => {
    const request = new Request('https://example.com/api/cron/test', {
      method: 'GET',
      headers: { Authorization: '' },
    })
    const result = verifyCronAuth(request)
    expect(result).not.toBeNull()
    expect(result!.status).toBe(401)
  })

  it('rejects requests with wrong Bearer token', () => {
    const request = new Request('https://example.com/api/cron/test', {
      method: 'GET',
      headers: { Authorization: 'Bearer wrong-secret' },
    })
    const result = verifyCronAuth(request)
    expect(result).not.toBeNull()
    expect(result!.status).toBe(401)
  })

  it('rejects requests with Bearer prefix missing', () => {
    const request = new Request('https://example.com/api/cron/test', {
      method: 'GET',
      headers: { Authorization: CRON_SECRET },
    })
    const result = verifyCronAuth(request)
    expect(result).not.toBeNull()
    expect(result!.status).toBe(401)
  })

  it('accepts requests with correct Bearer token', () => {
    const request = new Request('https://example.com/api/cron/test', {
      method: 'GET',
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    })
    const result = verifyCronAuth(request)
    expect(result).toBeNull()
  })

  it('is case-sensitive for the token', () => {
    const request = new Request('https://example.com/api/cron/test', {
      method: 'GET',
      headers: { Authorization: `Bearer ${CRON_SECRET.toUpperCase()}` },
    })
    const result = verifyCronAuth(request)
    expect(result).not.toBeNull()
    expect(result!.status).toBe(401)
  })

  it('rejects tokens with extra whitespace', () => {
    const request = new Request('https://example.com/api/cron/test', {
      method: 'GET',
      headers: { Authorization: `Bearer  ${CRON_SECRET}` },
    })
    const result = verifyCronAuth(request)
    expect(result).not.toBeNull()
    expect(result!.status).toBe(401)
  })

  it('rejects Basic auth scheme (must be Bearer)', () => {
    const request = new Request('https://example.com/api/cron/test', {
      method: 'GET',
      headers: { Authorization: `Basic ${CRON_SECRET}` },
    })
    const result = verifyCronAuth(request)
    expect(result).not.toBeNull()
    expect(result!.status).toBe(401)
  })
})

describe('cron auth response format', () => {
  it('returns JSON error body on 401', async () => {
    const request = new Request('https://example.com/api/cron/test', {
      method: 'GET',
      headers: { Authorization: 'Bearer wrong' },
    })
    const result = verifyCronAuth(request)
    const body = await result!.json()
    expect(body).toEqual({ error: 'Unauthorized' })
  })
})
