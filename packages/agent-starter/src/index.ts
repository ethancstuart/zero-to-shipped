export { scaffoldProject } from './cli'

export interface ScaffoldOptions {
  tool: 'claude-code' | 'cursor' | 'gemini-cli'
  projectType: 'web-app' | 'api' | 'cli' | 'data-product'
  projectName: string
  outputDir: string
}
