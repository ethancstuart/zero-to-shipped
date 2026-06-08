import { describe, it, expect } from 'vitest'

/**
 * Tests for the public API response helpers.
 * These are the building blocks used by every v1 endpoint.
 */

// ── apiResponse / apiError ────────────────────────────────────────────
import { apiResponse, apiError, getClientIdentifier } from '@/lib/api/response'

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

// ── getClientIdentifier ───────────────────────────────────────────────

describe('getClientIdentifier', () => {
  it('uses the first x-forwarded-for value', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '10.0.0.1, 10.0.0.2' },
    })
    expect(getClientIdentifier(req)).toBe('10.0.0.1')
  })

  it('falls back to x-real-ip when x-forwarded-for is missing', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-real-ip': '10.0.0.5' },
    })
    expect(getClientIdentifier(req)).toBe('10.0.0.5')
  })

  it('falls back to "anonymous" when no headers are present', () => {
    const req = new Request('https://example.com')
    expect(getClientIdentifier(req)).toBe('anonymous')
  })
})
