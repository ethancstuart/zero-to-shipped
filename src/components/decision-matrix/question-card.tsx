'use client'

import { cn } from '@/lib/utils'

export interface QuestionOption {
  value: string
  label: string
  hint?: string
}

interface QuestionCardProps {
  questionNumber: number
  totalQuestions: number
  prompt: string
  options: QuestionOption[]
  selected: string | undefined
  onSelect: (value: string) => void
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  prompt,
  options,
  selected,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="font-mono-data text-[10px] tracking-wider text-[hsl(var(--fg-faint))] uppercase">
          {questionNumber} of {totalQuestions}
        </span>
        <div className="flex-1 h-px bg-[hsl(var(--border-base))]">
          <div
            className="h-px bg-[hsl(var(--pillar-system))] transition-all duration-500"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="font-display text-2xl sm:text-3xl font-light tracking-tight text-[hsl(var(--fg))]">
        {prompt}
      </h2>

      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const isSelected = selected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={cn(
                'group rounded-xl border px-5 py-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pillar-system))]',
                isSelected
                  ? 'border-[hsl(var(--pillar-system))] bg-[hsl(var(--pillar-system-surface))]'
                  : 'border-[hsl(var(--border-base))] hover:border-[hsl(var(--border-strong))] hover:bg-[hsl(var(--bg-muted))]',
              )}
              aria-pressed={isSelected}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-1 inline-block h-3 w-3 shrink-0 rounded-full border-2 transition-colors',
                    isSelected
                      ? 'border-[hsl(var(--pillar-system))] bg-[hsl(var(--pillar-system))]'
                      : 'border-[hsl(var(--border-strong))] group-hover:border-[hsl(var(--fg-muted))]',
                  )}
                  aria-hidden
                />
                <div className="flex-1">
                  <div
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isSelected ? 'text-[hsl(var(--fg))]' : 'text-[hsl(var(--fg-secondary))]',
                    )}
                  >
                    {opt.label}
                  </div>
                  {opt.hint && (
                    <div className="mt-1 text-xs text-[hsl(var(--fg-muted))]">{opt.hint}</div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
