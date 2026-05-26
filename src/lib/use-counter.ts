'use client'

import { useEffect, useRef, useState } from 'react'

export function useCounter(target: number, duration = 1200) {
  const [display, setDisplay] = useState('0')
  const ref = useRef<HTMLDivElement>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (!ref.current || hasRun.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasRun.current) return
        hasRun.current = true
        observer.disconnect()

        const start = performance.now()
        const digits = String(target).length

        function step(now: number) {
          const elapsed = now - start
          const progress = Math.min(1, elapsed / duration)

          if (progress < 0.4) {
            let scrambled = ''
            for (let i = 0; i < digits; i++) scrambled += Math.floor(Math.random() * 10)
            setDisplay(scrambled)
          } else {
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(String(Math.round(target * eased)))
          }

          if (progress < 1) requestAnimationFrame(step)
          else setDisplay(String(target))
        }

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReduced) { setDisplay(String(target)) }
        else { requestAnimationFrame(step) }
      },
      { threshold: 0.3 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return { ref, display }
}
