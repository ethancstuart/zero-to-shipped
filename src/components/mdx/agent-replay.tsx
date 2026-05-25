'use client'

import { useState } from 'react'

interface ReplayStep {
  stepNumber: number
  type: 'prompt' | 'reasoning' | 'tool_call' | 'output' | 'decision'
  content: string
  metadata?: {
    toolName?: string
    filesChanged?: string[]
    durationMs?: number
  }
  annotation?: string
}

interface AgentReplayProps {
  steps: ReplayStep[]
  title: string
  agentRole: string
}

const typeColors = {
  prompt: 'border-blue-500/30 bg-blue-500/5',
  reasoning: 'border-purple-500/30 bg-purple-500/5',
  tool_call: 'border-yellow-500/30 bg-yellow-500/5',
  output: 'border-green-500/30 bg-green-500/5',
  decision: 'border-red-500/30 bg-red-500/5',
}

export function AgentReplay({ steps, title, agentRole }: AgentReplayProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  return (
    <div className="my-8 rounded-xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-sm text-white/40">Agent: {agentRole}</span>
      </div>
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.stepNumber}
            className={`rounded-lg border ${typeColors[step.type]} transition-all`}
          >
            <button
              onClick={() =>
                setExpandedStep(
                  expandedStep === step.stepNumber ? null : step.stepNumber,
                )
              }
              className="flex w-full items-center justify-between p-3 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-white/30">
                  {step.stepNumber}
                </span>
                <span className="rounded px-1.5 py-0.5 text-xs font-medium uppercase text-white/60">
                  {step.type.replace('_', ' ')}
                </span>
                <span className="text-sm text-white/80">
                  {step.content.slice(0, 100)}
                  {step.content.length > 100 ? '...' : ''}
                </span>
              </div>
              <span className="text-white/30">
                {expandedStep === step.stepNumber ? '−' : '+'}
              </span>
            </button>
            {expandedStep === step.stepNumber && (
              <div className="border-t border-white/5 p-4">
                <pre className="mb-3 whitespace-pre-wrap text-sm text-white/70">
                  {step.content}
                </pre>
                {step.metadata && (
                  <div className="mb-3 flex gap-4 text-xs text-white/40">
                    {step.metadata.toolName && <span>Tool: {step.metadata.toolName}</span>}
                    {step.metadata.durationMs && <span>{step.metadata.durationMs}ms</span>}
                    {step.metadata.filesChanged && (
                      <span>{step.metadata.filesChanged.length} files changed</span>
                    )}
                  </div>
                )}
                {step.annotation && (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/50">
                    <span className="font-medium text-white/70">Note: </span>
                    {step.annotation}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
