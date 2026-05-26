import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Pill } from '@/components/shared/pill'
import type { ContentFrontmatter } from '@/types/content'

interface ContentCardProps {
  content: ContentFrontmatter
}

const difficultyLabel: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export function ContentCard({ content }: ContentCardProps) {
  const href = `/${content.pillar}/${content.slug}`

  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-xl border border-[hsl(var(--border-base))] p-6 transition-all duration-300',
        'hover:border-[hsl(var(--border-hover))] hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]'
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Pill pillar={content.pillar}>{content.pillar}</Pill>
        <Pill>{content.type}</Pill>
      </div>

      <h3 className="text-h3 mb-2 group-hover:text-[hsl(var(--fg))]">
        {content.title}
      </h3>

      {content.tools.length > 0 && (
        <div className="text-sm text-[hsl(var(--fg-secondary))] leading-relaxed line-clamp-2 mb-4">
          {content.tools.slice(0, 3).join(' · ')}
        </div>
      )}

      <div className="flex items-center gap-3 pt-3 border-t border-[hsl(var(--border-base))]">
        {content.estimatedMinutes > 0 && (
          <span className="font-mono-data text-[10px] text-[hsl(var(--fg-muted))]">
            {content.estimatedMinutes} min
          </span>
        )}
        <span className="font-mono-data text-[10px] text-[hsl(var(--fg-muted))]">
          {difficultyLabel[content.difficulty] ?? content.difficulty}
        </span>
      </div>
    </Link>
  )
}
