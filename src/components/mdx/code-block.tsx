import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  // MDX delivers children in several shapes depending on whether the author
  // wrapped the content in `{`...`}` (string), used bare text (array of
  // strings/whitespace), or accidentally nested a single child. Accept any
  // shape and normalize before handing off to shiki.
  children: React.ReactNode
  language?: string
  filename?: string
}

function toCodeString(children: React.ReactNode): string {
  if (children == null) return ''
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(toCodeString).join('')
  // React element wrapping (rare with our content but harmless to guard).
  if (
    typeof children === 'object' &&
    children !== null &&
    'props' in children &&
    typeof (children as { props?: { children?: unknown } }).props === 'object'
  ) {
    const inner = (children as { props: { children?: React.ReactNode } }).props.children
    return toCodeString(inner)
  }
  return ''
}

export async function CodeBlock({
  children,
  language = 'typescript',
  filename,
}: CodeBlockProps) {
  const source = toCodeString(children).trim()

  const html = await codeToHtml(source, {
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
        role="region"
        aria-label={filename ? `Code block: ${filename}` : 'Code block'}
        tabIndex={0}
        className="overflow-x-auto p-4 text-sm [&_pre]:!bg-transparent [&_code]:!bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent-hsl))]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
