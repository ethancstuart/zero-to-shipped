'use client'
import { useState } from 'react'

export default function ToolkitPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    const res = await fetch('/api/toolkit-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setState(res.ok ? 'done' : 'error')
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2">PM AI Toolkit</h1>
        <p className="text-zinc-400 mb-6">
          The exact AI build loop, tools, and prompts from Zero to Ship Module 1 — in one page.
          Free. No course purchase needed.
        </p>

        {state === 'done' ? (
          <div className="bg-green-950 border border-green-700 rounded-lg p-4 text-green-300">
            Check your email — the toolkit is on its way.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500"
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-500 disabled:opacity-50"
            >
              {state === 'loading' ? 'Sending…' : 'Send me the toolkit'}
            </button>
            {state === 'error' && (
              <p className="text-red-400 text-sm">Something went wrong. Try again.</p>
            )}
          </form>
        )}

        <p className="text-xs text-zinc-600 mt-4">
          You&apos;ll also get the Zero to Ship weekly newsletter. Unsubscribe anytime.
        </p>
      </div>
    </main>
  )
}
