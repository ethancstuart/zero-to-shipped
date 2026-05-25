import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import type { ContentFrontmatter, ContentListItem, Pillar } from '@/types/content'

const CONTENT_DIR = path.join(process.cwd(), 'content')

async function walkDir(dir: string): Promise<string[]> {
  const results: string[] = []
  let entries: Awaited<ReturnType<typeof fs.readdir>>
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return results
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...(await walkDir(fullPath)))
    } else if (entry.name.endsWith('.mdx')) {
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
