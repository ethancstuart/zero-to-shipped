import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface RunResult {
  toolSlug: string
  toolId: string
  output: string
  tokensUsed: number
  durationMs: number
}

export async function runBenchmarkForTool(
  prompt: string,
  toolSlug: string,
  toolId: string,
): Promise<RunResult> {
  const start = Date.now()

  // For now, all benchmarks run through Claude API
  // In the future, this can dispatch to Gemini/OpenAI based on toolSlug
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const output = response.content[0].type === 'text' ? response.content[0].text : ''
  const tokensUsed = response.usage.input_tokens + response.usage.output_tokens
  const durationMs = Date.now() - start

  return { toolSlug, toolId, output, tokensUsed, durationMs }
}

export async function runBenchmark(benchmarkId: string) {
  const { data: benchmark } = await supabase
    .from('benchmarks')
    .select('*')
    .eq('id', benchmarkId)
    .single()

  if (!benchmark) throw new Error('Benchmark not found')

  const results: RunResult[] = []

  for (const toolSlug of benchmark.tools_to_test || []) {
    const { data: tool } = await supabase
      .from('tools')
      .select('id')
      .eq('slug', toolSlug)
      .single()

    if (!tool) continue

    try {
      const result = await runBenchmarkForTool(benchmark.input_prompt, toolSlug, tool.id)
      results.push(result)
    } catch (error) {
      console.error(`Benchmark failed for ${toolSlug}:`, error)
    }
  }

  return { benchmark, results }
}
