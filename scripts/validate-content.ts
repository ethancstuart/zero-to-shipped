/**
 * Content validation script.
 *
 * Walks content/ recursively, parses every MDX file's frontmatter with
 * gray-matter, and validates the shape against a Zod schema derived from
 * src/types/content.ts. Errors fail the build; warnings are informational.
 *
 * Run via: npm run validate-content
 */
import { z } from 'zod'
import matter from 'gray-matter'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const PILLARS = ['pulse', 'build', 'learn', 'system'] as const
const TYPES = [
  'brief',
  'comparison',
  'release',
  'session',
  'challenge',
  'walkthrough',
  'lesson',
  'guide',
  'resource',
  'pattern',
  'playbook',
  'persona',
  'starter',
] as const
const FORMATS = ['video', 'written', 'interactive', 'config'] as const
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const
const STATUSES = ['draft', 'published', 'archived'] as const

// publishedAt can be either an ISO string or a Date object (gray-matter parses
// unquoted YAML dates into Date objects automatically). Accept both, then we
// coerce/check via .refine.
const DateOrString = z
  .union([z.string().min(1), z.date()])
  .refine(
    (value) => {
      const date = value instanceof Date ? value : new Date(value)
      return !Number.isNaN(date.getTime())
    },
    { message: 'must be a valid ISO date string or Date' },
  )

const FrontmatterSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().min(1),
    pillar: z.enum(PILLARS),
    type: z.enum(TYPES),
    format: z.enum(FORMATS),
    difficulty: z.enum(DIFFICULTIES),
    status: z.enum(STATUSES),
    publishedAt: DateOrString,
    estimatedMinutes: z.number().min(0),
    tools: z.array(z.string()),
    tags: z.array(z.string()),
    isPremium: z.boolean(),
    isFeatured: z.boolean(),
    // Optional fields commonly present in our MDX files.
    toolVersions: z.record(z.string(), z.string()).optional(),
    videoUrl: z.string().optional(),
    sandboxTemplate: z.string().optional(),
    sandboxOpenFile: z.string().optional(),
    sandboxTerminalCommand: z.string().optional(),
    collection: z.string().optional(),
    position: z.number().optional(),
    description: z.string().optional(),
  })
  .passthrough()

interface ValidationIssue {
  file: string
  type: 'error' | 'warning'
  message: string
}

function* walkMdxFiles(dir: string): Generator<string> {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      yield* walkMdxFiles(fullPath)
    } else if (entry.endsWith('.mdx')) {
      yield fullPath
    }
  }
}

function validateFile(filepath: string, contentRoot: string): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const rel = relative(contentRoot, filepath)
  const raw = readFileSync(filepath, 'utf-8')
  const { data } = matter(raw)

  const result = FrontmatterSchema.safeParse(data)
  if (!result.success) {
    for (const issue of result.error.issues) {
      issues.push({
        file: rel,
        type: 'error',
        message: `${issue.path.join('.') || '<root>'}: ${issue.message}`,
      })
    }
    return issues
  }

  const fm = result.data

  // Slug should match filename (without .mdx)
  const expectedSlug = filepath.split('/').pop()?.replace(/\.mdx$/, '')
  if (expectedSlug && fm.slug !== expectedSlug) {
    issues.push({
      file: rel,
      type: 'warning',
      message: `slug "${fm.slug}" does not match filename "${expectedSlug}"`,
    })
  }

  if (fm.estimatedMinutes === 0) {
    issues.push({
      file: rel,
      type: 'warning',
      message: 'estimatedMinutes is 0 — consider adding an estimate',
    })
  }
  if (fm.tags.length === 0) {
    issues.push({
      file: rel,
      type: 'warning',
      message: 'no tags specified',
    })
  }
  if ((fm.pillar === 'build' || fm.pillar === 'learn') && fm.tools.length === 0) {
    issues.push({
      file: rel,
      type: 'warning',
      message: `${fm.pillar} content has no tools listed`,
    })
  }

  return issues
}

function main() {
  const contentRoot = join(process.cwd(), 'content')
  let errors = 0
  let warnings = 0
  let files = 0

  for (const filepath of walkMdxFiles(contentRoot)) {
    files++
    const issues = validateFile(filepath, contentRoot)
    for (const issue of issues) {
      if (issue.type === 'error') {
        console.error(`ERROR  ${issue.file}: ${issue.message}`)
        errors++
      } else {
        console.warn(`WARN   ${issue.file}: ${issue.message}`)
        warnings++
      }
    }
  }

  console.log(`\nValidated ${files} files. ${errors} errors, ${warnings} warnings.`)

  if (errors > 0) {
    console.error('\nContent validation FAILED.')
    process.exit(1)
  }
  console.log('Content validation passed.')
}

main()
