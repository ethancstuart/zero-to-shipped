import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import {
  ROLE_LANDING_CONFIGS,
  ROLE_LANDING_SLUGS,
} from '@/lib/content/role-landing'

export function RoleBand() {
  return (
    <section id="by-role" className="py-20">
      <ScrollReveal>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-h2">Built for your role</h2>
          <span className="font-mono-data text-[10px] tracking-wider uppercase text-[hsl(var(--fg-faint))]">
            4 paths
          </span>
        </div>
        <p className="mb-10 max-w-2xl text-sm text-[hsl(var(--fg-secondary))]">
          The course is the same. The path through it changes by role. Pick yours.
        </p>
      </ScrollReveal>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ROLE_LANDING_SLUGS.map((slug, index) => {
          const role = ROLE_LANDING_CONFIGS[slug]
          return (
            <ScrollReveal key={slug} delay={0.04 * index}>
              <Link
                href={`/for/${slug}`}
                className="group flex h-full flex-col justify-between rounded-xl border border-[hsl(var(--border-base))] bg-[hsl(var(--bg-muted))]/30 p-5 transition-all hover:border-[hsl(var(--pillar-system))] hover:bg-[hsl(var(--pillar-system-surface))]"
              >
                <div>
                  <p className="font-mono-data mb-2 text-[10px] tracking-wider uppercase text-[hsl(var(--fg-muted))]">
                    For {role.rolePlural}
                  </p>
                  <p className="text-base font-semibold leading-snug text-[hsl(var(--fg))]">
                    {role.heroHeadline}
                  </p>
                </div>
                <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--fg-secondary))] transition-colors group-hover:text-[hsl(var(--pillar-system))]">
                  See the path
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </ScrollReveal>
          )
        })}
      </div>
    </section>
  )
}
