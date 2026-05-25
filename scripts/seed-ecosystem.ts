import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface CapabilityRating {
  capability: string
  category: string
  supported: boolean
  maturity: 'experimental' | 'beta' | 'stable' | 'mature'
  quality_score: number
  notes?: string
}

// Capability ratings per tool based on publicly known capabilities as of May 2026
const toolCapabilities: Record<string, CapabilityRating[]> = {
  'claude-code': [
    // Code Generation
    { capability: 'Single file generation', category: 'Code Generation', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'Multi-file generation', category: 'Code Generation', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'Full project scaffolding', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Iterative refinement', category: 'Code Generation', supported: true, maturity: 'mature', quality_score: 5 },
    // Context & Understanding
    { capability: 'Codebase-wide context', category: 'Context & Understanding', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'File-level context', category: 'Context & Understanding', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'Conversation memory', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Documentation ingestion', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4 },
    // Tool Integration
    { capability: 'MCP support', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 5 },
    { capability: 'External tool calling', category: 'Tool Integration', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'Browser/web access', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Terminal/shell access', category: 'Tool Integration', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'Git integration', category: 'Tool Integration', supported: true, maturity: 'mature', quality_score: 5 },
    // Editing
    { capability: 'Inline code editing', category: 'Editing', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'Multi-file coordinated edits', category: 'Editing', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'Diff-based editing', category: 'Editing', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'Refactoring support', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4 },
    // Deployment
    { capability: 'One-click deploy', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Preview environments', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'CI/CD integration', category: 'Deployment', supported: true, maturity: 'stable', quality_score: 3, notes: 'Via shell commands and scripts' },
    { capability: 'Infrastructure provisioning', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    // Collaboration
    { capability: 'Real-time pair programming', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Agent-to-agent coordination', category: 'Collaboration', supported: true, maturity: 'stable', quality_score: 4, notes: 'Subagent and parallel agent support' },
    { capability: 'Human review workflow', category: 'Collaboration', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Team/shared context', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    // Platform
    { capability: 'CLI', category: 'Platform', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'IDE extension', category: 'Platform', supported: true, maturity: 'stable', quality_score: 4, notes: 'VS Code extension available' },
    { capability: 'Web-based', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'API access', category: 'Platform', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'Self-hostable', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
  ],

  'cursor': [
    // Code Generation
    { capability: 'Single file generation', category: 'Code Generation', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'Multi-file generation', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Full project scaffolding', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Iterative refinement', category: 'Code Generation', supported: true, maturity: 'mature', quality_score: 5 },
    // Context & Understanding
    { capability: 'Codebase-wide context', category: 'Context & Understanding', supported: true, maturity: 'mature', quality_score: 5, notes: 'Codebase indexing via embeddings' },
    { capability: 'File-level context', category: 'Context & Understanding', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'Conversation memory', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Documentation ingestion', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4, notes: '@docs context command' },
    // Tool Integration
    { capability: 'MCP support', category: 'Tool Integration', supported: true, maturity: 'beta', quality_score: 3, notes: 'MCP integration available' },
    { capability: 'External tool calling', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Browser/web access', category: 'Tool Integration', supported: true, maturity: 'beta', quality_score: 3, notes: 'Via agent mode' },
    { capability: 'Terminal/shell access', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 4, notes: 'Integrated terminal' },
    { capability: 'Git integration', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 4, notes: 'VS Code built-in git support' },
    // Editing
    { capability: 'Inline code editing', category: 'Editing', supported: true, maturity: 'mature', quality_score: 5, notes: 'Tab autocomplete + inline edit' },
    { capability: 'Multi-file coordinated edits', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Diff-based editing', category: 'Editing', supported: true, maturity: 'mature', quality_score: 5, notes: 'Accept/reject diff UI' },
    { capability: 'Refactoring support', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4 },
    // Deployment
    { capability: 'One-click deploy', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Preview environments', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'CI/CD integration', category: 'Deployment', supported: true, maturity: 'stable', quality_score: 3, notes: 'Via terminal and extensions' },
    { capability: 'Infrastructure provisioning', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    // Collaboration
    { capability: 'Real-time pair programming', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Agent-to-agent coordination', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Human review workflow', category: 'Collaboration', supported: true, maturity: 'stable', quality_score: 3, notes: 'Accept/reject change flow' },
    { capability: 'Team/shared context', category: 'Collaboration', supported: true, maturity: 'beta', quality_score: 3, notes: 'Team plans with shared rules' },
    // Platform
    { capability: 'CLI', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'IDE extension', category: 'Platform', supported: true, maturity: 'mature', quality_score: 5, notes: 'Standalone IDE, not an extension' },
    { capability: 'Web-based', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'API access', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Self-hostable', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
  ],

  'gemini-cli': [
    // Code Generation
    { capability: 'Single file generation', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Multi-file generation', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Full project scaffolding', category: 'Code Generation', supported: true, maturity: 'beta', quality_score: 3 },
    { capability: 'Iterative refinement', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    // Context & Understanding
    { capability: 'Codebase-wide context', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4, notes: 'Large 1M+ token context window' },
    { capability: 'File-level context', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Conversation memory', category: 'Context & Understanding', supported: true, maturity: 'beta', quality_score: 3 },
    { capability: 'Documentation ingestion', category: 'Context & Understanding', supported: true, maturity: 'beta', quality_score: 3 },
    // Tool Integration
    { capability: 'MCP support', category: 'Tool Integration', supported: true, maturity: 'beta', quality_score: 3, notes: 'MCP tooling built in' },
    { capability: 'External tool calling', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Browser/web access', category: 'Tool Integration', supported: true, maturity: 'beta', quality_score: 3, notes: 'Google Search grounding' },
    { capability: 'Terminal/shell access', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Git integration', category: 'Tool Integration', supported: true, maturity: 'beta', quality_score: 3, notes: 'Via shell commands' },
    // Editing
    { capability: 'Inline code editing', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Multi-file coordinated edits', category: 'Editing', supported: true, maturity: 'beta', quality_score: 3 },
    { capability: 'Diff-based editing', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Refactoring support', category: 'Editing', supported: true, maturity: 'beta', quality_score: 3 },
    // Deployment
    { capability: 'One-click deploy', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Preview environments', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'CI/CD integration', category: 'Deployment', supported: true, maturity: 'beta', quality_score: 2, notes: 'Via shell scripting' },
    { capability: 'Infrastructure provisioning', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    // Collaboration
    { capability: 'Real-time pair programming', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Agent-to-agent coordination', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Human review workflow', category: 'Collaboration', supported: true, maturity: 'beta', quality_score: 3 },
    { capability: 'Team/shared context', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    // Platform
    { capability: 'CLI', category: 'Platform', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'IDE extension', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Web-based', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'API access', category: 'Platform', supported: true, maturity: 'stable', quality_score: 4, notes: 'Gemini API' },
    { capability: 'Self-hostable', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
  ],

  'codex': [
    // Code Generation
    { capability: 'Single file generation', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Multi-file generation', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Full project scaffolding', category: 'Code Generation', supported: true, maturity: 'beta', quality_score: 3 },
    { capability: 'Iterative refinement', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    // Context & Understanding
    { capability: 'Codebase-wide context', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'File-level context', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Conversation memory', category: 'Context & Understanding', supported: true, maturity: 'beta', quality_score: 3 },
    { capability: 'Documentation ingestion', category: 'Context & Understanding', supported: true, maturity: 'beta', quality_score: 3 },
    // Tool Integration
    { capability: 'MCP support', category: 'Tool Integration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'External tool calling', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 3 },
    { capability: 'Browser/web access', category: 'Tool Integration', supported: true, maturity: 'beta', quality_score: 3, notes: 'Via browsing tool' },
    { capability: 'Terminal/shell access', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Git integration', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 3, notes: 'Via shell commands' },
    // Editing
    { capability: 'Inline code editing', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Multi-file coordinated edits', category: 'Editing', supported: true, maturity: 'beta', quality_score: 3 },
    { capability: 'Diff-based editing', category: 'Editing', supported: true, maturity: 'stable', quality_score: 3 },
    { capability: 'Refactoring support', category: 'Editing', supported: true, maturity: 'beta', quality_score: 3 },
    // Deployment
    { capability: 'One-click deploy', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Preview environments', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'CI/CD integration', category: 'Deployment', supported: true, maturity: 'beta', quality_score: 2, notes: 'Via shell scripting' },
    { capability: 'Infrastructure provisioning', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    // Collaboration
    { capability: 'Real-time pair programming', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Agent-to-agent coordination', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Human review workflow', category: 'Collaboration', supported: true, maturity: 'beta', quality_score: 3 },
    { capability: 'Team/shared context', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    // Platform
    { capability: 'CLI', category: 'Platform', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'IDE extension', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Web-based', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'API access', category: 'Platform', supported: true, maturity: 'stable', quality_score: 4, notes: 'OpenAI API' },
    { capability: 'Self-hostable', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
  ],

  'v0': [
    // Code Generation
    { capability: 'Single file generation', category: 'Code Generation', supported: true, maturity: 'mature', quality_score: 5, notes: 'Specializes in React/UI components' },
    { capability: 'Multi-file generation', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Full project scaffolding', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4, notes: 'Next.js/React project generation' },
    { capability: 'Iterative refinement', category: 'Code Generation', supported: true, maturity: 'mature', quality_score: 5, notes: 'Chat-driven iteration' },
    // Context & Understanding
    { capability: 'Codebase-wide context', category: 'Context & Understanding', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'File-level context', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Conversation memory', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Documentation ingestion', category: 'Context & Understanding', supported: false, maturity: 'experimental', quality_score: 1 },
    // Tool Integration
    { capability: 'MCP support', category: 'Tool Integration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'External tool calling', category: 'Tool Integration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Browser/web access', category: 'Tool Integration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Terminal/shell access', category: 'Tool Integration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Git integration', category: 'Tool Integration', supported: true, maturity: 'beta', quality_score: 3, notes: 'GitHub export' },
    // Editing
    { capability: 'Inline code editing', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Multi-file coordinated edits', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Diff-based editing', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Refactoring support', category: 'Editing', supported: true, maturity: 'stable', quality_score: 3 },
    // Deployment
    { capability: 'One-click deploy', category: 'Deployment', supported: true, maturity: 'mature', quality_score: 5, notes: 'Vercel one-click deploy' },
    { capability: 'Preview environments', category: 'Deployment', supported: true, maturity: 'mature', quality_score: 5, notes: 'Vercel preview deployments' },
    { capability: 'CI/CD integration', category: 'Deployment', supported: true, maturity: 'stable', quality_score: 4, notes: 'Via Vercel CI/CD' },
    { capability: 'Infrastructure provisioning', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    // Collaboration
    { capability: 'Real-time pair programming', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Agent-to-agent coordination', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Human review workflow', category: 'Collaboration', supported: true, maturity: 'stable', quality_score: 3, notes: 'Share link for review' },
    { capability: 'Team/shared context', category: 'Collaboration', supported: true, maturity: 'beta', quality_score: 3, notes: 'Shareable projects' },
    // Platform
    { capability: 'CLI', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'IDE extension', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Web-based', category: 'Platform', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'API access', category: 'Platform', supported: true, maturity: 'beta', quality_score: 3, notes: 'v0 API available' },
    { capability: 'Self-hostable', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
  ],

  'windsurf': [
    // Code Generation
    { capability: 'Single file generation', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Multi-file generation', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Full project scaffolding', category: 'Code Generation', supported: true, maturity: 'beta', quality_score: 3 },
    { capability: 'Iterative refinement', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    // Context & Understanding
    { capability: 'Codebase-wide context', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4, notes: 'Cascade flow-based context awareness' },
    { capability: 'File-level context', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Conversation memory', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Documentation ingestion', category: 'Context & Understanding', supported: true, maturity: 'beta', quality_score: 3 },
    // Tool Integration
    { capability: 'MCP support', category: 'Tool Integration', supported: true, maturity: 'beta', quality_score: 3 },
    { capability: 'External tool calling', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 3 },
    { capability: 'Browser/web access', category: 'Tool Integration', supported: true, maturity: 'beta', quality_score: 3 },
    { capability: 'Terminal/shell access', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 4, notes: 'Integrated terminal' },
    { capability: 'Git integration', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 4, notes: 'VS Code git integration' },
    // Editing
    { capability: 'Inline code editing', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4, notes: 'Supercomplete autocomplete' },
    { capability: 'Multi-file coordinated edits', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4, notes: 'Cascade mode' },
    { capability: 'Diff-based editing', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Refactoring support', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4 },
    // Deployment
    { capability: 'One-click deploy', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Preview environments', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'CI/CD integration', category: 'Deployment', supported: true, maturity: 'beta', quality_score: 2, notes: 'Via terminal' },
    { capability: 'Infrastructure provisioning', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    // Collaboration
    { capability: 'Real-time pair programming', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Agent-to-agent coordination', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Human review workflow', category: 'Collaboration', supported: true, maturity: 'stable', quality_score: 3, notes: 'Accept/reject diff UI' },
    { capability: 'Team/shared context', category: 'Collaboration', supported: true, maturity: 'beta', quality_score: 2, notes: 'Teams plan' },
    // Platform
    { capability: 'CLI', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'IDE extension', category: 'Platform', supported: true, maturity: 'stable', quality_score: 4, notes: 'Standalone IDE built on VS Code' },
    { capability: 'Web-based', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'API access', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Self-hostable', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
  ],

  'bolt': [
    // Code Generation
    { capability: 'Single file generation', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Multi-file generation', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Full project scaffolding', category: 'Code Generation', supported: true, maturity: 'mature', quality_score: 5, notes: 'Full-stack scaffolding from prompt' },
    { capability: 'Iterative refinement', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    // Context & Understanding
    { capability: 'Codebase-wide context', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 3, notes: 'Sandboxed project context' },
    { capability: 'File-level context', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Conversation memory', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Documentation ingestion', category: 'Context & Understanding', supported: false, maturity: 'experimental', quality_score: 1 },
    // Tool Integration
    { capability: 'MCP support', category: 'Tool Integration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'External tool calling', category: 'Tool Integration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Browser/web access', category: 'Tool Integration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Terminal/shell access', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 3, notes: 'In-browser terminal' },
    { capability: 'Git integration', category: 'Tool Integration', supported: true, maturity: 'beta', quality_score: 3, notes: 'GitHub push/pull' },
    // Editing
    { capability: 'Inline code editing', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Multi-file coordinated edits', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Diff-based editing', category: 'Editing', supported: true, maturity: 'stable', quality_score: 3 },
    { capability: 'Refactoring support', category: 'Editing', supported: true, maturity: 'beta', quality_score: 3 },
    // Deployment
    { capability: 'One-click deploy', category: 'Deployment', supported: true, maturity: 'stable', quality_score: 4, notes: 'Deploy to Netlify/Cloudflare' },
    { capability: 'Preview environments', category: 'Deployment', supported: true, maturity: 'stable', quality_score: 4, notes: 'Built-in preview in sandbox' },
    { capability: 'CI/CD integration', category: 'Deployment', supported: true, maturity: 'beta', quality_score: 3 },
    { capability: 'Infrastructure provisioning', category: 'Deployment', supported: false, maturity: 'experimental', quality_score: 1 },
    // Collaboration
    { capability: 'Real-time pair programming', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Agent-to-agent coordination', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Human review workflow', category: 'Collaboration', supported: true, maturity: 'beta', quality_score: 3, notes: 'Share project link' },
    { capability: 'Team/shared context', category: 'Collaboration', supported: true, maturity: 'beta', quality_score: 3, notes: 'Team workspaces' },
    // Platform
    { capability: 'CLI', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'IDE extension', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Web-based', category: 'Platform', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'API access', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Self-hostable', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
  ],

  'lovable': [
    // Code Generation
    { capability: 'Single file generation', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Multi-file generation', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Full project scaffolding', category: 'Code Generation', supported: true, maturity: 'mature', quality_score: 5, notes: 'Full app generation from prompt' },
    { capability: 'Iterative refinement', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    // Context & Understanding
    { capability: 'Codebase-wide context', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 3 },
    { capability: 'File-level context', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Conversation memory', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Documentation ingestion', category: 'Context & Understanding', supported: false, maturity: 'experimental', quality_score: 1 },
    // Tool Integration
    { capability: 'MCP support', category: 'Tool Integration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'External tool calling', category: 'Tool Integration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Browser/web access', category: 'Tool Integration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Terminal/shell access', category: 'Tool Integration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Git integration', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 4, notes: 'GitHub sync built-in' },
    // Editing
    { capability: 'Inline code editing', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Multi-file coordinated edits', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Diff-based editing', category: 'Editing', supported: true, maturity: 'stable', quality_score: 3 },
    { capability: 'Refactoring support', category: 'Editing', supported: true, maturity: 'beta', quality_score: 3 },
    // Deployment
    { capability: 'One-click deploy', category: 'Deployment', supported: true, maturity: 'mature', quality_score: 5, notes: 'Built-in Supabase + hosting deploy' },
    { capability: 'Preview environments', category: 'Deployment', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'CI/CD integration', category: 'Deployment', supported: true, maturity: 'beta', quality_score: 3, notes: 'Via GitHub integration' },
    { capability: 'Infrastructure provisioning', category: 'Deployment', supported: true, maturity: 'beta', quality_score: 3, notes: 'Supabase provisioning built-in' },
    // Collaboration
    { capability: 'Real-time pair programming', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Agent-to-agent coordination', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Human review workflow', category: 'Collaboration', supported: true, maturity: 'stable', quality_score: 3, notes: 'Share project for review' },
    { capability: 'Team/shared context', category: 'Collaboration', supported: true, maturity: 'beta', quality_score: 3, notes: 'Team collaboration features' },
    // Platform
    { capability: 'CLI', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'IDE extension', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Web-based', category: 'Platform', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'API access', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Self-hostable', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
  ],

  'replit': [
    // Code Generation
    { capability: 'Single file generation', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Multi-file generation', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Full project scaffolding', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4, notes: 'Replit AI app generation' },
    { capability: 'Iterative refinement', category: 'Code Generation', supported: true, maturity: 'stable', quality_score: 4 },
    // Context & Understanding
    { capability: 'Codebase-wide context', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 3 },
    { capability: 'File-level context', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 4 },
    { capability: 'Conversation memory', category: 'Context & Understanding', supported: true, maturity: 'stable', quality_score: 3 },
    { capability: 'Documentation ingestion', category: 'Context & Understanding', supported: false, maturity: 'experimental', quality_score: 1 },
    // Tool Integration
    { capability: 'MCP support', category: 'Tool Integration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'External tool calling', category: 'Tool Integration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Browser/web access', category: 'Tool Integration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Terminal/shell access', category: 'Tool Integration', supported: true, maturity: 'mature', quality_score: 5, notes: 'Full Linux shell environment' },
    { capability: 'Git integration', category: 'Tool Integration', supported: true, maturity: 'stable', quality_score: 3, notes: 'Git via terminal and UI' },
    // Editing
    { capability: 'Inline code editing', category: 'Editing', supported: true, maturity: 'stable', quality_score: 4, notes: 'Ghostwriter autocomplete' },
    { capability: 'Multi-file coordinated edits', category: 'Editing', supported: true, maturity: 'stable', quality_score: 3 },
    { capability: 'Diff-based editing', category: 'Editing', supported: true, maturity: 'beta', quality_score: 3 },
    { capability: 'Refactoring support', category: 'Editing', supported: true, maturity: 'beta', quality_score: 3 },
    // Deployment
    { capability: 'One-click deploy', category: 'Deployment', supported: true, maturity: 'mature', quality_score: 5, notes: 'Replit Deployments — always-on hosting' },
    { capability: 'Preview environments', category: 'Deployment', supported: true, maturity: 'stable', quality_score: 4, notes: 'Live preview in-browser' },
    { capability: 'CI/CD integration', category: 'Deployment', supported: true, maturity: 'beta', quality_score: 3, notes: 'GitHub Actions via shell' },
    { capability: 'Infrastructure provisioning', category: 'Deployment', supported: true, maturity: 'beta', quality_score: 3, notes: 'Replit DB and object storage' },
    // Collaboration
    { capability: 'Real-time pair programming', category: 'Collaboration', supported: true, maturity: 'mature', quality_score: 5, notes: 'Multiplayer editing — a core Replit feature' },
    { capability: 'Agent-to-agent coordination', category: 'Collaboration', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Human review workflow', category: 'Collaboration', supported: true, maturity: 'stable', quality_score: 3, notes: 'Share Repl link' },
    { capability: 'Team/shared context', category: 'Collaboration', supported: true, maturity: 'mature', quality_score: 5, notes: 'Teams core product feature' },
    // Platform
    { capability: 'CLI', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'IDE extension', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
    { capability: 'Web-based', category: 'Platform', supported: true, maturity: 'mature', quality_score: 5 },
    { capability: 'API access', category: 'Platform', supported: true, maturity: 'stable', quality_score: 3, notes: 'Replit API for programmatic access' },
    { capability: 'Self-hostable', category: 'Platform', supported: false, maturity: 'experimental', quality_score: 1 },
  ],
}

async function seed() {
  console.log('Fetching tools from database...')

  const { data: tools, error: toolsError } = await supabase
    .from('tools')
    .select('id, slug, name')

  if (toolsError) {
    console.error('Failed to fetch tools:', toolsError)
    process.exit(1)
  }

  if (!tools || tools.length === 0) {
    console.error('No tools found. Run seed-tools.ts first.')
    process.exit(1)
  }

  console.log(`Found ${tools.length} tools: ${tools.map((t) => t.slug).join(', ')}\n`)

  let totalSuccess = 0
  let totalError = 0

  for (const tool of tools) {
    const capabilities = toolCapabilities[tool.slug]

    if (!capabilities) {
      console.warn(`No capability data defined for tool: ${tool.slug} — skipping`)
      continue
    }

    const rows = capabilities.map((cap) => ({
      tool_id: tool.id,
      capability: cap.capability,
      category: cap.category,
      supported: cap.supported,
      maturity: cap.maturity,
      quality_score: cap.quality_score,
      notes: cap.notes ?? null,
      verified_by: 'manual' as const,
      last_verified: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('ecosystem_status')
      .upsert(rows, { onConflict: 'tool_id,capability' })

    if (error) {
      console.error(`  Error seeding ${tool.name}: ${error.message}`)
      totalError += rows.length
    } else {
      console.log(`  Seeded ${rows.length} capabilities for ${tool.name}`)
      totalSuccess += rows.length
    }
  }

  console.log(`\nDone. ${totalSuccess} rows inserted/updated, ${totalError} errors.`)
}

seed()
