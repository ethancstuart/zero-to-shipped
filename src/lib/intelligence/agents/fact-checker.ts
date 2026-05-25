import Anthropic from '@anthropic-ai/sdk'
import type { AgentDefinition, AgentInput, AgentOutput } from './types'

const anthropic = new Anthropic()

export const factCheckerAgent: AgentDefinition = {
  role: 'fact_checker',
  systemPrompt: `You are the Fact-Checker agent in the Prototype Studio content pipeline. Your job is to verify that a draft ecosystem brief is factually accurate.

Compare the draft against the source changelog. Check:
1. Are version numbers correct?
2. Are feature descriptions accurate?
3. Are any capabilities claimed that weren't actually shipped?
4. Are there any hallucinated features or exaggerations?

Produce a JSON object with:
- verdict: "pass" | "fail" | "pass_with_notes"
- claims: array of { claim: string, verified: boolean, source: string, note?: string }
- overallAccuracy: number between 0 and 1
- suggestedFixes: array of strings (empty if verdict is "pass")`,

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { mdxContent, toolName, version } = input as {
      mdxContent: string
      toolName: string
      version: string
    }

    // Get the source changelog from the earlier pipeline data
    const sourceChangelog = (input.rawChangelog as string) || (input.sourceUrl as string) || ''

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: factCheckerAgent.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Verify this draft brief for ${toolName} ${version}:

--- DRAFT ---
${(mdxContent || '').slice(0, 3000)}

--- SOURCE CHANGELOG ---
${(sourceChangelog || '').slice(0, 3000)}

Respond with JSON only.`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens

    let parsed
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { verdict: 'fail' }
    } catch {
      parsed = { verdict: 'fail', error: 'Failed to parse verification response' }
    }

    return {
      summary: `Fact-check ${toolName} ${version}: ${parsed.verdict} (accuracy: ${parsed.overallAccuracy || 'unknown'})`,
      data: {
        toolName,
        version,
        ...parsed,
      },
      tokensUsed,
    }
  },
}
