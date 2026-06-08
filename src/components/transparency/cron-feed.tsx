interface CronRun {
  id?: string
  cron_name: string
  started_at: string
  completed_at: string | null
  status: string
  duration_ms: number | null
}

interface CronFeedProps {
  runs: CronRun[]
}

function statusDot(status: string): { color: string; label: string } {
  switch (status) {
    case 'completed':
    case 'success':
      return { color: 'bg-emerald-500', label: 'completed' }
    case 'failed':
    case 'error':
      return { color: 'bg-red-500', label: 'failed' }
    case 'running':
      return { color: 'bg-amber-500', label: 'running' }
    default:
      return { color: 'bg-[hsl(var(--fg-muted))]', label: status }
  }
}

function formatDuration(ms: number | null): string {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms}ms`
  const s = ms / 1000
  if (s < 60) return `${s.toFixed(1)}s`
  return `${(s / 60).toFixed(1)}m`
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function CronFeed({ runs }: CronFeedProps) {
  if (runs.length === 0) {
    return (
      <p className="text-sm text-[hsl(var(--fg-faint))]">No cron runs recorded yet.</p>
    )
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border-base))]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[hsl(var(--border-base))] bg-[hsl(var(--bg-subtle))] text-left text-xs text-[hsl(var(--fg-muted))]">
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Job</th>
            <th className="px-4 py-2 font-medium">Started</th>
            <th className="px-4 py-2 text-right font-medium">Duration</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run, i) => {
            const dot = statusDot(run.status)
            return (
              <tr
                key={run.id ?? `${run.cron_name}-${run.started_at}-${i}`}
                className="border-b border-[hsl(var(--border-base))] last:border-b-0"
              >
                <td className="px-4 py-2">
                  <div className="inline-flex items-center gap-2">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${dot.color}`}
                      aria-hidden
                    />
                    <span className="text-xs text-[hsl(var(--fg-secondary))] capitalize">
                      {dot.label}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 font-mono-data text-xs text-[hsl(var(--fg-secondary))]">
                  {run.cron_name}
                </td>
                <td className="px-4 py-2 text-xs text-[hsl(var(--fg-muted))]">
                  {formatTime(run.started_at)}
                </td>
                <td className="px-4 py-2 text-right font-mono-data text-xs text-[hsl(var(--fg-muted))]">
                  {formatDuration(run.duration_ms)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
