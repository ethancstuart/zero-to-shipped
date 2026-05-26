'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type PillarName = 'pulse' | 'build' | 'learn' | 'system'

const pillarConfig: Record<PillarName, { surface: string; border: string; text: string; href: string }> = {
  pulse: { surface: 'bg-[hsl(var(--pillar-pulse-surface))]', border: 'border-[hsl(var(--pillar-pulse-border))]', text: 'text-[hsl(var(--pillar-pulse))]', href: '/pulse' },
  build: { surface: 'bg-[hsl(var(--pillar-build-surface))]', border: 'border-[hsl(var(--pillar-build-border))]', text: 'text-[hsl(var(--pillar-build))]', href: '/build' },
  learn: { surface: 'bg-[hsl(var(--pillar-learn-surface))]', border: 'border-[hsl(var(--pillar-learn-border))]', text: 'text-[hsl(var(--pillar-learn))]', href: '/learn' },
  system: { surface: 'bg-[hsl(var(--pillar-system-surface))]', border: 'border-[hsl(var(--pillar-system-border))]', text: 'text-[hsl(var(--pillar-system))]', href: '/system' },
}

interface PillarCardProps {
  pillar: PillarName
  title: string
  description: string
  count: string
}

export function PillarCard({ pillar, title, description, count }: PillarCardProps) {
  const config = pillarConfig[pillar]
  const ref = useRef<HTMLAnchorElement>(null)

  const onMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-4px)`
  }

  const onMouseLeave = () => { if (ref.current) ref.current.style.transform = '' }

  return (
    <Link ref={ref} href={config.href} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      className={cn('block rounded-xl border p-7 transition-all duration-400', config.surface, config.border, 'hover:shadow-[var(--shadow-md)]')}>
      <div className={cn('text-[10px] tracking-wider font-medium uppercase mb-5', config.text)}>{pillar}</div>
      <div className="text-h3 mb-2">{title}</div>
      <div className="text-sm text-[hsl(var(--fg-secondary))] leading-relaxed">{description}</div>
      <div className="font-mono-data text-[11px] text-[hsl(var(--fg-muted))] mt-5">{count}</div>
    </Link>
  )
}
