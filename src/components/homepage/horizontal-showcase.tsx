'use client'

import { useRef, useCallback } from 'react'
import { Pill } from '@/components/shared/pill'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { cn } from '@/lib/utils'

const showcaseItems = [
  {
    title: 'Meridian Intelligence',
    description: 'Non-QM lending intelligence platform. 34 features, production sprint.',
    tool: 'Claude Code',
    buildTime: '4 weeks',
    gradient: 'from-[#eff6ff] to-[#e0ecff]',
    gradientDark: 'dark:from-[#0c1929] dark:to-[#0f1f3a]',
  },
  {
    title: 'RidgeCap Capital',
    description: 'CRE investment platform with deal flow, billing, and analytics.',
    tool: 'Claude Code',
    buildTime: '3 weeks',
    gradient: 'from-[#f0fdf4] to-[#d1fae5]',
    gradientDark: 'dark:from-[#091f13] dark:to-[#0c2919]',
  },
  {
    title: 'NexusWatch',
    description: 'Geopolitical intelligence platform. 45+ layers, AI analysis, globe.',
    tool: 'Claude Code',
    buildTime: '6 weeks',
    gradient: 'from-[#faf5ff] to-[#ede5ff]',
    gradientDark: 'dark:from-[#150f22] dark:to-[#1a1230]',
  },
  {
    title: 'LongTable',
    description: 'AI-powered travel planning with booking engine and cost optimization.',
    tool: 'Claude Code',
    buildTime: '2 weeks',
    gradient: 'from-[#fffbeb] to-[#fde68a]',
    gradientDark: 'dark:from-[#1a1608] dark:to-[#2a2210]',
  },
]

const CARD_WIDTH_DESKTOP = 380
const CARD_WIDTH_MOBILE = 280
const CARD_GAP = 20

export function HorizontalShowcase() {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollByCard = useCallback((direction: 1 | -1) => {
    if (!trackRef.current) return
    const cardWidth = window.innerWidth < 640 ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP
    trackRef.current.scrollBy({
      left: direction * (cardWidth + CARD_GAP),
      behavior: 'smooth',
    })
  }, [])

  return (
    <section className="relative py-10 pb-20">
      {/* Arrow buttons — hidden on mobile */}
      <button
        onClick={() => scrollByCard(-1)}
        className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-[hsl(var(--bg))] border border-[hsl(var(--border-base))] text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))] hover:border-[hsl(var(--border-hover))] transition-colors"
        aria-label="Previous project"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 3L5 8L10 13" />
        </svg>
      </button>
      <button
        onClick={() => scrollByCard(1)}
        className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-[hsl(var(--bg))] border border-[hsl(var(--border-base))] text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))] hover:border-[hsl(var(--border-hover))] transition-colors"
        aria-label="Next project"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3L11 8L6 13" />
        </svg>
      </button>

      {/* Scroll track */}
      <div
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-label="Showcase carousel"
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-6 lg:px-12 pb-4 no-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {showcaseItems.map((item) => (
          <ScrollReveal key={item.title}>
            <div
              className={cn(
                'shrink-0 rounded-2xl border border-[hsl(var(--border-base))] overflow-hidden snap-center',
                'hover:border-[hsl(var(--border-hover))] hover:shadow-[var(--shadow-md)] transition-all duration-300'
              )}
              style={{ width: `clamp(${CARD_WIDTH_MOBILE}px, 30vw, ${CARD_WIDTH_DESKTOP}px)` }}
            >
              {/* Gradient image area */}
              <div
                className={cn('h-[200px] bg-gradient-to-br', item.gradient, item.gradientDark)}
              />

              {/* Content */}
              <div className="p-6">
                <h3 className="text-h3 mb-2">{item.title}</h3>
                <p className="text-sm text-[hsl(var(--fg-secondary))] leading-relaxed mb-5 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center gap-2">
                  <Pill>{item.tool}</Pill>
                  <Pill>{item.buildTime}</Pill>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
