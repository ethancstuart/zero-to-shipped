interface ToolBadgeProps {
  name: string
  version?: string
}

export function ToolBadge({ name, version }: ToolBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
      <span>{name}</span>
      {version && (
        <span className="text-white/40">v{version}</span>
      )}
    </span>
  )
}
