export interface Benchmark {
  id: string
  slug: string
  task: string
  input_prompt: string
  evaluation_criteria: {
    functional: string[]
    codeQuality: string[]
    designQuality: string[]
  }
  tools_to_test: string[]
  run_frequency: 'weekly' | 'monthly' | 'on_release'
  is_active: boolean
  created_at: string
}

export interface BenchmarkResult {
  id: string
  benchmark_id: string
  tool_id: string
  run_date: string
  output_text: string | null
  scores: {
    functional: number
    codeQuality: number
    designQuality: number
    overall: number
  } | null
  tokens_used: number | null
  cost_cents: number | null
  duration_ms: number | null
  evaluator_notes: string | null
}
