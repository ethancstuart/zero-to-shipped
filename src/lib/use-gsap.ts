'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from './gsap'

export function useGsapReveal(
  options: {
    y?: number
    opacity?: number
    duration?: number
    delay?: number
    stagger?: number
    start?: string
  } = {}
) {
  const ref = useRef<HTMLDivElement>(null)
  const { y = 30, opacity = 0, duration = 0.8, delay = 0, stagger = 0, start = 'top 85%' } = options

  useEffect(() => {
    if (!ref.current) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const children = stagger > 0 ? ref.current.children : [ref.current]
    gsap.set(children, { y, opacity })

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start,
      once: true,
      onEnter: () => {
        gsap.to(children, { y: 0, opacity: 1, duration, delay, stagger, ease: 'power3.out' })
      },
    })

    return () => { trigger.kill() }
  }, [y, opacity, duration, delay, stagger, start])

  return ref
}
