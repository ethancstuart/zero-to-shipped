import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { retrieveContext } from '@/lib/assistant/retrieval'
import { assistantLimiter } from '@/lib/rate-limit'
import { getClientIdentifier } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
import { claudeBreaker } from '@/lib/circuit-breaker'
import { log } from '@/lib/logger'

const anthropic = new Anthropic()

const AUTH_DAILY_LIMIT = 10
const ANON_DAILY_LIMIT = 5

type ClaudeResult =
  | { kind: 'ok'; answer: string; tokensUsed: number }
  | { kind: 'error'; error: 'service_unavailable'; message: string }

export async function POST(request: Request) {
  const startTime = Date.now()
  const requestId =
    request.headers.get('x-request-id') || crypto.randomUUID()
  const route = '/api/assistant'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]

  let usageInfo: { used: number; limit: number; resetsAt: string }

  if (user) {
    const { data: usage } = await supabase
      .from('user_ai_usage')
      .select('query_count')
      .eq('user_id', user.id)
      .eq('usage_date', today)
      .maybeSingle()

    const used = usage?.query_count ?? 0

    if (used >= AUTH_DAILY_LIMIT) {
      log('info', 'Assistant query rate limited', {
        requestId,
        route,
        userId: user.id,
        authenticated: true,
        status: 429,
        duration_ms: Date.now() - startTime,
      })
      return NextResponse.json(
        {
          error: 'daily_limit_reached',
          remaining: 0,
          resetsAt: 'midnight UTC',
        },
        { status: 429 },
      )
    }
    usageInfo = { used, limit: AUTH_DAILY_LIMIT, resetsAt: 'midnight UTC' }
  } else {
    const identifier = getClientIdentifier(request)
    const result = await assistantLimiter.limit(`anon:${identifier}:${today}`)
    if (!result.success) {
      log('info', 'Assistant query rate limited', {
        requestId,
        route,
        authenticated: false,
        status: 429,
        duration_ms: Date.now() - startTime,
      })
      return NextResponse.json(
        {
          error: 'daily_limit_reached',
          remaining: 0,
          resetsAt: 'midnight UTC',
        },
        { status: 429 },
      )
    }
    usageInfo = {
      used: Math.max(0, ANON_DAILY_LIMIT - result.remaining),
      limit: ANON_DAILY_LIMIT,
      resetsAt: 'midnight UTC',
    }
  }

  const { query } = await request.json()

  if (!query || typeof query !== 'string') {
    log('info', 'Assistant query rejected', {
      requestId,
      route,
      userId: user?.id,
      authenticated: !!user,
      status: 400,
      duration_ms: Date.now() - startTime,
      reason: 'missing_query',
    })
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }

  if (query.length > 2000) {
    log('info', 'Assistant query rejected', {
      requestId,
      route,
      userId: user?.id,
      authenticated: !!user,
      status: 400,
      duration_ms: Date.now() - startTime,
      reason: 'query_too_long',
    })
    return NextResponse.json({ error: 'Query too long' }, { status: 400 })
  }

  try {
    const context = await retrieveContext(query)

    const contextText = context.vectorResults
      .map(
        (r) =>
          `[Source: ${r.content_slug}${r.heading_path ? ' > ' + r.heading_path : ''}]\n${r.chunk_text}`,
      )
      .join('\n\n---\n\n')

    const claudeResult = await claudeBreaker.execute<ClaudeResult>(
      async () => {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: `You are the Prototype Studio assistant. Answer questions using ONLY the provided context from the platform's content. Always cite your sources using [Source: slug] format. If the context doesn't contain the answer, say so honestly. Be concise and helpful.`,
          messages: [
            {
              role: 'user',
              content: `Context:\n${contextText || 'No relevant context found.'}\n\nQuestion: ${query}`,
            },
          ],
        })
        const answer =
          response.content[0].type === 'text' ? response.content[0].text : ''
        return {
          kind: 'ok',
          answer,
          tokensUsed:
            response.usage.input_tokens + response.usage.output_tokens,
        }
      },
      () => ({
        kind: 'error',
        error: 'service_unavailable',
        message:
          'The assistant is temporarily unavailable. Browse our content directly.',
      }),
    )

    if (claudeResult.kind === 'error') {
      log('warn', 'Assistant unavailable (circuit breaker)', {
        requestId,
        route,
        userId: user?.id,
        authenticated: !!user,
        status: 503,
        duration_ms: Date.now() - startTime,
      })
      return NextResponse.json(
        { error: claudeResult.error, message: claudeResult.message },
        { status: 503 },
      )
    }

    if (user) {
      await supabase.from('user_ai_usage').upsert(
        {
          user_id: user.id,
          usage_date: today,
          query_count: usageInfo.used + 1,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,usage_date',
        },
      )
    }

    log('info', 'Assistant query processed', {
      requestId,
      route,
      userId: user?.id,
      authenticated: !!user,
      status: 200,
      duration_ms: Date.now() - startTime,
      tokensUsed: claudeResult.tokensUsed,
      remaining: Math.max(0, usageInfo.limit - usageInfo.used - 1),
      cached: false,
    })

    return NextResponse.json({
      answer: claudeResult.answer,
      sources: context.sources,
      tokensUsed: claudeResult.tokensUsed,
      usage: {
        remaining: Math.max(0, usageInfo.limit - usageInfo.used - 1),
        limit: usageInfo.limit,
        resetsAt: usageInfo.resetsAt,
      },
    })
  } catch (error) {
    log('error', 'Assistant query failed', {
      requestId,
      route,
      userId: user?.id,
      authenticated: !!user,
      status: 500,
      duration_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Assistant error' },
      { status: 500 },
    )
  }
}
