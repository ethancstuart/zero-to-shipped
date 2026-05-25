import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const tools = [
  {
    name: 'Claude Code',
    slug: 'claude-code',
    website: 'https://claude.ai/code',
    github_repo: 'anthropics/claude-code',
    changelog_url: 'https://github.com/anthropics/claude-code/releases',
    category: 'cli' as const,
    description: "Anthropic's agentic coding tool for the terminal",
    scraper_config: { type: 'github_releases', owner: 'anthropics', repo: 'claude-code' },
  },
  {
    name: 'Cursor',
    slug: 'cursor',
    website: 'https://cursor.com',
    changelog_url: 'https://cursor.com/changelog',
    category: 'ide' as const,
    description: 'AI-first code editor built on VS Code',
    scraper_config: { type: 'html_scrape', url: 'https://cursor.com/changelog', selector: 'article' },
  },
  {
    name: 'Gemini CLI',
    slug: 'gemini-cli',
    website: 'https://github.com/google-gemini/gemini-cli',
    github_repo: 'google-gemini/gemini-cli',
    changelog_url: 'https://github.com/google-gemini/gemini-cli/releases',
    category: 'cli' as const,
    description: "Google's AI coding agent for the terminal",
    scraper_config: { type: 'github_releases', owner: 'google-gemini', repo: 'gemini-cli' },
  },
  {
    name: 'Codex',
    slug: 'codex',
    website: 'https://github.com/openai/codex',
    github_repo: 'openai/codex',
    changelog_url: 'https://github.com/openai/codex/releases',
    category: 'cli' as const,
    description: "OpenAI's coding agent",
    scraper_config: { type: 'github_releases', owner: 'openai', repo: 'codex' },
  },
  {
    name: 'v0',
    slug: 'v0',
    website: 'https://v0.dev',
    changelog_url: 'https://v0.dev/changelog',
    category: 'platform' as const,
    description: "Vercel's AI UI generation tool",
    scraper_config: { type: 'html_scrape', url: 'https://v0.dev/changelog', selector: 'article' },
  },
  {
    name: 'Windsurf',
    slug: 'windsurf',
    website: 'https://windsurf.com',
    changelog_url: 'https://windsurf.com/changelog',
    category: 'ide' as const,
    description: 'AI-powered IDE by Codeium',
    scraper_config: { type: 'html_scrape', url: 'https://windsurf.com/changelog', selector: 'article' },
  },
  {
    name: 'Bolt',
    slug: 'bolt',
    website: 'https://bolt.new',
    category: 'platform' as const,
    description: 'AI-powered full-stack web development platform',
    scraper_config: { type: 'html_scrape', url: 'https://bolt.new/changelog', selector: 'article' },
  },
  {
    name: 'Lovable',
    slug: 'lovable',
    website: 'https://lovable.dev',
    changelog_url: 'https://lovable.dev/changelog',
    category: 'platform' as const,
    description: 'AI software engineer for building web apps',
    scraper_config: { type: 'html_scrape', url: 'https://lovable.dev/changelog', selector: 'article' },
  },
  {
    name: 'Replit',
    slug: 'replit',
    website: 'https://replit.com',
    changelog_url: 'https://blog.replit.com/feed.xml',
    category: 'platform' as const,
    description: 'AI-powered collaborative development platform',
    scraper_config: { type: 'rss', url: 'https://blog.replit.com/feed.xml' },
  },
]

async function seed() {
  for (const tool of tools) {
    const { error } = await supabase.from('tools').upsert(tool, { onConflict: 'slug' })
    if (error) console.error(`Error seeding ${tool.slug}:`, error)
    else console.log(`Seeded: ${tool.name}`)
  }
}

seed()
