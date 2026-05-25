import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

interface EvaluationResult {
  scores: {
    functional: number
    codeQuality: number
    designQuality: number
    overall: number
  }
  notes: string
}

export async function evaluateOutput(
  output: string,
  criteria: {
    functional: string[]
    codeQuality: string[]
    designQuality: string[]
  },
  task: string,
): Promise<EvaluationResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Evaluate this AI-generated code output for the task: "${task}"

Output to evaluate:
${output.slice(0, 4000)}

Evaluation criteria:
Functional: ${JSON.stringify(criteria.functional)}
Code Quality: ${JSON.stringify(criteria.codeQuality)}
Design Quality: ${JSON.stringify(criteria.designQuality)}

Score each category 1-10. Respond in JSON only:
{
  "scores": {
    "functional": <1-10>,
    "codeQuality": <1-10>,
    "designQuality": <1-10>,
    "overall": <1-10>
  },
  "notes": "brief evaluation notes"
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as EvaluationResult
  } catch {
    // Fall through to default
  }

  return {
    scores: { functional: 0, codeQuality: 0, designQuality: 0, overall: 0 },
    notes: 'Failed to parse evaluation',
  }
}
