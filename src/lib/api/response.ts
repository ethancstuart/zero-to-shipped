import { NextResponse } from 'next/server'
import { apiLimiter } from '@/lib/rate-limit'

/**
 * Extract a stable identifier (client IP) from the request for rate limiting.
 */
export function getClientIdentifier(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous'
  )
}

/**
 * Apply the public-API rate limit (Upstash + in-memory fallback) to a request.
 * Returns either a 429 NextResponse to short-circuit the route, or rate-limit
 * metadata for inclusion in a successful response.
 */
export async function applyApiRateLimit(
  request: Request,
): Promise<
  | { response: NextResponse; remaining?: never }
  | { response?: never; remaining: number; limit: number; reset: number }
> {
  const identifier = getClientIdentifier(request)
  const result = await apiLimiter.limit(identifier)
  if (!result.success) {
    return {
      response: NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(result.reset),
          },
        },
      ),
    }
  }
  return {
    remaining: result.remaining,
    limit: result.limit,
    reset: result.reset,
  }
}

export function apiResponse(data: unknown, meta?: Record<string, unknown>) {
  return NextResponse.json(
    {
      data,
      meta: {
        generatedAt: new Date().toISOString(),
        apiVersion: 'v1',
        ...meta,
      },
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    },
  )
}

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}
