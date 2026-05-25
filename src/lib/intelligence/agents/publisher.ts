import fs from 'fs/promises'
import path from 'path'
import type { AgentDefinition, AgentInput, AgentOutput } from './types'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export const publisherAgent: AgentDefinition = {
  role: 'publisher',
  systemPrompt: 'You are the Publisher agent. You write verified content to the filesystem.',

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { mdxContent, toolSlug, version, verdict } = input as {
      mdxContent: string
      toolSlug: string
      version: string
      verdict: string
    }

    if (verdict === 'fail') {
      return {
        summary: `Skipped publishing — fact-check failed for ${toolSlug} ${version}`,
        data: { published: false, reason: 'fact_check_failed' },
        tokensUsed: 0,
      }
    }

    const slug = `${toolSlug}-${version.replace(/\./g, '-')}-release`
    const filename = `${slug}.mdx`
    const filePath = path.join(CONTENT_DIR, 'pulse', 'briefs', filename)

    await fs.mkdir(path.join(CONTENT_DIR, 'pulse', 'briefs'), { recursive: true })
    await fs.writeFile(filePath, mdxContent, 'utf-8')

    return {
      summary: `Published brief: ${filename}`,
      data: {
        published: true,
        filePath,
        filename,
        slug,
      },
      tokensUsed: 0,
    }
  },
}
