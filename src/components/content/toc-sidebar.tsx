'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

function extractHeadings(proseEl: Element): TocItem[] {
  const elements = proseEl.querySelectorAll('h2, h3')
  const items: TocItem[] = Array.from(elements).map((el) => ({
    id:
      el.id ||
      el.textContent
        ?.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '') ||
      '',
    text: el.textContent || '',
    level: el.tagName === 'H2' ? 2 : 3,
  }))
  // Ensure all headings have IDs
  elements.forEach((el, i) => {
    if (!el.id) el.id = items[i].id
  })
  return items
}

export function TocSidebar() {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  const initToc = useCallback(() => {
    const proseEl = document.querySelector('[data-prose]')
    if (!proseEl) return
    const items = extractHeadings(proseEl)
    setHeadings(items)

    observerRef.current?.disconnect()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-80px 0px -60% 0px' }
    )
    observerRef.current = observer
    const elements = proseEl.querySelectorAll('h2, h3')
    elements.forEach((el) => observer.observe(el))
  }, [])

  useEffect(() => {
    // Use requestAnimationFrame to read DOM after paint
    const raf = requestAnimationFrame(initToc)
    return () => {
      cancelAnimationFrame(raf)
      observerRef.current?.disconnect()
    }
  }, [initToc])

  if (headings.length === 0) return null

  return (
    <aside className="hidden lg:block sticky top-24 self-start pl-8 border-l border-[hsl(var(--border-base))]">
      <div className="text-[10px] tracking-[1.5px] uppercase text-[hsl(var(--fg-muted))] font-medium mb-4">
        On this page
      </div>
      <ul className="space-y-2">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block text-sm transition-colors duration-200 ${
                h.level === 3 ? 'pl-3' : ''
              } ${
                activeId === h.id
                  ? 'text-[hsl(var(--accent-hsl))] border-l-2 border-[hsl(var(--accent-hsl))] -ml-[calc(2rem+1px)] pl-[calc(2rem-1px)]'
                  : 'text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg-secondary))]'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
