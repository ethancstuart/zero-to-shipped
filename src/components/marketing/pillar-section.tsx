import Link from 'next/link'
import { ContentCard } from '@/components/content/content-card'
import type { ContentListItem } from '@/types/content'

interface PillarSectionProps {
  title: string
  description: string
  href: string
  items: ContentListItem[]
}

export function PillarSection({ title, description, href, items }: PillarSectionProps) {
  return (
    <section className="mb-20">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">{title}</h2>
          <p className="text-white/50">{description}</p>
        </div>
        <Link href={href} className="text-sm text-white/40 transition-colors hover:text-white/70">
          View all →
        </Link>
      </div>
      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((item) => (
            <ContentCard key={item.frontmatter.slug} content={item.frontmatter} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-white/30">
          Content coming soon
        </div>
      )}
    </section>
  )
}
