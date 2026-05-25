#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import type { ScaffoldOptions } from './index'

const TOOL_CONFIGS: Record<string, { claudeMd: string }> = {
  'claude-code': {
    claudeMd: `# Project Configuration\n\n## AI Agent Setup\nThis project uses Claude Code as the primary AI coding tool.\n\n## Conventions\n- TypeScript strict mode\n- Follow existing patterns\n- Write tests for new features\n`,
  },
  cursor: {
    claudeMd: `# Project Configuration\n\n## AI Agent Setup\nThis project uses Cursor as the primary AI coding tool.\n\n## Conventions\n- TypeScript strict mode\n- Follow existing patterns\n- Write tests for new features\n`,
  },
  'gemini-cli': {
    claudeMd: `# Project Configuration\n\n## AI Agent Setup\nThis project uses Gemini CLI as the primary AI coding tool.\n\n## Conventions\n- TypeScript strict mode\n- Follow existing patterns\n- Write tests for new features\n`,
  },
}

export function scaffoldProject(options: ScaffoldOptions): void {
  const { tool, projectName, outputDir } = options
  const projectDir = path.join(outputDir, projectName)

  fs.mkdirSync(projectDir, { recursive: true })

  // Write CLAUDE.md
  const config = TOOL_CONFIGS[tool] || TOOL_CONFIGS['claude-code']
  fs.writeFileSync(path.join(projectDir, 'CLAUDE.md'), config.claudeMd)

  // Write README
  fs.writeFileSync(
    path.join(projectDir, 'README.md'),
    `# ${projectName}\n\nScaffolded with @prototype-studio/agent-starter.\nPrimary tool: ${tool}\n`,
  )

  console.log(`Project scaffolded at ${projectDir}`)
  console.log(`Primary tool: ${tool}`)
  console.log(`\nNext steps:`)
  console.log(`  cd ${projectName}`)
  console.log(`  npm init -y`)
  console.log(`  # Start building with ${tool}`)
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
@prototype-studio/agent-starter

Usage:
  prototype-studio init [options]

Options:
  --tool <tool>       AI tool to use (claude-code, cursor, gemini-cli)
  --type <type>       Project type (web-app, api, cli, data-product)
  --name <name>       Project name
  -h, --help          Show this help
`)
    process.exit(0)
  }

  if (args[0] === 'init') {
    const toolIdx = args.indexOf('--tool')
    const typeIdx = args.indexOf('--type')
    const nameIdx = args.indexOf('--name')

    const tool = (toolIdx >= 0 ? args[toolIdx + 1] : 'claude-code') as ScaffoldOptions['tool']
    const projectType = (typeIdx >= 0 ? args[typeIdx + 1] : 'web-app') as ScaffoldOptions['projectType']
    const projectName = nameIdx >= 0 ? args[nameIdx + 1] : 'my-project'

    scaffoldProject({ tool, projectType, projectName, outputDir: process.cwd() })
  }
}
