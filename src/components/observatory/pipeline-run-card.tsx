import { StepDetail } from './step-detail'
import type { PipelineRun } from '@/types/tools'

interface PipelineRunCardProps {
  run: PipelineRun
}

const statusColors = {
  running: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  completed: 'border-green-500/30 bg-green-500/10 text-green-400',
  failed: 'border-red-500/30 bg-red-500/10 text-red-400',
  needs_review: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
} as const

export function PipelineRunCard({ run }: PipelineRunCardProps) {
  const steps = (run.pipeline_steps || []).sort((a, b) => a.step_order - b.step_order)
  const triggerLabel = run.trigger_data
    ? `${(run.trigger_data as { toolName?: string; version?: string }).toolName || 'Unknown'} ${(run.trigger_data as { toolName?: string; version?: string }).version || ''}`
    : run.trigger_type

  return (
    <div className="rounded-xl border border-[hsl(var(--border-base))] bg-[hsl(var(--bg-subtle))] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusColors[run.status]}`}>
            {run.status}
          </span>
          <span className="text-sm font-medium text-[hsl(var(--fg))]">{triggerLabel}</span>
          <span className="rounded-full border border-[hsl(var(--border-base))] px-2 py-0.5 text-xs text-[hsl(var(--fg-faint))]">
            {run.trigger_type}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[hsl(var(--fg-muted))]">
          {run.total_tokens > 0 && <span>{run.total_tokens.toLocaleString()} tokens</span>}
          {run.total_cost_cents > 0 && <span>${(run.total_cost_cents / 100).toFixed(2)}</span>}
          <span>{new Date(run.started_at).toLocaleString()}</span>
        </div>
      </div>

      {steps.length > 0 && (
        <div className="space-y-2">
          {steps.map((step) => (
            <StepDetail key={step.id} step={step} />
          ))}
        </div>
      )}
    </div>
  )
}
