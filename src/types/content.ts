export const PILLARS = ['pulse', 'build', 'learn', 'system'] as const
export type Pillar = (typeof PILLARS)[number]

export const CONTENT_TYPES = [
  'brief', 'comparison', 'release',
  'session', 'challenge', 'walkthrough',
  'lesson', 'guide', 'pattern', 'resource',
  'persona', 'starter', 'playbook',
] as const
export type ContentType = (typeof CONTENT_TYPES)[number]

export const FORMATS = ['video', 'written', 'interactive', 'config'] as const
export type ContentFormat = (typeof FORMATS)[number]

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export const STATUSES = ['draft', 'published', 'archived'] as const
export type ContentStatus = (typeof STATUSES)[number]

export interface ContentFrontmatter {
  title: string
  slug: string
  pillar: Pillar
  type: ContentType
  format: ContentFormat
  tools: string[]
  toolVersions: Record<string, string>
  difficulty: Difficulty
  estimatedMinutes: number
  tags: string[]
  isPremium: boolean
  isFeatured: boolean
  status: ContentStatus
  videoUrl?: string
  sandboxTemplate?: string
  sandboxOpenFile?: string
  sandboxTerminalCommand?: string
  collection?: string
  position?: number
  publishedAt: string
}

export interface ContentListItem {
  frontmatter: ContentFrontmatter
  filePath: string
}
