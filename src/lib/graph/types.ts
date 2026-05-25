export interface KnowledgeNode {
  id: string
  node_type: 'tool' | 'capability' | 'concept' | 'content' | 'project' | 'persona'
  slug: string
  title: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface KnowledgeEdge {
  source_id: string
  target_id: string
  relationship: 'requires' | 'teaches' | 'uses' | 'enables' | 'compares' | 'built_with' | 'related'
  weight: number
  metadata: Record<string, unknown> | null
}

export interface GraphTraversalResult {
  node: KnowledgeNode
  edges: (KnowledgeEdge & { target?: KnowledgeNode })[]
  depth: number
}
