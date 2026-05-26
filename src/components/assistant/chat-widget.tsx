'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from './chat-message'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const query = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: query }])
    setLoading(true)

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.answer, sources: data.sources },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.error || 'Something went wrong.' },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to connect to the assistant.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--fg))] text-[hsl(var(--bg))] shadow-lg transition-transform hover:scale-105"
        aria-label="Open assistant"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-3 right-3 z-50 flex h-[90vh] max-h-[500px] w-[95vw] max-w-[380px] flex-col overflow-hidden rounded-xl border border-[hsl(var(--border-hover))] bg-[hsl(var(--bg))] shadow-2xl sm:bottom-6 sm:right-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border-base))] px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-[hsl(var(--fg))]">Assistant</h3>
          <p className="text-xs text-[hsl(var(--fg-muted))]">Ask about anything on Prototype Studio</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg-secondary))]">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-sm text-[hsl(var(--fg-faint))] mt-20">
            Ask a question about AI coding tools, agents, or any content on the platform.
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-[hsl(var(--bg-subtle))] px-4 py-3 text-sm text-[hsl(var(--fg-muted))]">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-[hsl(var(--border-base))] p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 rounded-lg border border-[hsl(var(--border-base))] bg-[hsl(var(--bg-subtle))] px-3 py-2 text-sm text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-faint))] focus:border-[hsl(var(--border-hover))] focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-[hsl(var(--fg))] px-3 py-2 text-sm font-medium text-[hsl(var(--bg))] disabled:opacity-50"
          >
            →
          </button>
        </div>
      </form>
    </div>
  )
}
