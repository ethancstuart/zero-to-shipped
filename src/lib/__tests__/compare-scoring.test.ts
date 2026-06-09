import { describe, it, expect } from 'vitest'
import {
  scoreTool,
  rankTools,
  uniqueCategories,
  IMPORTANCE_WEIGHTS,
  type Importance,
  type ScoringCapability,
  type ToolRef,
} from '../compare-scoring'

const tools: ToolRef[] = [
  { id: 't1', name: 'Alpha', slug: 'alpha' },
  { id: 't2', name: 'Beta', slug: 'beta' },
]

const caps: ScoringCapability[] = [
  { tool_id: 't1', capability: 'cap-a', category: 'editor', supported: true, quality_score: 5 },
  { tool_id: 't1', capability: 'cap-b', category: 'agents', supported: true, quality_score: 4 },
  { tool_id: 't1', capability: 'cap-c', category: 'terminal', supported: false, quality_score: 5 },
  { tool_id: 't2', capability: 'cap-a', category: 'editor', supported: true, quality_score: 3 },
  { tool_id: 't2', capability: 'cap-b', category: 'agents', supported: true, quality_score: 5 },
  { tool_id: 't2', capability: 'cap-c', category: 'terminal', supported: true, quality_score: 4 },
]

describe('compare-scoring · scoreTool', () => {
  it('returns 0 when every category is skipped', () => {
    const weights: Record<string, Importance> = { editor: 'skip', agents: 'skip', terminal: 'skip' }
    expect(scoreTool('t1', caps, weights)).toBe(0)
  })

  it('returns 100 when every weighted capability is supported at 5/5', () => {
    const onlyMax: ScoringCapability[] = [
      { tool_id: 't1', capability: 'cap-a', category: 'editor', supported: true, quality_score: 5 },
    ]
    expect(scoreTool('t1', onlyMax, { editor: 'must' })).toBe(100)
  })

  it('zero-weights unsupported capabilities', () => {
    const weights: Record<string, Importance> = { editor: 'nice', agents: 'skip', terminal: 'must' }
    // t1: terminal cap is unsupported → contributes 0 of (3*5)=15 possible; editor 5*1=5 of 5 possible → 5/20 = 25
    expect(scoreTool('t1', caps, weights)).toBe(25)
  })

  it('treats null quality_score as 3', () => {
    const nullQuality: ScoringCapability[] = [
      { tool_id: 't1', capability: 'cap-a', category: 'editor', supported: true, quality_score: null },
    ]
    // raw = 1 * 3 = 3, max = 1 * 5 = 5 → 60
    expect(scoreTool('t1', nullQuality, { editor: 'nice' })).toBe(60)
  })

  it('defaults missing category weight to nice', () => {
    const onlyCap: ScoringCapability[] = [
      { tool_id: 't1', capability: 'cap-a', category: 'editor', supported: true, quality_score: 5 },
    ]
    expect(scoreTool('t1', onlyCap, {})).toBe(100)
  })

  it('exposes a meaningful importance ladder', () => {
    expect(IMPORTANCE_WEIGHTS.must).toBeGreaterThan(IMPORTANCE_WEIGHTS.important)
    expect(IMPORTANCE_WEIGHTS.important).toBeGreaterThan(IMPORTANCE_WEIGHTS.nice)
    expect(IMPORTANCE_WEIGHTS.nice).toBeGreaterThan(IMPORTANCE_WEIGHTS.skip)
    expect(IMPORTANCE_WEIGHTS.skip).toBe(0)
  })
})

describe('compare-scoring · rankTools', () => {
  it('orders tools by score descending', () => {
    const weights: Record<string, Importance> = {
      editor: 'must',
      agents: 'nice',
      terminal: 'skip',
    }
    const ranked = rankTools(tools, caps, weights)
    expect(ranked[0].id).toBe('t1') // editor 5/5 must outweighs t2 editor 3/5 must
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score)
  })

  it('flips winner when priorities shift', () => {
    const weights: Record<string, Importance> = {
      editor: 'skip',
      agents: 'nice',
      terminal: 'must',
    }
    const ranked = rankTools(tools, caps, weights)
    // t1 has unsupported terminal; t2 has supported terminal at 4/5 → t2 wins
    expect(ranked[0].id).toBe('t2')
  })

  it('breaks score ties by name alphabetically', () => {
    const tieCaps: ScoringCapability[] = [
      { tool_id: 't1', capability: 'cap-a', category: 'editor', supported: true, quality_score: 5 },
      { tool_id: 't2', capability: 'cap-a', category: 'editor', supported: true, quality_score: 5 },
    ]
    const ranked = rankTools(tools, tieCaps, { editor: 'must' })
    expect(ranked[0].score).toBe(ranked[1].score)
    expect(ranked[0].name).toBe('Alpha')
  })
})

describe('compare-scoring · uniqueCategories', () => {
  it('preserves first-seen order and dedupes', () => {
    expect(uniqueCategories(caps)).toEqual(['editor', 'agents', 'terminal'])
  })
})
