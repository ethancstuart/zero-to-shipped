export interface AgentInput {
  [key: string]: unknown
}

export interface AgentOutput {
  summary: string
  data: Record<string, unknown>
  tokensUsed: number
}

export interface AgentDefinition {
  role: 'watcher' | 'analyst' | 'writer' | 'fact_checker' | 'publisher'
  systemPrompt: string
  execute(input: AgentInput): Promise<AgentOutput>
}
