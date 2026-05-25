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
    <div className="my-6 overflow-hidden rounded-lg border border-white/10">
      {filename && (
        <div className="border-b border-white/10 bg-white/5 px-4 py-2 text-xs text-white/50">
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
