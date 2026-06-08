import Link from 'next/link'
import Image from 'next/image'
import { Pill } from '@/components/shared/pill'

interface ToolCardProps {
  slug: string
  name: string
  category: string
  description: string | null
  currentVersion: string | null
  logoUrl: string | null
  /**
   * Parent company slug for hierarchical /tools/[company]/[product] URLs.
   * Falls back to the product slug (companies where company_slug == product slug)
   * if not provided, which still resolves through the redirect chain.
   */
  companySlug?: string | null
}

export function ToolCard({ slug, name, category, description, currentVersion, logoUrl, companySlug }: ToolCardProps) {
  const href = companySlug ? `/tools/${companySlug}/${slug}` : `/tools/${slug}`
  return (
    <Link href={href}
      className="block rounded-xl border border-[hsl(var(--border-base))] p-6 transition-all duration-300 hover:border-[hsl(var(--border-hover))] hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-3 mb-4">
        {logoUrl && <Image src={logoUrl} alt={name} width={32} height={32} className="rounded-lg" />}
        <div className="flex-1"><div className="text-h3">{name}</div></div>
        {currentVersion && (
          <span className="font-mono-data text-[10px] text-[hsl(var(--fg-muted))] border border-[hsl(var(--border-base))] rounded-full px-2 py-0.5">{currentVersion}</span>
        )}
      </div>
      <Pill className="mb-3">{category}</Pill>
      {description && <div className="text-sm text-[hsl(var(--fg-secondary))] leading-relaxed line-clamp-2">{description}</div>}
    </Link>
  )
}
