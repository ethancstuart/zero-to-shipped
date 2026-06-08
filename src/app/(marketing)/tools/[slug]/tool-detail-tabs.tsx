'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Pill } from '@/components/shared/pill'

interface Release {
  id: string
  version: string
  release_date: string
  summary: string | null
  significance: string | null
  source_url: string | null
}

interface Capability {
  capability: string
  category: string
  supported: boolean
  maturity: string | null
  quality_score: number | null
}

interface ToolDetailTabsProps {
  tool: {
    description: string | null
    website: string | null
    category: string
  }
  releases: Release[]
  capsByCategory: Record<string, Capability[]>
}

export function ToolDetailTabs({
  tool,
  releases,
  capsByCategory,
}: ToolDetailTabsProps) {
  const hasReleases = releases.length > 0
  const hasCaps = Object.keys(capsByCategory).length > 0

  return (
    <Tabs defaultValue={0}>
      <TabsList variant="line" className="sticky top-0 z-20 mb-6 border-b border-[hsl(var(--border-base))] bg-[hsl(var(--bg))] pb-px">
        <TabsTrigger
          value={0}
          className="text-xs uppercase tracking-wider"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger
          value={1}
          className="text-xs uppercase tracking-wider"
        >
          Releases
        </TabsTrigger>
        <TabsTrigger
          value={2}
          className="text-xs uppercase tracking-wider"
        >
          Capabilities
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value={0}>
        <div className="space-y-6">
          {tool.description && (
            <div>
              <h3 className="text-h3 mb-2">About</h3>
              <p className="text-sm leading-relaxed text-[hsl(var(--fg-secondary))]">
                {tool.description}
              </p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Pill>{tool.category}</Pill>
            {tool.website && (
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[hsl(var(--fg-muted))] underline underline-offset-2 transition-colors hover:text-[hsl(var(--fg-secondary))]"
              >
                Visit website
              </a>
            )}
          </div>
        </div>
      </TabsContent>

      {/* Releases Tab */}
      <TabsContent value={1}>
        {hasReleases ? (
          <div className="relative space-y-0">
            {/* Vertical timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[hsl(var(--border-base))]" />

            {releases.map((release) => (
              <div key={release.id}>
                <div className="relative flex gap-5 py-4">
                  {/* Timeline dot */}
                  <div className="relative z-10 mt-1.5 h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-[hsl(var(--border-base))] bg-[hsl(var(--bg))]" />

                  <div className="flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="font-mono-data text-sm font-semibold text-[hsl(var(--fg))]">
                        v{release.version}
                      </span>
                      {release.significance && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            release.significance === 'major'
                              ? 'bg-[hsl(var(--accent-hsl)/0.1)] text-[hsl(var(--accent-hsl))]'
                              : release.significance === 'minor'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-[hsl(var(--bg-muted))] text-[hsl(var(--fg-muted))]'
                          }`}
                        >
                          {release.significance}
                        </span>
                      )}
                      <span className="font-mono-data text-[10px] text-[hsl(var(--fg-faint))]">
                        {new Date(release.release_date).toLocaleDateString(
                          'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </span>
                    </div>
                    {release.summary && (
                      <p className="text-sm leading-relaxed text-[hsl(var(--fg-secondary))]">
                        {release.summary}
                      </p>
                    )}
                    {release.source_url && (
                      <a
                        href={release.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs text-[hsl(var(--fg-muted))] underline underline-offset-2 hover:text-[hsl(var(--fg-secondary))]"
                      >
                        View release
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border-base))] p-12 text-center">
            <p className="font-mono-data text-sm text-[hsl(var(--fg-muted))]">
              No releases tracked yet.
            </p>
          </div>
        )}
      </TabsContent>

      {/* Capabilities Tab */}
      <TabsContent value={2}>
        {hasCaps ? (
          <div className="space-y-8">
            {Object.entries(capsByCategory).map(([category, caps]) => (
              <div key={category}>
                <h3 className="mb-3 text-[10px] font-medium uppercase tracking-[2px] text-[hsl(var(--fg-muted))]">
                  {category}
                </h3>
                <div className="space-y-1.5">
                  {caps.map((cap) => (
                    <div
                      key={cap.capability}
                      className="flex items-center justify-between rounded-lg border border-[hsl(var(--border-base))] px-4 py-3 transition-colors hover:border-[hsl(var(--border-hover))]"
                    >
                      <span className="text-sm text-[hsl(var(--fg))]">
                        {cap.capability}
                      </span>
                      <div className="flex items-center gap-3">
                        {/* Supported / not supported */}
                        <span
                          className={`text-xs font-medium ${
                            cap.supported
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-[hsl(var(--fg-faint))]'
                          }`}
                        >
                          {cap.supported ? '✓' : '✗'}
                        </span>
                        {/* Quality score bar */}
                        {cap.quality_score != null && (
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-1.5 w-3 rounded-sm ${
                                  i < cap.quality_score!
                                    ? 'bg-[hsl(var(--accent-hsl))]'
                                    : 'bg-[hsl(var(--border-base))]'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        {cap.maturity && (
                          <Pill className="text-[9px]">{cap.maturity}</Pill>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border-base))] p-12 text-center">
            <p className="font-mono-data text-sm text-[hsl(var(--fg-muted))]">
              No capabilities tracked yet.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
