'use client'

import { StaggerGrid } from '@/components/motion/stagger-grid'
import { cn } from '@/lib/utils'

interface RecentRelease {
  toolName: string
  version: string
  color: string
}

interface BentoGridProps {
  recentReleases: RecentRelease[]
}

/* -----------------------------------------------------------------------
   Individual Tiles
   ----------------------------------------------------------------------- */

function AgentReplayTile() {
  const steps = [
    'Watcher detected new release',
    'Analyst extracted capabilities',
    'Writer drafted brief',
    'Fact-Checker verified claims',
    'Publisher pushed to Pulse',
  ]

  return (
    <div className="col-span-1 row-span-2 sm:col-span-2 lg:col-span-2 lg:row-span-2 rounded-2xl border border-[hsl(var(--border-base))] p-8 flex flex-col justify-between overflow-hidden">
      <div>
        <div className="font-mono-data text-[10px] tracking-wider text-[hsl(var(--fg-faint))] uppercase mb-3">
          Agent Replay
        </div>
        <h3 className="text-h3 mb-6">Multi-agent pipeline</h3>
      </div>
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <div
            key={step}
            className="flex items-center gap-3 opacity-0"
            style={{
              animation: `bentoStepReveal 0.5s ease-out ${i * 0.15}s forwards`,
            }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--bg-muted))] font-mono-data text-[10px] text-[hsl(var(--fg-muted))]">
              {i + 1}
            </span>
            <span className="text-sm text-[hsl(var(--fg-secondary))]">{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ToolIntelligenceTile() {
  const cells = Array.from({ length: 24 }, (_, i) => i)
  const activeCells = [2, 5, 7, 9, 11, 14, 17, 19, 22]

  return (
    <div className="col-span-1 sm:col-span-2 lg:col-span-2 rounded-2xl border border-[hsl(var(--border-base))] p-8 overflow-hidden">
      <div className="font-mono-data text-[10px] tracking-wider text-[hsl(var(--fg-faint))] uppercase mb-3">
        Tool Intelligence
      </div>
      <h3 className="text-h3 mb-6">Capability heatmap</h3>
      <div className="grid grid-cols-8 gap-1.5">
        {cells.map((i) => {
          const isActive = activeCells.includes(i)
          return (
            <div
              key={i}
              className={cn(
                'h-5 rounded-sm transition-colors duration-300',
                isActive
                  ? 'bg-[hsl(var(--pillar-pulse))]'
                  : 'bg-[hsl(var(--bg-muted))]'
              )}
              style={isActive ? { animation: `bentoPulse 2s ease-in-out ${i * 0.1}s infinite` } : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}

function TransparencyTile() {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border-base))] p-8 flex flex-col justify-between">
      <div className="font-mono-data text-[10px] tracking-wider text-[hsl(var(--fg-faint))] uppercase mb-3">
        Transparency
      </div>
      <div>
        <div className="font-display text-3xl font-light tracking-tight text-[hsl(var(--fg))]">
          $0.00
        </div>
        <div className="font-mono-data text-[10px] text-[hsl(var(--fg-muted))] mt-1">platform cost</div>
      </div>
    </div>
  )
}

function OpenApiTile() {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border-base))] p-8 flex flex-col justify-between">
      <div className="font-mono-data text-[10px] tracking-wider text-[hsl(var(--fg-faint))] uppercase mb-3">
        Open API
      </div>
      <div>
        <div className="font-display text-3xl font-light tracking-tight text-[hsl(var(--fg))]">
          12
        </div>
        <div className="font-mono-data text-[10px] text-[hsl(var(--fg-muted))] mt-1">endpoints</div>
      </div>
    </div>
  )
}

function LiveFeedTile({ releases }: { releases: RecentRelease[] }) {
  const items = releases.length > 0 ? releases : [
    { toolName: 'Claude', version: '4.7', color: 'hsl(var(--pillar-pulse))' },
    { toolName: 'Cursor', version: '0.51', color: 'hsl(var(--pillar-build))' },
    { toolName: 'v0', version: '2.3', color: 'hsl(var(--pillar-learn))' },
    { toolName: 'Bolt', version: '1.2', color: 'hsl(var(--pillar-system))' },
  ]

  // Duplicate for seamless loop
  const doubled = [...items, ...items]

  return (
    <div className="col-span-1 sm:col-span-2 lg:col-span-2 rounded-2xl border border-[hsl(var(--border-base))] p-8 overflow-hidden">
      <div className="font-mono-data text-[10px] tracking-wider text-[hsl(var(--fg-faint))] uppercase mb-4">
        Live Feed
      </div>
      <div className="relative overflow-hidden">
        <div
          className="flex gap-6 whitespace-nowrap"
          style={{
            animation: 'bentoTicker 20s linear infinite',
            width: 'max-content',
          }}
        >
          {doubled.map((item, i) => (
            <span key={`${item.toolName}-${i}`} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[hsl(var(--fg-secondary))]">{item.toolName}</span>
              <span className="font-mono-data text-[10px] text-[hsl(var(--fg-muted))]">v{item.version}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -----------------------------------------------------------------------
   BentoGrid
   ----------------------------------------------------------------------- */

export function BentoGrid({ recentReleases }: BentoGridProps) {
  return (
    <>
      <style jsx global>{`
        @keyframes bentoStepReveal {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bentoPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
        @keyframes bentoTicker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
      <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-10" stagger={0.08}>
        <AgentReplayTile />
        <ToolIntelligenceTile />
        <TransparencyTile />
        <OpenApiTile />
        <LiveFeedTile releases={recentReleases} />
      </StaggerGrid>
    </>
  )
}
