'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

interface WordRevealProps {
  lines: { words: string[]; className?: string }[]
}

function renderWord(word: string, className?: string) {
  // If the word ends with ".", split off the period and color it accent
  if (word.endsWith('.')) {
    const base = word.slice(0, -1)
    return (
      <span className={`word-inner inline-block ${className || ''}`}>
        {base}
        <span className="text-[hsl(var(--accent-hsl))]">.</span>
      </span>
    )
  }

  return (
    <span className={`word-inner inline-block ${className || ''}`}>
      {word}
    </span>
  )
}

export function WordReveal({ lines }: WordRevealProps) {
  const containerRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const inners = containerRef.current.querySelectorAll('.word-inner')

    if (prefersReduced) {
      gsap.set(inners, { y: 0 })
      return
    }

    gsap.set(inners, { y: '105%' })
    gsap.to(inners, {
      y: 0,
      duration: 0.9,
      stagger: 0.08,
      delay: 0.4,
      ease: 'power3.out',
    })
  }, [])

  return (
    <h1 ref={containerRef} className="text-display font-light">
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.words.map((word, wi) => (
            <span key={wi} className="inline-block overflow-hidden align-bottom">
              {renderWord(word, line.className)}
              {wi < line.words.length - 1 ? (
                <span className={`word-inner inline-block ${line.className || ''}`}>
                  &nbsp;
                </span>
              ) : null}
            </span>
          ))}
        </span>
      ))}
    </h1>
  )
}
