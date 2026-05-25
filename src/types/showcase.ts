export interface ShowcaseProject {
  id: string
  user_id: string | null
  title: string
  url: string | null
  description: string
  screenshot_url: string | null
  github_url: string | null
  build_time_minutes: number | null
  builder_experience: 'beginner' | 'intermediate' | 'advanced' | null
  status: 'pending' | 'published' | 'rejected'
  upvotes: number
  published_at: string | null
  created_at: string
  showcase_project_tools?: { tool_id: string; tools?: { name: string; slug: string } }[]
}
