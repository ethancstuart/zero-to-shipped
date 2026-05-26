'use client'

import { useState, useEffect } from 'react'

interface BookmarkButtonProps {
  slug: string
}

export function BookmarkButton({ slug }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/bookmarks?slug=${slug}`)
      .then(res => res.json())
      .then(data => setBookmarked(data.bookmarked))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch('/api/bookmarks', {
        method: bookmarked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (res.ok) setBookmarked(!bookmarked)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        bookmarked
          ? 'border-[hsl(var(--border-hover))] bg-[hsl(var(--bg-muted))] text-[hsl(var(--fg))]'
          : 'border-[hsl(var(--border-base))] text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg-secondary))]'
      }`}
    >
      {bookmarked ? 'Bookmarked' : 'Bookmark'}
    </button>
  )
}
