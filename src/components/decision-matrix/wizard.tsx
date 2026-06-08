'use client'

import { useMemo, useState } from 'react'
import { track } from '@vercel/analytics'
import {
  recommendDeep,
  recommendQuick,
  type DeepAnswers,
  type QuickAnswers,
  type Recommendation,
} from '@/lib/decision-matrix'
import { QuestionCard, type QuestionOption } from './question-card'
import { ResultCard } from './result-card'

type Mode = 'quick' | 'deep'

interface WizardProps {
  mode: Mode
  /** Optional initial answers parsed from URL search params (for deep links). */
  initialAnswers?: Partial<DeepAnswers>
}

/* ------------------------------------------------------------------------- */
/*  Question definitions                                                      */
/* ------------------------------------------------------------------------- */

type AnswerKey = keyof DeepAnswers

interface Question {
  key: AnswerKey
  prompt: string
  options: QuestionOption[]
}

const BUILDING_OPTIONS: QuestionOption[] = [
  { value: 'web-app', label: 'A real web app', hint: 'Something with users, a future, a real codebase' },
  { value: 'internal-tool', label: 'An internal tool', hint: 'Dashboard, admin panel, ops thing for the team' },
  { value: 'automation', label: 'An automation or script', hint: 'CLI, cron job, data-cleaning glue code' },
  { value: 'prototype', label: 'A prototype I can show', hint: 'Pitch demo, customer concept, throw-away artifact' },
  { value: 'doc-spec', label: 'A doc or spec', hint: 'PRD, design artifact, something to align around' },
]

const COMFORT_OPTIONS: QuestionOption[] = [
  { value: 'terminal-scary', label: 'Terminals scare me', hint: 'I want a UI. Black screen with a blinking cursor = nope.' },
  { value: 'can-install', label: 'I can install things', hint: 'I can follow instructions and run a command if I have to.' },
  { value: 'terminal-native', label: 'Terminal is home', hint: 'I live in the CLI and prefer it to a GUI for most things.' },
]

const PREFERENCE_OPTIONS: QuestionOption[] = [
  { value: 'just-done', label: 'I just want it done', hint: 'Fastest path from idea to thing that works.' },
  { value: 'learn-craft', label: 'I want to learn the craft', hint: 'Investing in skill — the tool should make me better over time.' },
]

const OUTPUT_OPTIONS: QuestionOption[] = [
  { value: 'code-i-read', label: 'Code I can read and review', hint: 'Diffs, files, PRs. I want to understand what shipped.' },
  { value: 'just-works', label: 'Something that just works', hint: 'I care about the outcome more than the underlying code.' },
  { value: 'visual-ui', label: 'A polished visual UI', hint: 'Buttons, layouts, screens — pretty matters.' },
]

const SIZE_OPTIONS: QuestionOption[] = [
  { value: 'quick-prototype', label: 'A quick prototype', hint: "Days of work. I'll probably throw it away." },
  { value: 'production-app', label: 'A production app', hint: 'Weeks to months. Real users at the end.' },
  { value: 'long-term', label: 'A long-term codebase', hint: "Years. I'll live in this code for a while." },
]

const BUDGET_OPTIONS: QuestionOption[] = [
  { value: 'free-only', label: 'Free only', hint: 'No card on file. I want to start without paying.' },
  { value: 'pay-per-token', label: 'Pay per token / usage', hint: "I'm fine with metered billing if the tool earns it." },
  { value: 'subscription-ok', label: "Subscription's fine", hint: '$20-30/mo flat? Sure, if it saves me hours.' },
]

const TEAM_OPTIONS: QuestionOption[] = [
  { value: 'solo', label: 'Solo', hint: 'Just me. No one else needs to read my output.' },
  { value: 'small-team', label: 'Small team', hint: '2-5 people, mixed skills, no formal review process.' },
  { value: 'with-engineers', label: 'With engineers', hint: 'Real engineers will review what I ship — diffs matter.' },
]

const QUICK_QUESTIONS: Question[] = [
  { key: 'building', prompt: "What are you building?", options: BUILDING_OPTIONS },
  { key: 'comfort', prompt: 'How comfortable are you with developer tools?', options: COMFORT_OPTIONS },
  { key: 'preference', prompt: 'What matters more to you?', options: PREFERENCE_OPTIONS },
]

