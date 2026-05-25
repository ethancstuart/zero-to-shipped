/**
 * Migration script: converts source markdown modules to MDX lessons
 * with proper frontmatter for the Prototype Studio content system.
 *
 * Run: npx tsx scripts/migrate-content.ts
 */

import fs from 'fs/promises'
import path from 'path'

const ROOT = path.join(process.cwd())
const CONTENT_SOURCE = path.join(ROOT, 'content-source')
const CONTENT_DIR = path.join(ROOT, 'content')

// ─── Directory structure ───────────────────────────────────────────────────

const DIRS = [
  'content/pulse/briefs',
  'content/pulse/comparisons',
  'content/pulse/releases',
  'content/build/sessions',
  'content/build/challenges',
  'content/build/walkthroughs',
  'content/learn/lessons',
  'content/learn/guides',
  'content/learn/design',
  'content/learn/patterns',
  'content/learn/resources',
  'content/system/playbook',
  'content/system/personas',
  'content/system/starters',
  'content/collections',
]

// ─── Module metadata ───────────────────────────────────────────────────────

interface ModuleConfig {
  number: number
  sourceFile: string
  outputFile: string
  slug: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedMinutes: number
  tags: string[]
}

const MODULES: ModuleConfig[] = [
  {
    number: 1,
    sourceFile: '01-setup-and-first-build.md',
    outputFile: 'setup-and-first-build.mdx',
    slug: 'setup-and-first-build',
    title: 'Setup & First Build',
    difficulty: 'beginner',
    estimatedMinutes: 60,
    tags: ['setup', 'cursor', 'claude-code', 'foundations', 'getting-started'],
  },
  {
    number: 2,
    sourceFile: '02-prompt-engineering.md',
    outputFile: 'prompt-engineering.mdx',
    slug: 'prompt-engineering',
    title: 'Prompt Engineering & Critical Thinking',
    difficulty: 'beginner',
    estimatedMinutes: 90,
    tags: ['prompting', 'prompt-engineering', 'critical-thinking', 'foundations'],
  },
  {
    number: 3,
    sourceFile: '03-how-code-works.md',
    outputFile: 'how-code-works.mdx',
    slug: 'how-code-works',
    title: 'How Code Actually Works',
    difficulty: 'beginner',
    estimatedMinutes: 90,
    tags: ['html', 'css', 'javascript', 'foundations', 'code-literacy'],
  },
  {
    number: 4,
    sourceFile: '04-terminal-and-cli.md',
    outputFile: 'terminal-and-cli.mdx',
    slug: 'terminal-and-cli',
    title: 'The Terminal & Command Line',
    difficulty: 'beginner',
    estimatedMinutes: 60,
    tags: ['terminal', 'cli', 'command-line', 'foundations'],
  },
  {
    number: 5,
    sourceFile: '05-version-control.md',
    outputFile: 'version-control-git.mdx',
    slug: 'version-control-git',
    title: 'Version Control with Git',
    difficulty: 'beginner',
    estimatedMinutes: 90,
    tags: ['git', 'github', 'version-control', 'foundations'],
  },
  {
    number: 6,
    sourceFile: '06-blueprints.md',
    outputFile: 'blueprints-architecture.mdx',
    slug: 'blueprints-architecture',
    title: 'Blueprints & Project Architecture',
    difficulty: 'intermediate',
    estimatedMinutes: 90,
    tags: ['architecture', 'blueprints', 'project-structure', 'planning'],
  },
  {
    number: 7,
    sourceFile: '07-brainstorming-and-ideation.md',
    outputFile: 'brainstorming-with-ai.mdx',
    slug: 'brainstorming-with-ai',
    title: 'Brainstorming & Ideation with AI',
    difficulty: 'intermediate',
    estimatedMinutes: 60,
    tags: ['brainstorming', 'ideation', 'product-thinking', 'ai'],
  },
  {
    number: 8,
    sourceFile: '08-planning-and-research.md',
    outputFile: 'planning-and-research.mdx',
    slug: 'planning-and-research',
    title: 'Planning & Research with AI',
    difficulty: 'intermediate',
    estimatedMinutes: 60,
    tags: ['planning', 'research', 'specs', 'ai'],
  },
  {
    number: 9,
    sourceFile: '09-interactive-tools.md',
    outputFile: 'interactive-tools.mdx',
    slug: 'interactive-tools',
    title: 'Building Interactive Tools',
    difficulty: 'intermediate',
    estimatedMinutes: 60,
    tags: ['interactive', 'tools', 'ui', 'build'],
  },
  {
    number: 10,
    sourceFile: '10-decks-and-visuals.md',
    outputFile: 'decks-and-diagrams.mdx',
    slug: 'decks-and-diagrams',
    title: 'Decks, Diagrams & Visual Assets',
    difficulty: 'intermediate',
    estimatedMinutes: 60,
    tags: ['decks', 'diagrams', 'visuals', 'design'],
  },
  {
    number: 11,
    sourceFile: '11-design-principles.md',
    outputFile: 'ui-design-principles.mdx',
    slug: 'ui-design-principles',
    title: 'UI Design Principles for Builders',
    difficulty: 'intermediate',
    estimatedMinutes: 60,
    tags: ['design', 'ui', 'ux', 'design-principles'],
  },
  {
    number: 12,
    sourceFile: '12-data-products.md',
    outputFile: 'data-products.mdx',
    slug: 'data-products',
    title: 'Data Products',
    difficulty: 'intermediate',
    estimatedMinutes: 90,
    tags: ['data', 'data-products', 'analytics', 'dashboards'],
  },
  {
    number: 13,
    sourceFile: '13-automations.md',
    outputFile: 'automations-workflows.mdx',
    slug: 'automations-workflows',
    title: 'Automations & Workflows',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    tags: ['automations', 'workflows', 'ai-agents', 'productivity'],
  },
  {
    number: 14,
    sourceFile: '14-docs-security-testing-shipping.md',
    outputFile: 'docs-security-testing.mdx',
    slug: 'docs-security-testing',
    title: 'Documentation, Security, Testing & Shipping',
    difficulty: 'advanced',
    estimatedMinutes: 90,
    tags: ['documentation', 'security', 'testing', 'shipping', 'deployment'],
  },
  {
    number: 15,
    sourceFile: '15-collaboration.md',
    outputFile: 'collaboration-with-engineers.mdx',
    slug: 'collaboration-with-engineers',
    title: 'Collaboration & Working with Engineers',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    tags: ['collaboration', 'engineering', 'communication', 'teamwork'],
  },
  {
    number: 16,
    sourceFile: '16-capstone.md',
    outputFile: 'capstone.mdx',
    slug: 'capstone',
    title: 'Put It All Together (Capstone)',
    difficulty: 'advanced',
    estimatedMinutes: 120,
    tags: ['capstone', 'project', 'portfolio', 'shipping'],
  },
]

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildLessonFrontmatter(mod: ModuleConfig): string {
  return `---
title: "${mod.title}"
slug: ${mod.slug}
pillar: learn
type: lesson
format: written
tools: [claude-code, cursor]
toolVersions:
  claude-code: "1.0.32"
  cursor: "0.48"
difficulty: ${mod.difficulty}
estimatedMinutes: ${mod.estimatedMinutes}
tags: [${mod.tags.map((t) => `${t}`).join(', ')}]
isPremium: false
isFeatured: false
status: published
publishedAt: "2026-03-15"
---`
}

