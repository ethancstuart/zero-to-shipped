export interface Tool {
  id: string
  name: string
  slug: string
  logo_url: string | null
  website: string | null
  github_repo: string | null
  changelog_url: string | null
  category: 'ide' | 'cli' | 'platform' | 'framework'
  current_version: string | null
  last_release_date: string | null
  description: string | null
  scraper_config: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ToolRelease {
  id: string
  tool_id: string
  version: string
  release_date: string
  summary: string | null
  significance: 'major' | 'minor' | 'patch' | null
  raw_changelog: string | null
  source_url: string | null
  capabilities: string[] | null
  response_hash: string | null
  brief_status: 'pending' | 'draft' | 'published' | 'skipped'
  created_at: string
}

export interface EcosystemStatus {
  id: string
  tool_id: string
  capability: string
  category: string
  supported: boolean
  maturity: 'experimental' | 'beta' | 'stable' | 'mature' | null
  quality_score: number | null
  notes: string | null
  last_verified: string | null
  verified_by: 'automated' | 'manual'
}

export interface PipelineRun {
  id: string
  trigger_type: 'release_detected' | 'manual' | 'scheduled'
  trigger_data: Record<string, unknown> | null
  status: 'running' | 'completed' | 'failed' | 'needs_review'
  total_tokens: number
  total_cost_cents: number
  started_at: string
  completed_at: string | null
  pipeline_steps?: PipelineStep[]
}

export interface PipelineStep {
  id: string
  run_id: string
  step_order: number
  agent_role: 'watcher' | 'analyst' | 'writer' | 'fact_checker' | 'publisher'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  input_summary: string | null
  output_summary: string | null
  full_transcript: Record<string, unknown> | null
  tokens_used: number
  cost_cents: number
  duration_ms: number | null
  error_message: string | null
  started_at: string | null
  completed_at: string | null
}

export interface ContentIndexEntry {
  slug: string
  pillar: string
  content_type: string
  title: string
  tools: string[] | null
  tool_versions: Record<string, string> | null
  status: string
  freshness: 'current' | 'needs_refresh' | 'outdated'
  freshness_checked_at: string | null
  freshness_reason: string | null
  is_premium: boolean
  is_featured: boolean
  published_at: string | null
  indexed_at: string
}
