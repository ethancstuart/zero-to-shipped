'use client'

import { useEffect, useState } from 'react'

export function CostTicker() {
  const [cost, setCost] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/v1/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.totalCostCents) {
          setCost(data.data.totalCostCents)
        }
      })
      .catch(() => {})
  }, [])

  if (cost === null) return <span className="text-white/30">loading...</span>

  return (
    <span className="inline-flex items-center rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1 text-sm font-medium text-green-400">
      ${(cost / 100).toFixed(2)} total platform cost
    </span>
  )
}
