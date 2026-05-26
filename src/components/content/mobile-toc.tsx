'use client'

import { useCallback, useEffect, useState } from 'react'

export function MobileToc() {
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const initHeadings = useCallback(() => {
    const proseEl = document.querySelector('[data-prose]')
    if (!proseEl) return
    const elements = proseEl.querySelectorAll('h2, h3')
    const items = Array.from(elements).map((el) => ({
      id:
        el.id ||
        el.textContent
          ?.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '') ||
        '',
      text: el.textContent || '',
    }))
    elements.forEach((el, i) => {
      if (!el.id) el.id = items[i].id
    })
    setHeadings(items)
  }, [])

  useEffect(() => {
    // Use requestAnimationFrame to read DOM after paint
    const raf = requestAnimationFrame(initHeadings)
    return () => cancelAnimationFrame(raf)
  }, [initHeadings])

  if (headings.length === 0) return null

  return (
    <div className="lg:hidden mb-6 border border-[hsl(var(--border-base))] rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex justify-between items-center text-sm text-[hsl(var(--fg-secondary))]"
      >
        <span>On this page</span>
        <span
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          &#9662;
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-3 space-y-2 border-t border-[hsl(var(--border-base))]">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={() => setIsOpen(false)}
              className="block text-sm text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))] py-1"
            >
              {h.text}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
