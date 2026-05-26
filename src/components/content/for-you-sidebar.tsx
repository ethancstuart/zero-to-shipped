'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Recommendation {
  slug: string
  title: string
  pillar: string
  reason: string
}

export function ForYouSidebar() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/recommendations')
      .then((res) => res.json())
      .then((data) => {
        if (data.recommendations) setRecommendations(data.recommendations)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (recommendations.length === 0) return null

  return (
    <div className="rounded-xl border border-[hsl(var(--border-base))] bg-[hsl(var(--bg-subtle))] p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--fg-muted))]">
        For You
      </h3>
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <Link
            key={rec.slug}
            href={`/${rec.pillar}/${rec.slug}`}
            className="block rounded-lg p-3 transition-colors hover:bg-[hsl(var(--bg-muted))]"
          >
            <div className="text-sm font-medium text-[hsl(var(--fg-secondary))]">{rec.title}</div>
            <div className="text-xs text-[hsl(var(--fg-faint))]">{rec.reason}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
