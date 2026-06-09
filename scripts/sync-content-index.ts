import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

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
    if (stat.isDirectory()) results.push(...(await walkDir(fullPath)))
    else if (name.endsWith('.mdx')) results.push(fullPath)
  }
  return results
}

async function sync() {
  const files = await walkDir(CONTENT_DIR)
  let synced = 0
  let skipped = 0

  for (const filePath of files) {
    const raw = await fs.readFile(filePath, 'utf-8')
    const { data } = matter(raw)

    if (!data.slug || !data.pillar) {
      skipped++
      continue
    }

    // `description` in MDX frontmatter is the canonical short blurb. We
    // populate both `summary` (used by /api/v1/pulse and listing UIs) and
    // `description` so consumers that expect either column get a non-null
    // value when a piece of content is missing one of them.
    const summary = data.description ?? data.summary ?? null

    const { error } = await supabase.from('content_index').upsert(
      {
        slug: data.slug,
        pillar: data.pillar,
        content_type: data.type,
        title: data.title,
        summary,
        description: data.description ?? summary,
        tools: data.tools || [],
        tool_versions: data.toolVersions || {},
        tags: data.tags || [],
        format: data.format ?? null,
        difficulty: data.difficulty ?? null,
        estimated_minutes: data.estimatedMinutes ?? null,
        external_url: data.externalUrl ?? null,
        status: data.status,
        is_premium: data.isPremium || false,
        is_featured: data.isFeatured || false,
        published_at: data.publishedAt,
        indexed_at: new Date().toISOString(),
      },
      { onConflict: 'slug' },
    )

    if (error) {
      console.error(`Error syncing ${data.slug}:`, error.message)
    } else {
      synced++
    }
  }

  console.log(`Synced ${synced} content items to content_index (${skipped} skipped)`)
}

sync()
