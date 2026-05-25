import { NextResponse } from 'next/server'

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
