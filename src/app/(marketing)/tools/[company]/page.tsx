import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SectionDivider } from '@/components/shared/section-divider'
import { StaggerGrid } from '@/components/motion/stagger-grid'
import { Pill } from '@/components/shared/pill'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ company: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { company } = await params
  const supabase = await createClient()
  const { data: tool } = await supabase
    .from('tools')
    .select('parent_company')
    .eq('company_slug', company)
    .limit(1)
    .maybeSingle()

  const companyName = tool?.parent_company || company
  return {
    title: `${companyName} — AI Coding Tools — Prototype Studio`,
    description: `Track ${companyName}'s AI coding tools — releases, capabilities, and comparisons.`,
  }
}

export default async function CompanyToolsPage({ params }: Props) {
  const { company } = await params
  const supabase = await createClient()

  const { data: tools } = await supabase
    .from('tools')
    .select(
      'id, slug, name, category, description, current_version, logo_url, parent_company, company_slug'
    )
    .eq('company_slug', company)
    .order('name')

  if (!tools || tools.length === 0) notFound()

  const companyName = tools[0].parent_company || company

  return (
    <>
      <section className="border-b border-[hsl(var(--border-base))] px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-[1300px]">
          <div className="font-mono-data mb-4 flex items-center gap-2 text-[10px] uppercase tracking-wider text-[hsl(var(--fg-muted))]">
            <Link href="/tools" className="hover:text-[hsl(var(--fg-secondary))]">
              TOOLS
            </Link>
            <span aria-hidden>/</span>
            <span>{companyName.toUpperCase()}</span>
          </div>
          <h1 className="text-h1 mb-3">{companyName}</h1>
          <p className="max-w-lg text-[hsl(var(--fg-secondary))]">
            {tools.length} {tools.length === 1 ? 'product' : 'products'} from{' '}
            {companyName} that we track for releases and capabilities.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1300px] px-6 py-12 lg:px-12">
        <SectionDivider
          number="01"
          label={`${tools.length} ${tools.length === 1 ? 'product' : 'products'}`}
        />

        <StaggerGrid className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${company}/${tool.slug}`}
              className="block rounded-xl border border-[hsl(var(--border-base))] p-6 transition-all duration-300 hover:border-[hsl(var(--border-hover))] hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
            >
              <div className="mb-4 flex items-center gap-3">
                {tool.logo_url && (
                  <Image
                    src={tool.logo_url}
                    alt={tool.name}
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="text-h3">{tool.name}</div>
                </div>
                {tool.current_version && (
                  <span className="font-mono-data rounded-full border border-[hsl(var(--border-base))] px-2 py-0.5 text-[10px] text-[hsl(var(--fg-muted))]">
                    {tool.current_version}
                  </span>
                )}
              </div>
              {tool.category && <Pill className="mb-3">{tool.category}</Pill>}
              {tool.description && (
                <div className="line-clamp-2 text-sm leading-relaxed text-[hsl(var(--fg-secondary))]">
                  {tool.description}
                </div>
              )}
            </Link>
          ))}
        </StaggerGrid>
      </section>
    </>
  )
}
