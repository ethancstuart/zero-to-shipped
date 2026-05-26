import { cn } from '@/lib/utils'

type PillarName = 'pulse' | 'build' | 'learn' | 'system'

const pillarStyles: Record<PillarName, string> = {
  pulse: 'bg-[hsl(var(--pillar-pulse-surface))] text-[hsl(var(--pillar-pulse))] border-[hsl(var(--pillar-pulse-border))]',
  build: 'bg-[hsl(var(--pillar-build-surface))] text-[hsl(var(--pillar-build))] border-[hsl(var(--pillar-build-border))]',
  learn: 'bg-[hsl(var(--pillar-learn-surface))] text-[hsl(var(--pillar-learn))] border-[hsl(var(--pillar-learn-border))]',
  system: 'bg-[hsl(var(--pillar-system-surface))] text-[hsl(var(--pillar-system))] border-[hsl(var(--pillar-system-border))]',
}

interface PillProps {
  children: React.ReactNode
  pillar?: PillarName
  className?: string
}

export function Pill({ children, pillar, className }: PillProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide border',
      pillar ? pillarStyles[pillar] : 'bg-[hsl(var(--bg-muted))] text-[hsl(var(--fg-muted))] border-[hsl(var(--border-base))]',
      className
    )}>
      {children}
    </span>
  )
}
