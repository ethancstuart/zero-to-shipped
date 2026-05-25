import Link from 'next/link'
import type { ContentFrontmatter } from '@/types/content'

interface ContentCardProps {
  content: ContentFrontmatter
}

const pillarColors = {
  pulse: 'border-l-blue-500',
  build: 'border-l-amber-500',
  learn: 'border-l-green-500',
  system: 'border-l-purple-500',
} as const

const difficultyColors = {
  beginner: 'text-green-400 border-green-400/20 bg-green-400/5',
  intermediate: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5',
  advanced: 'text-red-400 border-red-400/20 bg-red-400/5',
} as const

const formatIcons = {
  video: '▶',
  written: '📄',
  interactive: '⚡',
  config: '⚙',
} as const

export function ContentCard({ content }: ContentCardProps) {
  const href = `/${content.pillar}/${content.slug}`

  return (
    <Link
      href={href}
      className={`group block rounded-xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04] border-l-4 ${pillarColors[content.pillar as keyof typeof pillarColors] ?? ''}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm">{formatIcons[content.format]}</span>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs ${difficultyColors[content.difficulty]}`}
        >
          {content.difficulty}
        </span>
        {content.estimatedMinutes > 0 && (
          <span className="text-xs text-white/40">
            {content.estimatedMinutes} min
          </span>
        )}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-white/90">
        {content.title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {content.tools.slice(0, 3).map((tool) => (
          <span
            key={tool}
            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/50"
          >
            {tool}
          </span>
        ))}
      </div>
    </Link>
  )
}
