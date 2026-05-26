'use client'

import { useGsapReveal } from '@/lib/use-gsap'
import { cn } from '@/lib/utils'

interface StaggerGridProps {
  children: React.ReactNode
  className?: string
  stagger?: number
  y?: number
}

export function StaggerGrid({ children, className, stagger = 0.1, y = 40 }: StaggerGridProps) {
  const ref = useGsapReveal({ y, stagger })
  return <div ref={ref} className={cn(className)}>{children}</div>
}
