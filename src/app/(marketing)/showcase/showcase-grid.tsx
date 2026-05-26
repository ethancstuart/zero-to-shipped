'use client'

import { StaggerGrid } from '@/components/motion/stagger-grid'
import { Pill } from '@/components/shared/pill'
import type { ShowcaseProject } from '@/types/showcase'

interface SeedProject {
  id: string
  title: string
  description: string
  tools: string[]
  buildTime: string
}

// Gradient colors for visual variety
const gradients = [
  'from-blue-500/20 to-violet-500/20',
  'from-emerald-500/20 to-teal-500/20',
  'from-orange-500/20 to-rose-500/20',
  'from-indigo-500/20 to-cyan-500/20',
  'from-fuchsia-500/20 to-pink-500/20',
  'from-amber-500/20 to-yellow-500/20',
]

function ProjectCard({
  title,
  description,
  toolNames,
  buildTime,
  url,
  githubUrl,
  index,
}: {
  title: string
  description: string
  toolNames: string[]
  buildTime: string | null
  url?: string | null
  githubUrl?: string | null
  index: number
}) {
  const gradient = gradients[index % gradients.length]

  return (
    <div className="group overflow-hidden rounded-xl border border-[hsl(var(--border-base))] transition-all duration-300 hover:border-[hsl(var(--border-hover))] hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]">
      {/* Gradient placeholder image area */}
      <div
        className={`h-[180px] bg-gradient-to-br ${gradient} flex items-center justify-center`}
      >
        <span className="text-h2 text-[hsl(var(--fg-faint))] opacity-30 select-none">
          {title.charAt(0)}
        </span>
      </div>

      <div className="p-6">
        <h3 className="text-h3 mb-2">{title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-[hsl(var(--fg-secondary))] line-clamp-2">
          {description}
        </p>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {toolNames.map((name) => (
            <Pill key={name}>{name}</Pill>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {buildTime && (
            <span className="font-mono-data text-[10px] text-[hsl(var(--fg-muted))]">
              {buildTime}
            </span>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[hsl(var(--fg-muted))] underline underline-offset-2 transition-colors hover:text-[hsl(var(--fg-secondary))]"
            >
              Live
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[hsl(var(--fg-muted))] underline underline-offset-2 transition-colors hover:text-[hsl(var(--fg-secondary))]"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export function ShowcaseGrid({
  projects,
  seeds,
}: {
  projects?: ShowcaseProject[]
  seeds?: SeedProject[]
}) {
  if (seeds) {
    return (
      <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {seeds.map((project, i) => (
          <ProjectCard
            key={project.id}
            title={project.title}
            description={project.description}
            toolNames={project.tools}
            buildTime={project.buildTime}
            index={i}
          />
        ))}
      </StaggerGrid>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[hsl(var(--border-base))] p-12 text-center">
        <p className="font-mono-data text-sm text-[hsl(var(--fg-muted))]">
          No projects yet. Be the first to submit.
        </p>
      </div>
    )
  }

  return (
    <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, i) => {
        const toolNames = (project.showcase_project_tools || []).map(
          (t) => t.tools?.name || 'Unknown'
        )
        const buildTime = project.build_time_minutes
          ? `${project.build_time_minutes} min`
          : null

        return (
          <ProjectCard
            key={project.id}
            title={project.title}
            description={project.description}
            toolNames={toolNames}
            buildTime={buildTime}
            url={project.url}
            githubUrl={project.github_url}
            index={i}
          />
        )
      })}
    </StaggerGrid>
  )
}
