import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  children: string
  language?: string
  filename?: string
}

export async function CodeBlock({
  children,
  language = 'typescript',
  filename,
}: CodeBlockProps) {
  const html = await codeToHtml(children.trim(), {
    lang: language,
    theme: 'github-dark',
  })

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-[hsl(var(--border-base))]">
      {filename && (
        <div className="border-b border-[hsl(var(--border-base))] bg-[hsl(var(--bg-muted))] px-4 py-2 text-xs text-[hsl(var(--fg-muted))]">
          {filename}
        </div>
      )}
      <div
        className="overflow-x-auto p-4 text-sm [&_pre]:!bg-transparent [&_code]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