// ─── Seed content ──────────────────────────────────────────────────────────

const WELCOME_BRIEF = `---
title: "Welcome to Prototype Studio"
slug: welcome-to-prototype-studio
pillar: pulse
type: brief
format: written
tools: [claude-code, cursor, gemini-cli]
toolVersions: {}
difficulty: beginner
estimatedMinutes: 5
tags: [announcement, launch]
isPremium: false
isFeatured: true
status: published
publishedAt: "2026-05-25"
---

# Welcome to Prototype Studio

Prototype Studio is the place where product managers, business analysts, and non-engineers learn to build real software with AI. Not toy demos. Not prompts that kind of work. Actual shipped products.

We're organized around four pillars. **Pulse** is your feed of what's new — tool releases, model updates, side-by-side comparisons, and the occasional hot take on where the AI tooling landscape is heading. **Build** is where we document real sessions: what we built, which tools we used, what broke, and what we'd do differently. **Learn** is structured curriculum — 16 modules from your first AI build to shipping a production product — with lessons, guides, patterns, and design references. **System** is your operating system for working with AI agents: playbooks, persona templates, starter prompts, and the frameworks we use to think about this stuff.

If you're coming from Zero to Ship, everything you loved is still here — the 16-module course, the checkpoints, the honest takes on what AI tools can and can't do. We've just expanded around it. There's more now: more depth, more variety, more ways to engage depending on where you are in your builder journey.

Start with the Learn pillar if you want structured progression. Start with Pulse if you want to stay current. Start with Build if you want to see real work. Welcome.
`

