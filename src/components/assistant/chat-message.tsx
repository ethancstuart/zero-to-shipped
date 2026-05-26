import Link from 'next/link'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}

export function ChatMessage({ role, content, sources }: ChatMessageProps) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
          role === 'user'
            ? 'bg-[hsl(var(--bg-muted))] text-[hsl(var(--fg))]'
            : 'bg-[hsl(var(--bg-subtle))] text-[hsl(var(--fg-secondary))]'
        }`}
      >
        <div className="whitespace-pre-wrap">{content}</div>
        {sources && sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 border-t border-[hsl(var(--border-base))] pt-2">
            {sources.map((source) => (
              <Link
                key={source}
                href={`/learn/${source}`}
                className="rounded-full bg-[hsl(var(--bg-muted))] px-2 py-0.5 text-xs text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg-secondary))]"
              >
                {source}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
