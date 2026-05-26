'use client'

import { useEffect, useRef } from 'react'

export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    if (!el) return

    const updateGradient = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const color = isDark ? 'rgba(96,165,250,0.06)' : 'rgba(59,130,246,0.04)'
      el.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`
    }

    updateGradient()

    const observer = new MutationObserver(updateGradient)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const onMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
    }
    document.addEventListener('mousemove', onMove)
    return () => {
      document.removeEventListener('mousemove', onMove)
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full z-[1] hidden lg:block"
      style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)' }}
      aria-hidden="true"
    />
  )
}
