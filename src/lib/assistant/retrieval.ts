import { createClient } from '@supabase/supabase-js'
import { generateEmbedding } from './embeddings'
import { getRelatedNodes } from '@/lib/graph/queries'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface VectorResult {
  content_slug: string
  chunk_text: string
  heading_path: string | null
  metadata: Record<string, unknown> | null
  similarity: number
}

export async function retrieveContext(query: string, limit: number = 5) {
  const queryEmbedding = await generateEmbedding(query)

  const { data: vectorResults } = await supabase.rpc('match_embeddings', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: 0.7,
    match_count: limit,
  })

  if (!vectorResults || vectorResults.length === 0) {
    return { vectorResults: [], graphContext: [], sources: [] }
  }

  const typedResults = vectorResults as VectorResult[]
  const slugs = [...new Set(typedResults.map((r) => r.content_slug))]

  // Graph augmentation: get related nodes for top results
  const graphContext = []
  for (const slug of slugs.slice(0, 3)) {
    try {
      const related = await getRelatedNodes(slug, 1)
      graphContext.push(...related)
    } catch {
      // Skip if node not in graph
    }
  }

  return {
    vectorResults: typedResults,
    graphContext,
    sources: slugs,
  }
}
