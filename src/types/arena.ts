export interface ArenaChallenge {
  id: string
  slug: string
  title: string
  description: string
  task_spec: string
  time_limit_minutes: number | null
  created_at: string
  arena_entries?: ArenaEntry[]
}

export interface ArenaEntry {
  id: string
  challenge_id: string
  tool_id: string
  video_url: string | null
  duration_seconds: number | null
  lines_of_code: number | null
  prompt_count: number | null
  iteration_count: number | null
  result_score: number | null
  starter_repo_url: string | null
  final_repo_url: string | null
  builder_experience: 'beginner' | 'intermediate' | 'advanced' | null
  created_at: string
  tools?: { name: string; slug: string }
}

export interface ArenaVote {
  user_id: string
  challenge_id: string
  tool_id: string
  created_at: string
}
