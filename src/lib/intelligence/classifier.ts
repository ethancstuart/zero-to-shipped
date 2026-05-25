import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

interface ClassificationResult {
  significance: 'major' | 'minor' | 'patch'
  summary: string
  capabilities: string[]
  impactAssessment: string
}

export async function classifyRelease(
  toolName: string,
  version: string,
  changelog: string,
): Promise<ClassificationResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Classify this release for ${toolName} version ${version}.

Changelog:
${changelog.slice(0, 4000)}

Respond in JSON only, no other text:
{
  "significance": "major" | "minor" | "patch",
  "summary": "one paragraph summary of what changed and why it matters",
  "capabilities": ["list", "of", "new", "or", "changed", "capabilities"],
  "impactAssessment": "brief assessment of impact on AI-assisted development workflows"
}`,
      },
    ],
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return {
      significance: 'patch',
      summary: `${toolName} ${version} released`,
      capabilities: [],
      impactAssessment: 'Unable to classify',
    }
  }
  return JSON.parse(jsonMatch[0]) as ClassificationResult
}
