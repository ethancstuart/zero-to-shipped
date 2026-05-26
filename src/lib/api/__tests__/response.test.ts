import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Tests for the public API response helpers and rate limiter.
 * These are the building blocks used by every v1 endpoint.
 */

// ── apiResponse / apiError ────────────────────────────────────────────
import { apiResponse, apiError } from '@/lib/api/response'

describe('apiResponse', () => {
  it('wraps data in standard envelope', async () => {
    const res = apiResponse({ tools: [] })
    const body = await res.json()
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('meta')
    expect(body.data).toEqual({ tools: [] })
  })

  it('includes apiVersion in meta', async () => {
    const res = apiResponse([])
    const body = await res.json()
    expect(body.meta.apiVersion).toBe('v1')
  })

  it('includes generatedAt timestamp in meta', async () => {
    const res = apiResponse(null)
    const body = await res.json()
    expect(body.meta.generatedAt).toBeDefined()
    // Should be a valid ISO date
    expect(new Date(body.meta.generatedAt).toISOString()).toBe(body.meta.generatedAt)
  })

  it('merges custom meta fields', async () => {
    const res = apiResponse([], { count: 5, remaining: 95 })
    const body = await res.json()
    expect(body.meta.count).toBe(5)
    expect(body.meta.remaining).toBe(95)
    expect(body.meta.apiVersion).toBe('v1')
  })

  it('sets cache-control headers', () => {
    const res = apiResponse([])
    expect(res.headers.get('Cache-Control')).toContain('public')
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=3600')
  })

  it('returns 200 status', () => {
    const res = apiResponse([])
    expect(res.status).toBe(200)
  })
})

describe('apiError', () => {
  it('returns error message in JSON', async () => {
    const res = apiError('Not found', 404)
    const body = await res.json()
    expect(body).toEqual({ error: 'Not found' })
  })

  it('sets correct status code', () => {
    expect(apiError('Bad request', 400).status).toBe(400)
    expect(apiError('Unauthorized', 401).status).toBe(401)
    expect(apiError('Server error', 500).status).toBe(500)
    expect(apiError('Rate limit', 429).status).toBe(429)
  })
})

// ── Rate limiter ──────────────────────────────────────────────────────
import { checkRateLimit } from '@/lib/api/rate-limit'

describe('checkRateLimit', () => {
  // Use unique IPs per test to avoid cross-test contamination
  let testIp = 0
  function nextIp() {
    testIp++
    return `rate-limit-test-${testIp}`
  }

  it('allows the first request', () => {
    const { allowed, remaining } = checkRateLimit(nextIp())
    expect(allowed).toBe(true)
    expect(remaining).toBe(99)
  })

  it('tracks remaining requests', () => {
    const ip = nextIp()
    checkRateLimit(ip, 10)
    const { remaining } = checkRateLimit(ip, 10)
    expect(remaining).toBe(8)
  })

  it('blocks after limit is reached', () => {
    const ip = nextIp()
    const limit = 3
    checkRateLimit(ip, limit) // 1
    checkRateLimit(ip, limit) // 2
    checkRateLimit(ip, limit) // 3 — at limit
    const { allowed, remaining } = checkRateLimit(ip, limit) // 4 — over
    expect(allowed).toBe(false)
    expect(remaining).toBe(0)
  })

  it('uses default limit of 100', () => {
    const ip = nextIp()
    const { remaining } = checkRateLimit(ip)
    expect(remaining).toBe(99)
  })

  it('treats different identifiers independently', () => {
    const ip1 = nextIp()
    const ip2 = nextIp()
    checkRateLimit(ip1, 2)
    checkRateLimit(ip1, 2)
    const { allowed: ip1Allowed } = checkRateLimit(ip1, 2) // 3rd = over limit
    const { allowed: ip2Allowed } = checkRateLimit(ip2, 2) // 1st = under limit
    expect(ip1Allowed).toBe(false)
    expect(ip2Allowed).toBe(true)
  })

  it('remaining never goes below 0', () => {
    const ip = nextIp()
    checkRateLimit(ip, 1)
    checkRateLimit(ip, 1)
    const { remaining } = checkRateLimit(ip, 1)
    expect(remaining).toBe(0)
  })
})
