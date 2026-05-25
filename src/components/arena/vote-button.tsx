'use client'

import { useState } from 'react'

interface VoteButtonProps {
  challengeId: string
  toolId: string
  toolName: string
}

export function VoteButton({ challengeId, toolId, toolName }: VoteButtonProps) {
  const [voted, setVoted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleVote() {
    setLoading(true)
    try {
      const res = await fetch('/api/arena/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, toolId }),
      })
      if (res.ok) setVoted(true)
    } finally {
      setLoading(false)
    }
  }

  if (voted) {
    return (
      <div className="rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-2 text-center text-sm text-green-400">
        Voted for {toolName}
      </div>
    )
  }

  return (
    <button
      onClick={handleVote}
      disabled={loading}
      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10 disabled:opacity-50"
    >
      {loading ? 'Voting...' : `Vote for ${toolName}`}
    </button>
  )
}
