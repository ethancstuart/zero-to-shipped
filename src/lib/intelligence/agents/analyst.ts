import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import type { AgentDefinition, AgentInput, AgentOutput } from './types'

const anthropic = new Anthropic()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export const analystAgent: AgentDefinition = {
  role: 'analyst',
  systemPrompt: `You are the Analyst agent in the Prototype Studio content pipeline. Your job is to assess the impact of a tool release on the ecosystem.

Given a structured release analysis and the tool's current capability profile, produce a JSON object with:
- impactLevel: "high" | "medium" | "low"
- capabilityUpdates: array of { capability, oldState, newState, category }
- contentImpact: brief description of what existing content might be affected
- briefTopics: array of 2-3 suggested topics for an ecosystem brief
- ecosystemShift: one sentence on how this changes the competitive landscape`,

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { toolName, version, significance, keyChanges, capabilitiesAdded, capabilitiesChanged } =
      input as {
        toolName: string
        version: string
        significance: string
        keyChanges: string[]
        capabilitiesAdded: string[]
        capabilitiesChanged: string[]
      }

    // Fetch current ecosystem status for this tool
    const { data: tool } = await supabase.from('tools').select('id').eq('name', toolName).single()

    let currentCapabilities: Record<string, unknown>[] = []
    if (tool) {
      const { data } = await supabase
        .from('ecosystem_status')
        .select('capability, category, supported, maturity, quality_score')
        .eq('tool_id', tool.id)

      currentCapabilities = data || []
    }

    // Fetch potentially affected content
    const { data: affectedContent } = await supabase
      .from('content_index')
      .select('slug, title')
      .contains('tools', [toolName.toLowerCase().replace(/\s+/g, '-')])
      .eq('freshness', 'current')
      .limit(10)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: analystAgent.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Release: ${toolName} ${version} (${significance})
Key changes: ${JSON.stringify(keyChanges)}
New capabilities: ${JSON.stringify(capabilitiesAdded)}
Changed capabilities: ${JSON.stringify(capabilitiesChanged)}

Current capability profile:
${JSON.stringify(currentCapabilities, null, 2)}

Potentially affected content (${(affectedContent || []).length} pieces):
${(affectedContent || [])
  .map((c) => `- ${c.title} (${c.slug})`)
  .join('\n')}

Respond with JSON only.`,
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
      parsed = { impactLevel: 'low', error: 'Failed to parse' }
    }

    return {
      summary: `Impact assessment for ${toolName} ${version}: ${parsed.impactLevel || 'unknown'} impact`,
      data: {
        toolName,
        version,
        affectedContentCount: (affectedContent || []).length,
        ...parsed,
      },
      tokensUsed,
    }
  },
}
