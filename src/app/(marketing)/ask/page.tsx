'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from '@/components/assistant/chat-message'

export default function AskPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; sources?: string[] }[]>([])
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
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.ok ? data.answer : (data.error || 'Something went wrong.'),
          sources: res.ok ? data.sources : undefined,
        },
      ])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Failed to connect.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-80px)] max-w-3xl flex-col px-6">
      <div className="py-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Ask the Assistant</h1>
        <p className="text-white/50">Ask questions about AI coding tools, agent systems, or anything on the platform.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center text-white/20 mt-32">
            <p className="text-lg mb-2">What would you like to know?</p>
            <p className="text-sm">Try: &quot;What tools support MCP?&quot; or &quot;How do I set up AI agents?&quot;</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-white/5 px-4 py-3 text-sm text-white/40">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-white/10 py-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-white px-5 py-3 font-medium text-black disabled:opacity-50"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  )
}