const DEEP_QUESTIONS: Question[] = [
  ...QUICK_QUESTIONS,
  { key: 'output', prompt: 'What kind of output do you want?', options: OUTPUT_OPTIONS },
  { key: 'size', prompt: 'How big is this project?', options: SIZE_OPTIONS },
  { key: 'budget', prompt: 'What about budget?', options: BUDGET_OPTIONS },
  { key: 'team', prompt: "Who's going to see this code?", options: TEAM_OPTIONS },
]

/* ------------------------------------------------------------------------- */
/*  Wizard component                                                          */
/* ------------------------------------------------------------------------- */

export function Wizard({ mode, initialAnswers }: WizardProps) {
  const questions = useMemo(
    () => (mode === 'quick' ? QUICK_QUESTIONS : DEEP_QUESTIONS),
    [mode],
  )

  const [answers, setAnswers] = useState<Partial<DeepAnswers>>(initialAnswers ?? {})
  const [index, setIndex] = useState(0)
  // If we got a full initial answer set via deep link, jump straight to result.
  const [showResult, setShowResult] = useState(() => {
    if (!initialAnswers) return false
    return questions.every((q) => initialAnswers[q.key] !== undefined)
  })

  const current = questions[index]
  const isLast = index === questions.length - 1
  const canAdvance = answers[current.key] !== undefined

  function handleSelect(value: string) {
    setAnswers((prev) => ({ ...prev, [current.key]: value }))
  }

  function handleNext() {
    if (!canAdvance) return
    if (isLast) {
      submit()
    } else {
      setIndex((i) => i + 1)
    }
  }

  function handleBack() {
    if (index === 0) return
    setIndex((i) => i - 1)
  }

  function submit() {
    setShowResult(true)
    try {
      const rec = computeRecommendation()
      track('wizard_complete', {
        mode,
        recommended_tool: rec.primary.slug,
      })
    } catch {
      // Analytics failures should never block the result.
    }
  }

  function computeRecommendation(): Recommendation {
    if (mode === 'quick') {
      return recommendQuick(answers as QuickAnswers)
    }
    return recommendDeep(answers as DeepAnswers)
  }

  function restart() {
    setAnswers({})
    setIndex(0)
    setShowResult(false)
  }

  function buildShareUrl(): string {
    const params = new URLSearchParams()
    for (const q of questions) {
      const value = answers[q.key]
      if (value) params.set(q.key, value)
    }
    const base = mode === 'quick' ? '/which-tool' : '/which-tool/advanced'
    return `${base}?${params.toString()}`
  }

  if (showResult) {
    const recommendation = computeRecommendation()
    return (
      <div className="rounded-2xl border border-[hsl(var(--border-base))] bg-[hsl(var(--bg))] p-8 sm:p-12">
        <ResultCard
          recommendation={recommendation}
          shareUrl={buildShareUrl()}
          onRestart={restart}
        />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border-base))] bg-[hsl(var(--bg))] p-8 sm:p-12">
      <QuestionCard
        questionNumber={index + 1}
        totalQuestions={questions.length}
        prompt={current.prompt}
        options={current.options}
        selected={answers[current.key]}
        onSelect={handleSelect}
      />

      <div className="mt-8 flex items-center justify-between border-t border-[hsl(var(--border-base))] pt-6">
        <button
          type="button"
          onClick={handleBack}
          disabled={index === 0}
          className="text-xs text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))] underline underline-offset-4 disabled:opacity-30 disabled:cursor-not-allowed disabled:no-underline"
        >
          &larr; Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canAdvance}
          className="rounded-full bg-[hsl(var(--fg))] text-[hsl(var(--bg))] px-6 py-2.5 text-xs transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isLast ? 'Get my recommendation' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------- */
/*  Helper: parse search params into answers (server-side friendly)           */
/* ------------------------------------------------------------------------- */

export function parseAnswersFromSearchParams(
  raw: Record<string, string | string[] | undefined>,
): Partial<DeepAnswers> {
  const keys: AnswerKey[] = ['building', 'comfort', 'preference', 'output', 'size', 'budget', 'team']
  const out: Partial<DeepAnswers> = {}
  for (const k of keys) {
    const v = raw[k]
    if (typeof v === 'string') {
      // Cast — the wizard will only render UI for valid values; bad ones
      // simply produce no recommendation and the user has to re-pick.
      ;(out as Record<string, string>)[k] = v
    }
  }
  return out
}
