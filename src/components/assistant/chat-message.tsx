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
            ? 'bg-white/10 text-white'
            : 'bg-white/5 text-white/80'
        }`}
      >
        <div className="whitespace-pre-wrap">{content}</div>
        {sources && sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 border-t border-white/10 pt-2">
            {sources.map((source) => (
              <Link
                key={source}
                href={`/learn/${source}`}
                className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/40 hover:text-white/60"
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
