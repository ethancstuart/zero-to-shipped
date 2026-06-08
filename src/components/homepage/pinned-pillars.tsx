'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import { useCounter } from '@/lib/use-counter'
import { PillarCard } from '@/components/content/pillar-card'
import { cn } from '@/lib/utils'

type PillarName = 'pulse' | 'build' | 'learn' | 'system'

export interface PillarData {
  name: PillarName
  title: string
  description: string
  stats: { value: number; label: string }[]
}

interface PinnedPillarsProps {
  pillarData: PillarData[]
}

const pillarColors: Record<PillarName, { text: string; surface: string; border: string; dot: string }> = {
  pulse: {
    text: 'text-[hsl(var(--pillar-pulse))]',
    surface: 'bg-[hsl(var(--pillar-pulse-surface))]',
    border: 'border-[hsl(var(--pillar-pulse-border))]',
    dot: 'bg-[hsl(var(--pillar-pulse))]',
  },
  build: {
    text: 'text-[hsl(var(--pillar-build))]',
    surface: 'bg-[hsl(var(--pillar-build-surface))]',
    border: 'border-[hsl(var(--pillar-build-border))]',
    dot: 'bg-[hsl(var(--pillar-build))]',
  },
  learn: {
    text: 'text-[hsl(var(--pillar-learn))]',
    surface: 'bg-[hsl(var(--pillar-learn-surface))]',
    border: 'border-[hsl(var(--pillar-learn-border))]',
    dot: 'bg-[hsl(var(--pillar-learn))]',
  },
  system: {
    text: 'text-[hsl(var(--pillar-system))]',
    surface: 'bg-[hsl(var(--pillar-system-surface))]',
    border: 'border-[hsl(var(--pillar-system-border))]',
    dot: 'bg-[hsl(var(--pillar-system))]',
  },
}

function StatValue({ value, label }: { value: number; label: string }) {
  const { ref, display } = useCounter(value)
  return (
    <div className="text-center">
      <div ref={ref} className="font-display text-3xl font-light tracking-tight text-[hsl(var(--fg))]">
        {display}
      </div>
      <div className="font-mono-data text-[10px] text-[hsl(var(--fg-muted))] mt-1">{label}</div>
    </div>
  )
}

function DesktopPinnedPillars({ pillarData }: PinnedPillarsProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!sectionRef.current || !innerRef.current) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      pin: innerRef.current,
      onUpdate: (self) => {
        const newIndex = Math.min(3, Math.floor(self.progress * 4))
        setCurrentIndex((prev) => {
          if (newIndex !== prev) return newIndex
          return prev
        })
      },
    })

    return () => {
      trigger.kill()
    }
  }, [])

  const active = pillarData[currentIndex]
  const colors = active ? pillarColors[active.name] : pillarColors.pulse

  return (
    <section ref={sectionRef} className="relative" style={{ height: '400vh' }}>
      <div
        ref={innerRef}
        className="flex h-screen items-center"
        style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 clamp(1.5rem, 3vw, 3rem)' }}
      >
        {/* Left side — tab labels */}
        <div className="flex flex-col gap-2 w-[220px] shrink-0">
          {pillarData.map((pillar, i) => {
            const isActive = i === currentIndex
            const pc = pillarColors[pillar.name]
            return (
              <button
                key={pillar.name}
                onClick={() => {
                  if (!sectionRef.current) return
                  const rect = sectionRef.current.getBoundingClientRect()
                  const sectionTop = window.scrollY + rect.top
                  const sectionHeight = rect.height
                  const targetScroll = sectionTop + (i / 4) * sectionHeight + 1
                  window.scrollTo({ top: targetScroll, behavior: 'smooth' })
                }}
                className={cn(
                  'text-left px-5 py-3 border-l-2 transition-all duration-300',
                  isActive
                    ? `${pc.text} border-current font-medium`
                    : 'text-[hsl(var(--fg-muted))] border-transparent hover:text-[hsl(var(--fg-secondary))]'
                )}
              >
                <span className="text-[10px] uppercase tracking-[2px] font-medium">{pillar.name}</span>
                <span className="block text-sm mt-0.5 text-[hsl(var(--fg-secondary))]">{pillar.title}</span>
              </button>
            )
          })}
        </div>

        {/* Right side — detail card */}
        {active && (
          <div
            className={cn(
              'flex-1 ml-12 rounded-2xl border p-10 transition-all duration-500',
              colors.surface,
              colors.border
            )}
          >
            <div className={cn('text-[10px] uppercase tracking-[2px] font-medium mb-4', colors.text)}>
              {active.name}
            </div>
            <h3 className="text-h1 mb-3">{active.title}</h3>
            <p className="text-[hsl(var(--fg-secondary))] text-base leading-relaxed max-w-lg mb-10">
              {active.description}
            </p>
            <div className="flex gap-12">
              {active.stats.map((stat) => (
                <StatValue key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        )}

        {/* Progress dots — right edge */}
        <div className="ml-8 flex flex-col gap-3">
          {pillarData.map((pillar, i) => {
            const pc = pillarColors[pillar.name]
            return (
              <div
                key={pillar.name}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  i === currentIndex ? pc.dot : 'bg-[hsl(var(--border-base))]'
                )}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

function MobilePillars({ pillarData }: PinnedPillarsProps) {
  return (
    <section className="px-6 py-20">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 max-w-[1300px] mx-auto">
        {pillarData.map((pillar) => (
          <PillarCard
            key={pillar.name}
            pillar={pillar.name}
            title={pillar.title}
            description={pillar.description}
            count={pillar.stats.map((s) => `${s.value} ${s.label}`).join(' · ')}
          />
        ))}
      </div>
    </section>
  )
}

function getIsMobileOrReduced(): boolean {
  if (window.innerWidth < 1024) return true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  return false
}

function getIsMobileServer(): boolean {
  return true // SSR fallback renders mobile
}

function subscribeResize(callback: () => void): () => void {
  window.addEventListener('resize', callback)
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', callback)
  return () => {
    window.removeEventListener('resize', callback)
    mq.removeEventListener('change', callback)
  }
}

export function PinnedPillars({ pillarData }: PinnedPillarsProps) {
  const isMobile = useSyncExternalStore(subscribeResize, getIsMobileOrReduced, getIsMobileServer)

  return isMobile ? (
    <MobilePillars pillarData={pillarData} />
  ) : (
    <DesktopPinnedPillars pillarData={pillarData} />
  )
}
