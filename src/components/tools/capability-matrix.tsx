interface Tool {
  id: string
  name: string
  slug: string
}

interface Capability {
  tool_id: string
  capability: string
  category: string
  supported: boolean
  maturity: string | null
  quality_score: number | null
}

interface CapabilityMatrixProps {
  tools: Tool[]
  capabilities: Capability[]
}

export function CapabilityMatrix({ tools, capabilities }: CapabilityMatrixProps) {
  // Group capabilities by category, then by capability name
  const categories: Record<string, string[]> = {}
  for (const cap of capabilities) {
    if (!categories[cap.category]) categories[cap.category] = []
    if (!categories[cap.category].includes(cap.capability)) {
      categories[cap.category].push(cap.capability)
    }
  }

  const getCapability = (toolId: string, capName: string) =>
    capabilities.find((c) => c.tool_id === toolId && c.capability === capName)

  if (tools.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[hsl(var(--border-base))] p-12 text-center text-[hsl(var(--fg-faint))]">
        Select tools above to compare capabilities
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 bg-[hsl(var(--bg))]/95 backdrop-blur-sm px-4 py-3 text-left text-sm font-medium text-[hsl(var(--fg-muted))]">
              Capability
            </th>
            {tools.map((tool) => (
              <th
                key={tool.id}
                className="px-4 py-3 text-center text-sm font-medium text-[hsl(var(--fg))]"
              >
                <a href={`/tools/${tool.slug}`} className="hover:underline">
                  {tool.name}
                </a>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(categories).map(([category, capNames]) => (
            <>
              <tr key={`cat-${category}`}>
                <td
                  colSpan={tools.length + 1}
                  className="border-t border-[hsl(var(--border-base))] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[hsl(var(--fg-faint))]"
                >
                  {category}
                </td>
              </tr>
              {capNames.map((capName) => (
                <tr key={capName} className="border-t border-[hsl(var(--border-base))]">
                  <td className="sticky left-0 bg-[hsl(var(--bg))]/95 backdrop-blur-sm px-4 py-2.5 text-sm text-[hsl(var(--fg-secondary))]">
                    {capName}
                  </td>
                  {tools.map((tool) => {
                    const cap = getCapability(tool.id, capName)
                    return (
                      <td key={tool.id} className="px-4 py-2.5 text-center">
                        {cap ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className={cap.supported ? 'text-green-400' : 'text-[hsl(var(--fg-faint))]'}>
                              {cap.supported ? '✓' : '✗'}
                            </span>
                            {cap.quality_score && (
                              <span className="text-xs text-[hsl(var(--fg-faint))]">
                                {cap.quality_score}/5
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[hsl(var(--fg-faint))]">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
