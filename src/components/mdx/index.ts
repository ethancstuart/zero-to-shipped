import { Callout } from './callout'
import { ToolBadge } from './tool-badge'
import { CodeBlock } from './code-block'
import { AgentReplay } from './agent-replay'
import { Sandbox } from './sandbox'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mdxComponents: Record<string, React.ComponentType<any>> = {
  Callout,
  ToolBadge,
  CodeBlock,
  Sandbox,
  ArenaCompare: () => null,
  AgentReplay,
  CostTicker: () => null,
}
