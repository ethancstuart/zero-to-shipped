import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { retrieveContext } from '@/lib/assistant/retrieval'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  const { query } = await request.json()

  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }

  if (query.length > 2000) {
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

    return NextResponse.json({
      answer,
      sources: context.sources,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Assistant error' },
      { status: 500 },
    )
  }
}
