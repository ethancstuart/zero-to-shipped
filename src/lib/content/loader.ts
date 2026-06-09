import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import type { Element, Root } from 'hast'
import type { ContentFrontmatter, ContentListItem, Pillar } from '@/types/content'

/**
 * Rehype plugin: ensure GFM task-list checkboxes are accessible.
 *
 * remark-gfm renders `- [ ]` lines as `<input type="checkbox" disabled>` with
 * no label, which fails WCAG 4.1.2 (axe rule: `label`). We attach an
 * `aria-label` derived from the list item's text content so screen readers
 * announce the checkbox meaningfully. We also mark scrollable `<pre>` blocks
 * as keyboard-focusable regions (WCAG 2.1.1).
 */
function rehypeAccessibility() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, _index, parent) => {
      // Task-list checkbox: <input type="checkbox" disabled> inside an <li>
      if (
        node.tagName === 'input' &&
        node.properties?.type === 'checkbox' &&
        parent &&
        (parent as Element).tagName === 'li'
      ) {
        const li = parent as Element
        const text = extractText(li).trim()
        const isChecked = node.properties?.checked === true
        node.properties = {
          ...node.properties,
          'aria-label': text
            ? `${isChecked ? 'Completed' : 'Checklist item'}: ${text}`
            : isChecked
              ? 'Completed checklist item'
              : 'Checklist item',
        }
      }

      // Code blocks: <pre> elements need to be keyboard-focusable so
      // sighted keyboard users can scroll overflowing code.
      if (node.tagName === 'pre') {
        node.properties = {
          ...(node.properties ?? {}),
          tabIndex: 0,
          role: 'region',
          'aria-label':
            (node.properties?.['aria-label'] as string | undefined) ?? 'Code block',
        }
      }
    })
  }
}

function extractText(node: Element): string {
  let out = ''
  for (const child of node.children ?? []) {
    if (child.type === 'text') {
      out += child.value
    } else if (child.type === 'element') {
      out += extractText(child as Element)
    }
  }
  return out
}

const CONTENT_DIR = path.join(process.cwd(), 'content')

async function walkDir(dir: string): Promise<string[]> {
  const results: string[] = []
  let names: string[]
  try {
    names = await fs.readdir(dir)
  } catch {
    return results
  }
  for (const name of names) {
    const fullPath = path.join(dir, name)
    const stat = await fs.stat(fullPath)
    if (stat.isDirectory()) {
      results.push(...(await walkDir(fullPath)))
    } else if (name.endsWith('.mdx')) {
      results.push(fullPath)
    }
  }
  return results
}

export async function getContentFrontmatter(
  filePath: string,
): Promise<ContentFrontmatter> {
  const raw = await fs.readFile(filePath, 'utf-8')
  const { data } = matter(raw)
  return data as ContentFrontmatter
}

export async function getContentBySlug(
  pillar: Pillar,
  slug: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components: Record<string, React.ComponentType<any>> = {},
) {
  const pillarDir = path.join(CONTENT_DIR, pillar)
  const files = await walkDir(pillarDir)
  const filePath = files.find((f) => {
    const basename = path.basename(f, '.mdx')
    return basename === slug
  })

  if (!filePath) return null

  const raw = await fs.readFile(filePath, 'utf-8')
  const { content: mdxSource, data } = matter(raw)
  const frontmatter = data as ContentFrontmatter

  if (frontmatter.status !== 'published') return null

  const { content } = await compileMDX<ContentFrontmatter>({
    source: mdxSource,
    components,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeAccessibility],
      },
    },
  })

  return { frontmatter, content }
}

export async function listContentByPillar(
  pillar: Pillar,
  options?: {
    type?: string
    featured?: boolean
    limit?: number
    tag?: string
  },
): Promise<ContentListItem[]> {
  const pillarDir = path.join(CONTENT_DIR, pillar)
  const files = await walkDir(pillarDir)

  const items: ContentListItem[] = await Promise.all(
    files.map(async (filePath) => {
      const frontmatter = await getContentFrontmatter(filePath)
      return { frontmatter, filePath }
    }),
  )

  let filtered = items.filter((i) => i.frontmatter.status === 'published')

  if (options?.type) {
    filtered = filtered.filter((i) => i.frontmatter.type === options.type)
  }
  if (options?.featured) {
    filtered = filtered.filter((i) => i.frontmatter.isFeatured)
  }
  if (options?.tag) {
    filtered = filtered.filter((i) => i.frontmatter.tags.includes(options.tag!))
  }

  filtered.sort(
    (a, b) =>
      new Date(b.frontmatter.publishedAt).getTime() -
      new Date(a.frontmatter.publishedAt).getTime(),
  )

  if (options?.limit) {
    filtered = filtered.slice(0, options.limit)
  }

  return filtered
}

export async function listAllContent(): Promise<ContentListItem[]> {
  const allItems: ContentListItem[] = []
  for (const pillar of ['pulse', 'build', 'learn', 'system'] as const) {
    const items = await listContentByPillar(pillar)
    allItems.push(...items)
  }
  allItems.sort(
    (a, b) =>
      new Date(b.frontmatter.publishedAt).getTime() -
      new Date(a.frontmatter.publishedAt).getTime(),
  )
  return allItems
}

export async function getContentSlugs(pillar: Pillar): Promise<string[]> {
  const pillarDir = path.join(CONTENT_DIR, pillar)
  const files = await walkDir(pillarDir)
  return files.map((f) => path.basename(f, '.mdx'))
}
