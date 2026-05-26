'use client'

import { GenerativeMesh } from './generative-mesh'
import { CursorSpotlight } from './cursor-spotlight'
import { WordReveal } from './word-reveal'
import { MagneticButton } from '@/components/shared/magnetic-button'

/* -----------------------------------------------------------------------
   Hero copy config
   ----------------------------------------------------------------------- */
const heroLines = [
  { words: ['Build', 'Real'] },
  { words: ['Products.'], className: 'font-semibold' },
  { words: ['With', 'AI.'], className: 'text-[hsl(var(--fg-faint))]' },
]

/* -----------------------------------------------------------------------
   Sub-components
   ----------------------------------------------------------------------- */

function MetaDot({ color, label }: { color: 'blue' | 'green' | 'purple'; label: string }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    purple: 'bg-purple-500',
  }

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${colors[color]}`}
        />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${colors[color]}`} />
      </span>
      <span className="font-mono-data text-[11px] tracking-wider text-[hsl(var(--fg-muted))]">
        {label}
      </span>
    </div>
  )
}

function ScrollIndicator() {
  return (
    <div className="absolute bottom-12 right-6 lg:right-12 flex flex-col items-center gap-3 opacity-0 animate-[fadeUp_0.6s_ease-out_2s_forwards]">
      <span className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--fg-faint))]">
        scroll
      </span>
      <div className="relative h-8 w-px overflow-hidden bg-[hsl(var(--border-base))]">
        <div className="absolute top-0 left-0 h-full w-full animate-[scrollLine_1.5s_ease-in-out_infinite] bg-[hsl(var(--fg-muted))]" />
      </div>
    </div>
  )
}

/* -----------------------------------------------------------------------
   HeroSection
   ----------------------------------------------------------------------- */

export function HeroSection() {
  return (
    <section
      className="relative flex min-h-screen flex-col justify-center px-6 pt-40 pb-20 lg:px-12"
      style={{ maxWidth: '1300px', margin: '0 auto' }}
    >
      <GenerativeMesh />
      <CursorSpotlight />

      {/* Comment syntax */}
      <div className="font-mono-data text-[11px] tracking-wider text-[hsl(var(--fg-faint))] mb-12 opacity-0 animate-[fadeUp_0.8s_ease-out_0.2s_forwards]">
        {'// prototype.studio'}
      </div>

      {/* Headline */}
      <WordReveal lines={heroLines} />

      {/* Subtitle */}
      <p className="max-w-[500px] text-[17px] leading-relaxed text-[hsl(var(--fg-secondary))] mt-10 mb-12 opacity-0 animate-[fadeUp_0.8s_ease-out_1.3s_forwards]">
        The AI prototyping platform for PMs, analysts, and builders who want to
        ship — not just prompt.
      </p>

      {/* CTA row */}
      <div className="flex gap-4 opacity-0 animate-[fadeUp_0.8s_ease-out_1.5s_forwards]">
        <MagneticButton href="#start-here" variant="primary">
          Start building
        </MagneticButton>
        <MagneticButton href="/pulse" variant="secondary">
          Explore the platform
        </MagneticButton>
      </div>

      {/* Bottom meta */}
      <div className="absolute bottom-12 left-6 lg:left-12 flex gap-7 opacity-0 animate-[fadeUp_0.6s_ease-out_1.8s_forwards]">
        <MetaDot color="blue" label="9 tools tracked" />
        <MetaDot color="green" label="37 resources" />
        <MetaDot color="purple" label="free" />
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  )
}
