import Link from 'next/link'
import { listContentByPillar, listAllContent } from '@/lib/content/loader'
import { PillarSection } from '@/components/marketing/pillar-section'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prototype Studio — Build Real Products with AI',
  description: 'Learn to build real products with AI. Watch sessions. Follow guides. Set up your own agent system.',
}

export default async function HomePage() {
  const [pulseItems, buildItems, learnItems, systemItems, allItems] = await Promise.all([
    listContentByPillar('pulse', { limit: 3 }),
    listContentByPillar('build', { limit: 3 }),
    listContentByPillar('learn', { featured: true, limit: 3 }),
    listContentByPillar('system', { limit: 3 }),
    listAllContent(),
  ])

  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="py-24 text-center">
        <h1 className="mx-auto mb-6 max-w-3xl text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Build real products with AI
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg text-white/50">
          Watch sessions. Follow guides. Set up your own agent system.
          Everything you need to go from idea to shipped product.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/learn" className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90">
            Start learning
          </Link>
          <Link href="/pulse" className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5">
            See what&apos;s new
          </Link>
        </div>
      </section>

      <section className="mb-20 grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-6 sm:grid-cols-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">9</div>
          <div className="text-xs text-white/40">AI tools tracked</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{allItems.length}</div>
          <div className="text-xs text-white/40">resources</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">4</div>
          <div className="text-xs text-white/40">content pillars</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">Free</div>
          <div className="text-xs text-white/40">to start</div>
        </div>
      </section>

      <PillarSection title="Pulse" description="What's happening across AI coding tools" href="/pulse" items={pulseItems} />
      <PillarSection title="Build" description="Watch someone take an idea to a working app" href="/build" items={buildItems} />
      <PillarSection title="Learn" description="Pick up the skills you need" href="/learn" items={learnItems} />
      <PillarSection title="System" description="Set up AI agents as your operating system" href="/system" items={systemItems} />
    </div>
  )
}
