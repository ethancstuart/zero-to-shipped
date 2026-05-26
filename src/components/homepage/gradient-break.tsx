import { ScrollReveal } from '@/components/motion/scroll-reveal'

export function GradientBreak() {
  return (
    <div className="bg-gradient-to-br from-[hsl(var(--pillar-pulse-surface))] via-[hsl(var(--pillar-system-surface))] to-[hsl(var(--pillar-learn-surface))] min-h-[40vh] flex items-center justify-center px-6">
      <ScrollReveal className="text-center max-w-3xl">
        <h2
          className="font-display font-light leading-tight text-[hsl(var(--fg))]"
          style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
        >
          One platform.{' '}
          <strong className="font-semibold">Every AI tool.</strong>{' '}
          Zero noise.
        </h2>
      </ScrollReveal>
    </div>
  )
}
