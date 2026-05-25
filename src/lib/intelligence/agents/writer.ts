import Anthropic from '@anthropic-ai/sdk'
import type { AgentDefinition, AgentInput, AgentOutput } from './types'

const anthropic = new Anthropic()

export const writerAgent: AgentDefinition = {
  role: 'writer',
  systemPrompt: `You are the Writer agent in the Prototype Studio content pipeline. You write concise, factual ecosystem briefs about AI coding tool releases.

Your output must be a complete MDX file with YAML frontmatter. Follow this exact format:

---
title: "[Tool Name] [Version]: [One-line summary]"
slug: [tool-slug]-[version]-release
pillar: pulse
type: brief
format: written
tools: [tool-slug]
toolVersions:
  [tool-slug]: "[version]"
difficulty: beginner
estimatedMinutes: 3
tags: [tool-slug, release, ecosystem]
isPremium: false
isFeatured: false
status: draft
publishedAt: "[today's date YYYY-MM-DD]"
---

# [Title]

[2-3 paragraph brief covering: what shipped, why it matters, what to try]

## Key Changes

[Bullet list of important changes]

## What This Means

[1 paragraph on ecosystem impact]

Write in a neutral, informative tone. No hype. Focus on what builders can do with the new capabilities.`,

  async execute(input: AgentInput): Promise<AgentOutput> {
    const {
      toolName,
      version,
      impactLevel,
      capabilityUpdates,
      briefTopics,
      ecosystemShift,
      keyChanges,
    } = input as {
      toolName: string
      version: string
      impactLevel: string
      capabilityUpdates: unknown[]
      briefTopics: string[]
      ecosystemShift: string
      keyChanges: string[]
    }

    const today = new Date().toISOString().split('T')[0]
    const toolSlug = toolName.toLowerCase().replace(/\s+/g, '-')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: writerAgent.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Write an ecosystem brief for:
Tool: ${toolName}
Version: ${version}
Tool slug: ${toolSlug}
Today's date: ${today}
Impact level: ${impactLevel}
Key changes: ${JSON.stringify(keyChanges)}
Capability updates: ${JSON.stringify(capabilityUpdates)}
Suggested topics: ${JSON.stringify(briefTopics)}
Ecosystem shift: ${ecosystemShift}

Output the complete MDX file (frontmatter + body). Nothing else.`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens

    return {
      summary: `Drafted brief: ${toolName} ${version} (${text.length} chars)`,
      data: {
        toolName,
        version,
        toolSlug,
        mdxContent: text,
        publishDate: today,
      },
      tokensUsed,
    }
  },
}
