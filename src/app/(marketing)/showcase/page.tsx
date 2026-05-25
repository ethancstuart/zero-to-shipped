import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { ShowcaseProject } from '@/types/showcase'

export const metadata: Metadata = {
  title: 'Showcase — Prototype Studio',
  description: 'See what people are building with AI coding tools.',
}

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>
}) {
  const { tool } = await searchParams
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('showcase_projects')
    .select(`*, showcase_project_tools(tool_id, tools:tool_id(name, slug))`)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  // Filter by tool client-side (Supabase doesn't easily filter through junction tables)
  const filtered = tool
    ? (projects || []).filter((p: ShowcaseProject) =>
        (p.showcase_project_tools || []).some((t) => t.tools?.slug === tool)
      )
    : projects || []

  // Get all tools for filter
  const { data: tools } = await supabase.from('tools').select('name, slug').order('name')

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">Showcase</h1>
          <p className="max-w-2xl text-lg text-white/50">
            See what people are building with AI coding tools.
          </p>
        </div>
        <Link
          href="/showcase/submit"
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          Submit a project
        </Link>
      </div>

      {/* Tool filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/showcase"
          className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
            !tool ? 'border-white/30 bg-white/10 text-white' : 'border-white/10 text-white/40 hover:text-white/60'
          }`}
        >
          All
        </Link>
        {tools?.map((t) => (
          <Link
            key={t.slug}
            href={`/showcase?tool=${t.slug}`}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              tool === t.slug ? 'border-white/30 bg-white/10 text-white' : 'border-white/10 text-white/40 hover:text-white/60'
            }`}
          >
            {t.name}
          </Link>
        ))}
      </div>

      {/* Projects grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project: ShowcaseProject) => (
            <div key={project.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">{project.title}</h3>
              <p className="mb-4 text-sm text-white/50 line-clamp-3">{project.description}</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {(project.showcase_project_tools || []).map((t) => (
                  <span key={t.tool_id} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/50">
                    {t.tools?.name || 'Unknown'}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-white/30">
                {project.build_time_minutes && <span>{project.build_time_minutes} min</span>}
                {project.builder_experience && <span>{project.builder_experience}</span>}
                <span>{project.upvotes} upvotes</span>
              </div>
              <div className="mt-3 flex gap-2">
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs text-white/40 underline hover:text-white/60">
                    Live →
                  </a>
                )}
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-xs text-white/40 underline hover:text-white/60">
                    GitHub →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-white/30">
          No projects yet. Be the first to submit!
        </div>
      )}
    </div>
  )
}
