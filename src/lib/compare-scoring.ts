export type Importance = 'must' | 'important' | 'nice' | 'skip'

export const IMPORTANCE_WEIGHTS: Record<Importance, number> = {
  must: 3,
  important: 2,
  nice: 1,
  skip: 0,
}

export const IMPORTANCE_ORDER: Importance[] = ['must', 'important', 'nice', 'skip']

export const IMPORTANCE_LABEL: Record<Importance, string> = {
  must: 'Must',
  important: 'Important',
  nice: 'Nice',
  skip: 'Skip',
}

export interface ScoringCapability {
  tool_id: string
  capability: string
  category: string
  supported: boolean
  quality_score: number | null
}

export interface ToolRef {
  id: string
  name: string
  slug: string
}

const DEFAULT_QUALITY = 3

function scoreCapability(cap: ScoringCapability, weight: number): number {
  if (weight === 0 || !cap.supported) return 0
  const quality = cap.quality_score ?? DEFAULT_QUALITY
  return weight * quality
}

export function scoreTool(
  toolId: string,
  capabilities: ScoringCapability[],
  weights: Record<string, Importance>,
): number {
  let raw = 0
  let max = 0
  for (const cap of capabilities) {
    if (cap.tool_id !== toolId) continue
    const importance = weights[cap.category] ?? 'nice'
    const weight = IMPORTANCE_WEIGHTS[importance]
    if (weight === 0) continue
    raw += scoreCapability(cap, weight)
    max += weight * 5
  }
  if (max === 0) return 0
  return Math.round((raw / max) * 100)
}

export interface RankedTool extends ToolRef {
  score: number
}

export function rankTools(
  tools: ToolRef[],
  capabilities: ScoringCapability[],
  weights: Record<string, Importance>,
): RankedTool[] {
  return tools
    .map((t) => ({ ...t, score: scoreTool(t.id, capabilities, weights) }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
}

export function uniqueCategories(capabilities: ScoringCapability[]): string[] {
  const seen = new Set<string>()
  const ordered: string[] = []
  for (const cap of capabilities) {
    if (!seen.has(cap.category)) {
      seen.add(cap.category)
      ordered.push(cap.category)
    }
  }
  return ordered
}
