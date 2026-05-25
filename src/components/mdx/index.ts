import { Callout } from './callout'
import { ToolBadge } from './tool-badge'
import { CodeBlock } from './code-block'

export const mdxComponents: Record<string, React.ComponentType<any>> = {
  Callout,
  ToolBadge,
  CodeBlock,
  Sandbox: () => null,
  ArenaCompare: () => null,
  AgentReplay: () => null,
  CostTicker: () => null,
}
