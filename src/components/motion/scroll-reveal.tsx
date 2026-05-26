'use client'

import { useGsapReveal } from '@/lib/use-gsap'
import { cn } from '@/lib/utils'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  y?: number
  delay?: number
  duration?: number
}

export function ScrollReveal({ children, className, y = 30, delay = 0, duration = 0.8 }: ScrollRevealProps) {
  const ref = useGsapReveal({ y, delay, duration })
  return <div ref={ref} className={cn(className)}>{children}</div>
}
