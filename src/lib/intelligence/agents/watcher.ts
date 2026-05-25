import Anthropic from '@anthropic-ai/sdk'
import type { AgentDefinition, AgentInput, AgentOutput } from './types'

const anthropic = new Anthropic()

export const watcherAgent: AgentDefinition = {
  role: 'watcher',
  systemPrompt: `You are the Watcher agent in the Prototype Studio content pipeline. Your job is to analyze raw release data from AI coding tools and extract structured information.

Given raw release data, produce a JSON object with:
- toolName: the tool name
- version: the version number
- significance: "major" | "minor" | "patch"
- keyChanges: array of strings describing the most important changes
- capabilitiesAdded: array of new capabilities
- capabilitiesChanged: array of modified capabilities
- breakingChanges: boolean

Be precise and factual. Only report what the changelog explicitly states.`,

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { toolName, version, rawChangelog, sourceUrl } = input as {
      toolName: string
      version: string
      rawChangelog: string
      sourceUrl: string
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: watcherAgent.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze this release for ${toolName} version ${version}:\n\n${(rawChangelog || '').slice(0, 4000)}\n\nSource: ${sourceUrl}\n\nRespond with JSON only.`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens

    let parsed
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    } catch {
      parsed = { error: 'Failed to parse response' }
    }

    return {
      summary: `Analyzed ${toolName} ${version}: ${parsed.significance || 'unknown'} release with ${(parsed.keyChanges || []).length} key changes`,
      data: {
        toolName,
        version,
        sourceUrl,
        ...parsed,
      },
      tokensUsed,
    }
  },
}
