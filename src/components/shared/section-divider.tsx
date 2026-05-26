'use client'

import { ScrollReveal } from '@/components/motion/scroll-reveal'

interface SectionDividerProps {
  number: string
  label: string
}

export function SectionDivider({ number, label }: SectionDividerProps) {
  return (
    <ScrollReveal className="flex items-center gap-4 mb-16 lg:mb-20">
      <span className="font-mono-data text-[10px] text-[hsl(var(--fg-faint))] tracking-wider">{number}</span>
      <span className="flex-1 h-px bg-gradient-to-r from-[hsl(var(--border-base))] to-transparent" />
      <span className="text-[10px] tracking-[2px] uppercase text-[hsl(var(--fg-muted))] font-medium">{label}</span>
    </ScrollReveal>
  )
}
