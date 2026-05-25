'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Tool {
  id: string
  name: string
  slug: string
}

export default function ShowcaseSubmitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tools, setTools] = useState<Tool[]>([])

  const [form, setForm] = useState({
    title: '',
    url: '',
    description: '',
    screenshot_url: '',
    github_url: '',
    build_time_minutes: '',
    builder_experience: '' as '' | 'beginner' | 'intermediate' | 'advanced',
    tool_ids: [] as string[],
  })

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/?login=1')
        return
      }
      const { data: toolData } = await supabase.from('tools').select('id, name, slug').order('name')
      setTools(toolData || [])
      setLoading(false)
    }
    init()
  }, [router])

  function toggleTool(id: string) {
    setForm((prev) => ({
      ...prev,
      tool_ids: prev.tool_ids.includes(id)
        ? prev.tool_ids.filter((t) => t !== id)
        : [...prev.tool_ids, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          url: form.url || null,
          description: form.description,
          screenshot_url: form.screenshot_url || null,
          github_url: form.github_url || null,
          build_time_minutes: form.build_time_minutes ? parseInt(form.build_time_minutes, 10) : null,
          builder_experience: form.builder_experience || null,
          tool_ids: form.tool_ids,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Submission failed. Please try again.')
        setSubmitting(false)
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="text-white/30">Loading...</div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <h2 className="mb-3 text-2xl font-semibold text-white">Project submitted</h2>
          <p className="mb-6 text-white/50">
            Your project is pending review. It will appear in the showcase once approved.
          </p>
          <a
            href="/showcase"
            className="text-sm text-white/60 underline hover:text-white/80"
          >
            Back to showcase
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-white">Submit a project</h1>
        <p className="text-white/50">
          Share what you built. Projects are reviewed before appearing in the showcase.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-white/70">
            Project title <span className="text-white/30">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="My AI-built app"
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 focus:ring-0"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-white/70">
            Description <span className="text-white/30">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="What does it do? What problem does it solve?"
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 focus:ring-0 resize-none"
          />
        </div>

        {/* Live URL */}
        <div>
          <label htmlFor="url" className="mb-1.5 block text-sm font-medium text-white/70">
            Live URL
          </label>
          <input
            id="url"
            type="url"
            value={form.url}
            onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
            placeholder="https://myapp.com"
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 focus:ring-0"
          />
        </div>

        {/* GitHub URL */}
        <div>
          <label htmlFor="github_url" className="mb-1.5 block text-sm font-medium text-white/70">
            GitHub URL
          </label>
          <input
            id="github_url"
            type="url"
            value={form.github_url}
            onChange={(e) => setForm((p) => ({ ...p, github_url: e.target.value }))}
            placeholder="https://github.com/user/repo"
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 focus:ring-0"
          />
        </div>

        {/* Screenshot URL */}
        <div>
          <label htmlFor="screenshot_url" className="mb-1.5 block text-sm font-medium text-white/70">
            Screenshot URL
          </label>
          <input
            id="screenshot_url"
            type="url"
            value={form.screenshot_url}
            onChange={(e) => setForm((p) => ({ ...p, screenshot_url: e.target.value }))}
            placeholder="https://i.imgur.com/screenshot.png"
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 focus:ring-0"
          />
        </div>

        {/* Build time + experience */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="build_time_minutes" className="mb-1.5 block text-sm font-medium text-white/70">
              Build time (minutes)
            </label>
            <input
              id="build_time_minutes"
              type="number"
              min="1"
              value={form.build_time_minutes}
              onChange={(e) => setForm((p) => ({ ...p, build_time_minutes: e.target.value }))}
              placeholder="120"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 focus:ring-0"
            />
          </div>
          <div>
            <label htmlFor="builder_experience" className="mb-1.5 block text-sm font-medium text-white/70">
              Your experience level
            </label>
            <select
              id="builder_experience"
              value={form.builder_experience}
              onChange={(e) => setForm((p) => ({ ...p, builder_experience: e.target.value as typeof form.builder_experience }))}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-white/25 focus:ring-0"
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Tools used */}
        {tools.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-white/70">Tools used</p>
            <div className="flex flex-wrap gap-2">
              {tools.map((t) => {
                const selected = form.tool_ids.includes(t.id)
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTool(t.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      selected
                        ? 'border-white/30 bg-white/10 text-white'
                        : 'border-white/10 text-white/40 hover:text-white/60'
                    }`}
                  >
                    {t.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit project'}
          </button>
          <a href="/showcase" className="text-sm text-white/40 hover:text-white/60">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