const GETTING_STARTED_WITH_AGENTS = `---
title: "Getting Started with AI Agents"
slug: getting-started-with-agents
pillar: system
type: playbook
format: written
tools: [claude-code]
toolVersions:
  claude-code: "1.0.32"
difficulty: beginner
estimatedMinutes: 20
tags: [agents, getting-started, claude-code, personas]
isPremium: false
isFeatured: true
status: published
publishedAt: "2026-05-25"
---

# Getting Started with AI Agents

## What is an Agent System

An AI agent is a language model with a defined role, a set of tools, and enough context to make decisions and take actions without you hand-holding every step. A single Claude Code session with a well-crafted CLAUDE.md is a basic agent. A network of specialized agents working in parallel — each with its own persona, toolset, and output — is an agent system.

The shift from "AI assistant" to "agent system" is less about technology and more about how you think. When you start treating your AI tools as a team of specialists rather than a single generalist you interrupt constantly, your output quality goes up and your prompt-writing time goes down.

## The Core Concept

Every effective agent has three things: a **persona** (who it is, what it knows, how it communicates), a **context window** (the files, instructions, and history it can see), and a **feedback loop** (how it knows when it's done and whether the output is correct).

Most people get the persona part wrong. They write "You are a helpful assistant" and wonder why the output is generic. A strong persona is specific: "You are a senior product manager with a background in B2B SaaS and a bias toward ruthless prioritization. You communicate in plain language and never hedge without a reason." That single sentence changes the output dramatically.

## Why Specialized Agents

A generalist agent trying to do research, write copy, review code, and manage a project simultaneously will do all four things mediocrely. Specialized agents do one thing well. When you need to analyze a competitor, you spin up the competitive intelligence persona. When you need to write a launch post, you use the content strategist persona. When you need to review a pull request, you use the code reviewer.

The overhead of managing multiple agents is real, but the quality gain is worth it once you have your personas dialed in. The System pillar of Prototype Studio is where we publish the personas and playbooks we actually use.

## Getting Started

The fastest way to start is with Claude Code and a well-structured CLAUDE.md file. This file is the agent's operating manual — it tells Claude who it is, what tools it has, what the project context is, and how it should behave. Think of it as the hiring document for the agent.

Start simple: one agent, one role, one project. Write a CLAUDE.md that explains the project in two paragraphs, defines the agent's specialty, and lists three or four constraints (things the agent should never do). Run a session. Observe what works and what breaks. Refine the persona. Repeat.

Once you have one persona that produces consistently good output, pattern-match it to create a second. That's the beginning of an agent system. The playbooks in this section walk through the specific setups we use — from solo build sessions to multi-agent research pipelines.
`

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('Creating directory structure...')
  for (const dir of DIRS) {
    const fullPath = path.join(ROOT, dir)
    await fs.mkdir(fullPath, { recursive: true })
    console.log(`  ✓ ${dir}`)
  }

  console.log('\nMigrating lesson modules...')
  let migrated = 0
  let skipped = 0

  for (const mod of MODULES) {
    const sourcePath = path.join(CONTENT_SOURCE, mod.sourceFile)
    const outputPath = path.join(CONTENT_DIR, 'learn', 'lessons', mod.outputFile)

    let sourceContent: string
    try {
      sourceContent = await fs.readFile(sourcePath, 'utf-8')
    } catch {
      console.warn(`  ✗ Module ${mod.number}: source not found at ${sourcePath}`)
      skipped++
      continue
    }

    const frontmatter = buildLessonFrontmatter(mod)
    const output = `${frontmatter}\n\n${sourceContent.trimEnd()}\n`

    await fs.writeFile(outputPath, output, 'utf-8')
    console.log(`  ✓ Module ${mod.number}: ${mod.outputFile}`)
    migrated++
  }

  console.log('\nCreating seed content...')

  const pulseBriefsDir = path.join(CONTENT_DIR, 'pulse', 'briefs')
  await fs.writeFile(
    path.join(pulseBriefsDir, 'welcome-to-prototype-studio.mdx'),
    WELCOME_BRIEF,
    'utf-8',
  )
  console.log('  ✓ pulse/briefs/welcome-to-prototype-studio.mdx')

  const systemPlaybookDir = path.join(CONTENT_DIR, 'system', 'playbook')
  await fs.writeFile(
    path.join(systemPlaybookDir, 'getting-started-with-agents.mdx'),
    GETTING_STARTED_WITH_AGENTS,
    'utf-8',
  )
  console.log('  ✓ system/playbook/getting-started-with-agents.mdx')

  console.log(`\nDone. ${migrated} lessons migrated, ${skipped} skipped, 2 seed files created.`)
  if (skipped > 0) {
    console.warn(`WARNING: ${skipped} source file(s) were not found.`)
  }
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
