import type { PipelineStep } from '@/types/tools'

interface StepDetailProps {
  step: PipelineStep
}

const roleLabels: Record<string, string> = {
  watcher: 'Watcher',
  analyst: 'Analyst',
  writer: 'Writer',
  fact_checker: 'Fact-Checker',
  publisher: 'Publisher',
}

const stepStatusColors = {
  pending: 'text-white/30',
  running: 'text-yellow-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
  skipped: 'text-white/20',
} as const

export function StepDetail({ step }: StepDetailProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.01] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="w-6 text-center text-xs text-white/20">{step.step_order}</span>
        <span className="text-sm font-medium text-white/80">
          {roleLabels[step.agent_role] || step.agent_role}
        </span>
        <span className={`text-xs ${stepStatusColors[step.status]}`}>
          {step.status === 'completed' ? '✓' : step.status === 'failed' ? '✗' : step.status === 'running' ? '◉' : '○'}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs text-white/30">
        {step.output_summary && (
          <span className="max-w-xs truncate text-white/50" title={step.output_summary}>
            {step.output_summary}
          </span>
        )}
        {step.error_message && (
          <span className="max-w-xs truncate text-red-400/70" title={step.error_message}>
            {step.error_message}
          </span>
        )}
        {step.duration_ms && <span>{(step.duration_ms / 1000).toFixed(1)}s</span>}
        {step.tokens_used > 0 && <span>{step.tokens_used.toLocaleString()} tok</span>}
      </div>
    </div>
  )
}
