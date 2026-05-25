import { createClient } from '@supabase/supabase-js'
import { watcherAgent } from './agents/watcher'
import { analystAgent } from './agents/analyst'
import { writerAgent } from './agents/writer'
import { factCheckerAgent } from './agents/fact-checker'
import { publisherAgent } from './agents/publisher'
import type { AgentDefinition, AgentInput, AgentOutput } from './agents/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const PIPELINE_STEPS: { agent: AgentDefinition; order: number }[] = [
  { agent: watcherAgent, order: 1 },
  { agent: analystAgent, order: 2 },
  { agent: writerAgent, order: 3 },
  { agent: factCheckerAgent, order: 4 },
  { agent: publisherAgent, order: 5 },
]

export async function runPipeline(
  triggerType: 'release_detected' | 'manual' | 'scheduled',
  triggerData: Record<string, unknown>,
) {
  const { data: run, error: runError } = await supabase
    .from('pipeline_runs')
    .insert({ trigger_type: triggerType, trigger_data: triggerData })
    .select()
    .single()

  if (runError || !run) throw new Error(`Failed to create pipeline run: ${runError?.message}`)

  let currentInput: AgentInput = { ...triggerData }
  let totalTokens = 0
  let totalCost = 0

  for (const { agent, order } of PIPELINE_STEPS) {
    const { data: step } = await supabase
      .from('pipeline_steps')
      .insert({
        run_id: run.id,
        step_order: order,
        agent_role: agent.role,
        status: 'running',
        input_summary: JSON.stringify(currentInput).slice(0, 1000),
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    const startTime = Date.now()

    try {
      const output: AgentOutput = await agent.execute(currentInput)

      const durationMs = Date.now() - startTime
      totalTokens += output.tokensUsed
      const stepCost = Math.ceil(output.tokensUsed * 0.003)
      totalCost += stepCost

      await supabase
        .from('pipeline_steps')
        .update({
          status: 'completed',
          output_summary: output.summary,
          full_transcript: output.data,
          tokens_used: output.tokensUsed,
          cost_cents: stepCost,
          duration_ms: durationMs,
          completed_at: new Date().toISOString(),
        })
        .eq('id', step!.id)

      currentInput = { ...currentInput, ...output.data, previousStep: agent.role }
    } catch (error) {
      const durationMs = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      await supabase
        .from('pipeline_steps')
        .update({
          status: 'failed',
          error_message: errorMessage,
          duration_ms: durationMs,
          completed_at: new Date().toISOString(),
        })
        .eq('id', step!.id)

      await supabase
        .from('pipeline_runs')
        .update({
          status: 'failed',
          total_tokens: totalTokens,
          total_cost_cents: totalCost,
          completed_at: new Date().toISOString(),
        })
        .eq('id', run.id)

      return { runId: run.id, status: 'failed', error: errorMessage, step: agent.role }
    }
  }

  await supabase
    .from('pipeline_runs')
    .update({
      status: 'completed',
      total_tokens: totalTokens,
      total_cost_cents: totalCost,
      completed_at: new Date().toISOString(),
    })
    .eq('id', run.id)

  return { runId: run.id, status: 'completed', totalTokens, totalCost }
}
