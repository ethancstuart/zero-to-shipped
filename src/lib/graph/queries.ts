import { createClient } from '@supabase/supabase-js'
import type { KnowledgeNode, KnowledgeEdge, GraphTraversalResult } from './types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function getRelatedNodes(
  slug: string,
  maxDepth: number = 2,
): Promise<GraphTraversalResult[]> {
  const visited = new Set<string>()
  const queue: { slug: string; depth: number }[] = [{ slug, depth: 0 }]
  const results: GraphTraversalResult[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current.slug) || current.depth > maxDepth) continue
    visited.add(current.slug)

    const { data: node } = await supabase
      .from('knowledge_nodes')
      .select('*')
      .eq('slug', current.slug)
      .single()

    if (!node) continue

    const { data: edges } = await supabase
      .from('knowledge_edges')
      .select('*, target:target_id(*)')
      .eq('source_id', node.id)

    type EdgeWithTarget = KnowledgeEdge & { target?: KnowledgeNode }
    const typedEdges = (edges || []) as EdgeWithTarget[]

    results.push({
      node: node as KnowledgeNode,
      edges: typedEdges,
      depth: current.depth,
    })

    for (const edge of typedEdges) {
      if (edge.target && !visited.has(edge.target.slug)) {
        queue.push({ slug: edge.target.slug, depth: current.depth + 1 })
      }
    }
  }

  return results
}

export async function getPrerequisites(contentSlug: string): Promise<KnowledgeNode[]> {
  const { data: node } = await supabase
    .from('knowledge_nodes')
    .select('id')
    .eq('slug', contentSlug)
    .single()

  if (!node) return []

  const { data: edges } = await supabase
    .from('knowledge_edges')
    .select('*, source:source_id(*)')
    .eq('target_id', node.id)
    .eq('relationship', 'requires')

  type EdgeWithSource = KnowledgeEdge & { source?: KnowledgeNode }
  return (edges || [] as EdgeWithSource[])
    .map((e: EdgeWithSource) => e.source)
    .filter((s): s is KnowledgeNode => s !== undefined && s !== null)
}

export async function getNodesByType(nodeType: string): Promise<KnowledgeNode[]> {
  const { data } = await supabase
    .from('knowledge_nodes')
    .select('*')
    .eq('node_type', nodeType)
    .order('title')

  return (data || []) as KnowledgeNode[]
}
