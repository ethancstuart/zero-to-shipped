'use client'

import { useCounter } from '@/lib/use-counter'
import { ScrollReveal } from '@/components/motion/scroll-reveal'

function AnimatedStat({ value, label }: { value: number; label: string }) {
  const { ref, display } = useCounter(value)
  return (
    <div className="flex flex-col items-center gap-2 py-8 px-4">
      <div
        ref={ref}
        className="font-display text-[48px] font-light tracking-tight text-[hsl(var(--fg))]"
      >
        {display}
      </div>
      <div className="font-mono-data text-[11px] tracking-wider text-[hsl(var(--fg-muted))] uppercase">
        {label}
      </div>
    </div>
  )
}

function TextStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 px-4">
      <div className="font-display text-[48px] font-light tracking-tight text-[hsl(var(--fg))]">
        {value}
      </div>
      <div className="font-mono-data text-[11px] tracking-wider text-[hsl(var(--fg-muted))] uppercase">
        {label}
      </div>
    </div>
  )
}

export function NumberTheater() {
  return (
    <ScrollReveal className="py-20">
      <div className="flex flex-wrap justify-between border-y border-[hsl(var(--border-base))]">
        <AnimatedStat value={9} label="tools tracked" />
        <AnimatedStat value={37} label="resources" />
        <AnimatedStat value={270} label="capabilities mapped" />
        <AnimatedStat value={4} label="pillars" />
        <TextStat value="Free" label="to start" />
      </div>
    </ScrollReveal>
  )
}
