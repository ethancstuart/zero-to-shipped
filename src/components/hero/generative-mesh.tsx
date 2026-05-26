'use client'

import { useEffect, useRef } from 'react'

interface Point {
  ox: number
  oy: number
  x: number
  y: number
}

const COLS = 20
const ROWS = 14
const SPACING = 60
const PROXIMITY = 250
const FORCE = 0.08

export function GenerativeMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let mouse = { x: -9999, y: -9999 }
    let scrollOpacity = 1
    let rafId: number

    // Build grid
    const points: Point[] = []
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const ox = col * SPACING
        const oy = row * SPACING
        points.push({ ox, oy, x: ox, y: oy })
      }
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const isDark = () => document.documentElement.classList.contains('dark')

    const draw = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      const dark = isDark()
      const baseOpacity = 0.4 * scrollOpacity

      // Offset grid to center
      const gridW = (COLS - 1) * SPACING
      const gridH = (ROWS - 1) * SPACING
      const offsetX = (w - gridW) / 2
      const offsetY = (h - gridH) / 2

      // Update positions (skip if reduced motion)
      if (!prefersReduced) {
        for (const p of points) {
          const worldX = p.ox + offsetX
          const worldY = p.oy + offsetY
          const dx = mouse.x - worldX
          const dy = mouse.y - worldY
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < PROXIMITY) {
            p.x = p.ox + dx * FORCE
            p.y = p.oy + dy * FORCE
          } else {
            // Ease back to origin
            p.x += (p.ox - p.x) * 0.08
            p.y += (p.oy - p.y) * 0.08
          }
        }
      }

      // Draw lines
      const lineColor = dark ? `rgba(40,50,70,${0.2 * baseOpacity})` : `rgba(200,210,230,${0.15 * baseOpacity})`
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 1

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const idx = row * COLS + col
          const p = points[idx]
          const px = p.x + offsetX
          const py = p.y + offsetY

          // Horizontal line
          if (col < COLS - 1) {
            const right = points[idx + 1]
            ctx.beginPath()
            ctx.moveTo(px, py)
            ctx.lineTo(right.x + offsetX, right.y + offsetY)
            ctx.stroke()
          }
          // Vertical line
          if (row < ROWS - 1) {
            const below = points[idx + COLS]
            ctx.beginPath()
            ctx.moveTo(px, py)
            ctx.lineTo(below.x + offsetX, below.y + offsetY)
            ctx.stroke()
          }
        }
      }

      // Draw dots
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const idx = row * COLS + col
          const p = points[idx]
          const px = p.x + offsetX
          const py = p.y + offsetY

          const dx = mouse.x - px
          const dy = mouse.y - py
          const dist = Math.sqrt(dx * dx + dy * dy)
          const alpha = prefersReduced
            ? 0.08
            : 0.03 + Math.max(0, 0.22 * (1 - dist / PROXIMITY))

          const dotColor = dark
            ? `rgba(96,165,250,${alpha * baseOpacity})`
            : `rgba(59,130,246,${alpha * baseOpacity})`

          ctx.fillStyle = dotColor
          ctx.beginPath()
          ctx.arc(px, py, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      rafId = requestAnimationFrame(draw)
    }

    resize()

    const onMouseMove = (e: MouseEvent) => {
      if (prefersReduced) return
      mouse = { x: e.clientX, y: e.clientY }
    }

    const onScroll = () => {
      if (prefersReduced) return
      scrollOpacity = Math.max(0, 1 - window.scrollY / 600)
    }

    window.addEventListener('resize', resize)
    document.addEventListener('mousemove', onMouseMove)
    window.addEventListener('scroll', onScroll, { passive: true })

    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed top-0 left-0 z-0 hidden w-full h-full lg:block"
      style={{ opacity: 0.4 }}
      aria-hidden="true"
    />
  )
}
