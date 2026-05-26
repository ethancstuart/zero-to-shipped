import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Integration-style tests for v1 API endpoints.
 * Mocks Supabase to test response structure and error handling.
 */

// ── Supabase mock ──────────────────────────────────────────────────
type MockRow = Record<string, unknown>

function createQueryBuilder(
  defaults: { data?: MockRow[] | null; error?: unknown; count?: number | null } = {},
) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {}
  const chainMethods = [
    'select', 'insert', 'update', 'upsert', 'delete',
    'eq', 'in', 'order', 'limit', 'maybeSingle', 'single',
  ]

  for (const m of chainMethods) {
    builder[m] = vi.fn().mockReturnValue(builder)
  }

  builder.then = vi.fn((resolve: (v: unknown) => void) =>
    resolve({
      data: defaults.data ?? null,
      error: defaults.error ?? null,
      count: defaults.count ?? null,
    }),
  )

  return builder
}

let tableOverrides: Record<string, ReturnType<typeof createQueryBuilder>> = {}

const mockSupabase = {
  from: vi.fn((table: string) => {
    if (tableOverrides[table]) return tableOverrides[table]
    return createQueryBuilder()
  }),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

// ── Mock rate limiter to always allow ──────────────────────────────
vi.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 99 })),
}))

beforeEach(() => {
  vi.clearAllMocks()
  tableOverrides = {}
})

// ── /api/v1/tools ─────────────────────────────────────────────────

describe('GET /api/v1/tools', () => {
  // Dynamic import so mocks are in place
  async function callToolsEndpoint() {
    const mod = await import('@/app/api/v1/tools/route')
    const request = new Request('https://example.com/api/v1/tools', {
      headers: { 'x-forwarded-for': '127.0.0.1' },
    })
    return mod.GET(request)
  }

  it('returns tools in standard envelope', async () => {
    const tools = [
      { name: 'Claude Code', slug: 'claude-code', category: 'IDE', current_version: '1.0.32', last_release_date: '2026-05-20', description: 'AI coding assistant', website: 'https://claude.ai' },
      { name: 'Cursor', slug: 'cursor', category: 'IDE', current_version: '0.50.1', last_release_date: '2026-05-18', description: 'AI code editor', website: 'https://cursor.com' },
    ]
    tableOverrides.tools = createQueryBuilder({ data: tools })

    const res = await callToolsEndpoint()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(2)
    expect(body.data[0].name).toBe('Claude Code')
    expect(body.meta.apiVersion).toBe('v1')
    expect(body.meta.count).toBe(2)
  })

  it('returns empty array when no tools exist', async () => {
    tableOverrides.tools = createQueryBuilder({ data: [] })

    const res = await callToolsEndpoint()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toEqual([])
    expect(body.meta.count).toBe(0)
  })

  it('returns 500 on database error', async () => {
    tableOverrides.tools = createQueryBuilder({
      data: null,
      error: { message: 'Connection failed' },
    })

    const res = await callToolsEndpoint()
    expect(res.status).toBe(500)
  })
})

// ── /api/v1/stats ─────────────────────────────────────────────────

describe('GET /api/v1/stats', () => {
  async function callStatsEndpoint() {
    const mod = await import('@/app/api/v1/stats/route')
    const request = new Request('https://example.com/api/v1/stats', {
      headers: { 'x-forwarded-for': '127.0.0.1' },
    })
    return mod.GET(request)
  }

  it('returns platform metrics', async () => {
    tableOverrides.tools = createQueryBuilder({ count: 45, data: [] })
    tableOverrides.content_index = createQueryBuilder({ count: 37, data: [] })
    tableOverrides.showcase_projects = createQueryBuilder({ count: 12, data: [] })
    tableOverrides.tool_releases = createQueryBuilder({ count: 200, data: [] })
    tableOverrides.platform_costs = createQueryBuilder({
      data: [{ amount_cents: 1000 }, { amount_cents: 2500 }],
    })

    const res = await callStatsEndpoint()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.toolsTracked).toBe(45)
    expect(body.data.contentPieces).toBe(37)
    expect(body.data.showcaseEntries).toBe(12)
    expect(body.data.totalReleases).toBe(200)
    expect(body.data.totalCostCents).toBe(3500)
  })

  it('handles zero counts gracefully', async () => {
    tableOverrides.tools = createQueryBuilder({ count: 0, data: [] })
    tableOverrides.content_index = createQueryBuilder({ count: 0, data: [] })
    tableOverrides.showcase_projects = createQueryBuilder({ count: 0, data: [] })
    tableOverrides.tool_releases = createQueryBuilder({ count: 0, data: [] })
    tableOverrides.platform_costs = createQueryBuilder({ data: [] })

    const res = await callStatsEndpoint()
    const body = await res.json()

    expect(body.data.toolsTracked).toBe(0)
    expect(body.data.totalCostCents).toBe(0)
  })
})

// ── /api/v1/pulse ─────────────────────────────────────────────────

describe('GET /api/v1/pulse', () => {
  async function callPulseEndpoint() {
    const mod = await import('@/app/api/v1/pulse/route')
    const request = new Request('https://example.com/api/v1/pulse', {
      headers: { 'x-forwarded-for': '127.0.0.1' },
    })
    return mod.GET(request)
  }

  it('returns pulse content in standard envelope', async () => {
    const content = [
      {
        title: 'Claude Code 1.0.32 Released',
        slug: 'claude-code-1-0-32',
        summary: 'New version of Claude Code',
        published_at: '2026-05-20',
        content_type: 'brief',
        tags: ['claude-code'],
        external_url: null,
      },
    ]
    tableOverrides.content_index = createQueryBuilder({ data: content })

    const res = await callPulseEndpoint()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(1)
    expect(body.data[0].title).toBe('Claude Code 1.0.32 Released')
    expect(body.meta.count).toBe(1)
  })

  it('returns empty array when no pulse content exists', async () => {
    tableOverrides.content_index = createQueryBuilder({ data: [] })

    const res = await callPulseEndpoint()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toEqual([])
    expect(body.meta.count).toBe(0)
  })
})
