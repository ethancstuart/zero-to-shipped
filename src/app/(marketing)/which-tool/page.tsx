import Link from 'next/link'
import type { Metadata } from 'next'
import { Wizard, parseAnswersFromSearchParams } from '@/components/decision-matrix/wizard'

export const metadata: Metadata = {
  title: 'Which AI coding tool? — Prototype Studio',
  description:
    "Not sure which AI coding tool to use? Three questions, then I'll tell you what I'd reach for.",
  openGraph: {
    title: 'Which AI coding tool should I use?',
    description: '3 questions, instant recommendation.',
  },
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function WhichToolPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const initialAnswers = parseAnswersFromSearchParams(sp)

  return (
    <main className="mx-auto max-w-3xl px-6 pt-24 pb-24 sm:pt-32">
      <div className="mb-12 flex flex-col gap-5">
        <span className="font-mono-data text-[10px] tracking-wider uppercase text-[hsl(var(--pillar-system))]">
          Decision wizard / quick
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tight text-[hsl(var(--fg))] leading-tight">
          Not sure which tool to use?
        </h1>
        <p className="text-lg text-[hsl(var(--fg-secondary))] max-w-xl leading-relaxed">
          Three questions, then I&rsquo;ll tell you what I&rsquo;d reach for. The right answer
          depends on your situation — that&rsquo;s the whole point.
        </p>
      </div>

      <Wizard mode="quick" initialAnswers={initialAnswers} />

      <div className="mt-10 flex items-center justify-between text-sm border-t border-[hsl(var(--border-base))] pt-6">
        <Link
          href="/which-tool/advanced"
          className="text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))] underline underline-offset-4"
        >
          Want more nuanced recommendations? Try the deep version &rarr;
        </Link>
      </div>
    </main>
  )
}
