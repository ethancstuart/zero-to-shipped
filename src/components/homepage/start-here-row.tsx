import { listContentByPillar } from '@/lib/content/loader'
import { ContentCard } from '@/components/content/content-card'
import { ScrollReveal } from '@/components/motion/scroll-reveal'

export async function StartHereRow() {
  const items = await listContentByPillar('learn', {
    featured: true,
    limit: 3,
  })

  if (items.length === 0) return null

  return (
    <section id="start-here" className="py-20">
      <ScrollReveal>
        <h2 className="text-h2 mb-10">Start here</h2>
      </ScrollReveal>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ScrollReveal key={item.frontmatter.slug} delay={0.05}>
            <ContentCard content={item.frontmatter} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
