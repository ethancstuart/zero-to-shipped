'use client'

import Link from 'next/link'
import type { ContentFrontmatter } from '@/types/content'

interface LearningPathProps {
  lessons: ContentFrontmatter[]
}

/** Extract module number from title like "Module 5: Version Control with Git" */
function getModuleNumber(title: string): number {
  const match = title.match(/Module\s+(\d+)/i)
  return match ? parseInt(match[1], 10) : 999
}

export function LearningPath({ lessons }: LearningPathProps) {
  const sorted = [...lessons].sort(
    (a, b) => getModuleNumber(a.title) - getModuleNumber(b.title)
  )

  if (sorted.length === 0) return null

  return (
    <div className="mb-12">
      <h2 className="text-h2 mb-6">Learning Path</h2>
      <p className="text-sm text-[hsl(var(--fg-secondary))] mb-8 max-w-lg">
        {sorted.length} modules from setup to shipping. Work through them in order or jump to what you need.
      </p>
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-4 top-4 bottom-4 w-px bg-[hsl(var(--border-base))] hidden sm:block" />

        <div className="flex flex-col gap-2">
          {sorted.map((lesson) => {
            const num = getModuleNumber(lesson.title)
            // Strip "Module N: " prefix for cleaner display
            const cleanTitle = lesson.title.replace(/^Module\s+\d+:\s*/i, '')

            return (
              <Link
                key={lesson.slug}
                href={`/learn/${lesson.slug}`}
                className="group flex items-center gap-4 rounded-lg px-2 py-2.5 transition-colors hover:bg-[hsl(var(--pillar-learn-surface))]"
              >
                {/* Numbered circle */}
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--pillar-learn-border))] bg-[hsl(var(--bg))] font-mono-data text-xs text-[hsl(var(--pillar-learn))] group-hover:bg-[hsl(var(--pillar-learn-surface))] group-hover:border-[hsl(var(--pillar-learn))] transition-colors">
                  {num}
                </div>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-[hsl(var(--fg))] group-hover:text-[hsl(var(--pillar-learn))] transition-colors truncate block">
                    {cleanTitle}
                  </span>
                </div>

                {/* Duration */}
                {lesson.estimatedMinutes > 0 && (
                  <span className="font-mono-data text-[10px] text-[hsl(var(--fg-muted))] shrink-0">
                    {lesson.estimatedMinutes} min
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
