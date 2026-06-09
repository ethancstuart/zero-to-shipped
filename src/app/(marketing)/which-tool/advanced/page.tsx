import Link from 'next/link'
import type { Metadata } from 'next'
import { Wizard } from '@/components/decision-matrix/wizard'
import { parseAnswersFromSearchParams } from '@/lib/decision-matrix'

export const metadata: Metadata = {
  title: 'Which AI coding tool? — Deep version — Prototype Studio',
  description:
    "Tell me about your situation in detail. Seven questions, calibrated answer.",
  openGraph: {
    title: 'Which AI coding tool should I use? — Deep version',
    description: '7 questions, a more nuanced recommendation.',
  },
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function WhichToolAdvancedPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const initialAnswers = parseAnswersFromSearchParams(sp)

  return (
    <main className="mx-auto max-w-3xl px-6 pt-24 pb-24 sm:pt-32">
      <div className="mb-12 flex flex-col gap-5">
        <span className="font-mono-data text-[10px] tracking-wider uppercase text-[hsl(var(--pillar-system))]">
          Decision wizard / deep
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-[hsl(var(--fg))] leading-tight">
          Tell me about your situation in detail.
        </h1>
        <p className="text-lg text-[hsl(var(--fg-secondary))] max-w-xl leading-relaxed">
          Seven questions, calibrated answer. Trade-offs matter here — budget, team, project
          horizon, what kind of output you actually want.
        </p>
      </div>

      <Wizard mode="deep" initialAnswers={initialAnswers} />

      <div className="mt-10 flex items-center justify-between text-sm border-t border-[hsl(var(--border-base))] pt-6">
        <Link
          href="/which-tool"
          className="text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))] underline underline-offset-4"
        >
          &larr; Back to the quick version (3 questions)
        </Link>
      </div>
    </main>
  )
}
