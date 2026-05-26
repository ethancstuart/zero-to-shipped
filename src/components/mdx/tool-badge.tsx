interface ToolBadgeProps {
  name: string
  version?: string
}

export function ToolBadge({ name, version }: ToolBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border-base))] bg-[hsl(var(--bg-muted))] px-3 py-1 text-xs font-medium text-[hsl(var(--fg-secondary))]">
      <span>{name}</span>
      {version && (
        <span className="text-[hsl(var(--fg-muted))]">v{version}</span>
      )}
    </span>
  )
}
