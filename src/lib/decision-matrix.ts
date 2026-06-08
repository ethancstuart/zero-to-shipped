/**
 * Tool Decision Matrix
 *
 * Encodes Ethan's editorial POV for which AI coding tool to reach for given a
 * user's situation. Two modes:
 *   - recommendQuick: 3 questions, instant routing
 *   - recommendDeep:  7 questions, more nuanced routing with boosts/penalties
 *
 * The voice is first-person ("I'd reach for X because...") because the wizard
 * is Ethan's editorial recommendation, not the platform's neutral verdict.
 */

export type QuickAnswers = {
  building: 'web-app' | 'internal-tool' | 'automation' | 'prototype' | 'doc-spec'
  comfort: 'terminal-scary' | 'can-install' | 'terminal-native'
  preference: 'just-done' | 'learn-craft'
}

export type DeepAnswers = QuickAnswers & {
  output: 'code-i-read' | 'just-works' | 'visual-ui'
  size: 'quick-prototype' | 'production-app' | 'long-term'
  budget: 'free-only' | 'pay-per-token' | 'subscription-ok'
  team: 'solo' | 'small-team' | 'with-engineers'
}

export type ToolSlug =
  | 'claude-code'
  | 'codex'
  | 'cursor'
  | 'lovable'
  | 'v0'
  | 'bolt'
  | 'replit'
  | 'windsurf'
  | 'gemini-cli'

export type Recommendation = {
  primary: { slug: ToolSlug; company: string; reasoning: string }
  alternates: { slug: ToolSlug; company: string; whenToPick: string }[]
}

/* ------------------------------------------------------------------------- */
/*  Tool metadata                                                            */
/* ------------------------------------------------------------------------- */

const TOOL_META: Record<ToolSlug, { name: string; company: string }> = {
  'claude-code': { name: 'Claude Code', company: 'anthropic' },
  codex: { name: 'Codex', company: 'openai' },
  cursor: { name: 'Cursor', company: 'cursor' },
  lovable: { name: 'Lovable', company: 'lovable' },
  v0: { name: 'v0', company: 'vercel' },
  bolt: { name: 'Bolt', company: 'stackblitz' },
  replit: { name: 'Replit', company: 'replit' },
  windsurf: { name: 'Windsurf', company: 'codeium' },
  'gemini-cli': { name: 'Gemini CLI', company: 'google' },
}

export function getToolMeta(slug: ToolSlug) {
  return TOOL_META[slug]
}

/* ------------------------------------------------------------------------- */
/*  Editorial reasoning copy — Ethan's voice                                 */
/* ------------------------------------------------------------------------- */

const REASONING = {
  cursorTerminalScary:
    "For your situation, I'd reach for Cursor. It's VS Code with AI built in — you keep the familiar IDE, the chat sidebar handles most asks, and you never have to open a terminal to ship something real. This is where most of my non-engineer friends start, and most of them never need to graduate to anything heavier.",
  claudeCodeCraft:
    "If you're past the comfort question and want to learn the craft, I'd point you at Claude Code. Anthropic's CLI rewards taking the time to set up your CLAUDE.md properly — the AI remembers what your project is. The reason I keep coming back to it is depth: multi-file edits work, the persistence is real, and you become a better operator the more you use it.",
  codexLeadingEdge:
    "Right now, this quarter, I'd push you toward Codex. It's where the leading edge is — OpenAI shipping fast, strong models, the workflow feels confident. A few months ago I'd have said Claude Code, which tells you how fast this landscape moves. If Codex doesn't click, Claude Code is the safety net.",
  lovablePrototype:
    "For a prototype or visual artifact, I'd send you to Lovable. Browser-based, polish-first, no terminal required. You can have something pretty to show in 20 minutes. The trade-off: less suited to long-lived production apps, but that's not what you're building today.",
  cursorWebApp:
    "For a real web app with a real future, Cursor is the move. You'll be in your code daily — you want an editor that feels like home with AI superpowers, not a CLI you have to learn first. Once you're a few months in and want more depth, Claude Code is your upgrade path.",
  v0VisualUi:
    "For a visual UI artifact, I'd reach for v0. Vercel's tool is purpose-built for generating React components you can drop into a real codebase later. It's the fastest path from 'what should this look like' to 'here's a working component'.",
  boltSeeItBuilt:
    "For something between prototype and production where you want to watch it get built, Bolt is the move. StackBlitz's platform shows you the code as it writes itself, so you learn while you ship.",
  replitVisualApproachable:
    "For visual, approachable building with a real runtime, Replit is the move. It's the most welcoming on-ramp into actually-running code — no install, no setup, and you can share what you built with a link.",
}

/* ------------------------------------------------------------------------- */
/*  Alternate copy                                                            */
/* ------------------------------------------------------------------------- */

const ALT_COPY: Partial<Record<ToolSlug, string>> = {
  lovable: 'Pick Lovable if you want a polished, browser-based visual builder with no setup.',
  v0: 'Pick v0 if you mostly need UI components you can paste into a bigger codebase.',
  bolt: 'Pick Bolt if you want to see the code being written and learn while shipping.',
  cursor: 'Pick Cursor if a familiar IDE matters more than a cutting-edge CLI.',
  'claude-code': 'Pick Claude Code if you want the trusted depth — CLAUDE.md persistence and reliable multi-file edits.',
  codex: 'Pick Codex if you want the leading edge — OpenAI is shipping fast right now.',
  replit: 'Pick Replit if you want the most approachable visual on-ramp with a real runtime.',
  windsurf: 'Pick Windsurf if you want an IDE-style experience with a different agentic flavor than Cursor.',
}

function makeAlternates(slugs: ToolSlug[]): Recommendation['alternates'] {
  return slugs
    .filter((s): s is ToolSlug => !!TOOL_META[s])
    .slice(0, 2)
    .map((slug) => ({
      slug,
      company: TOOL_META[slug].company,
      whenToPick: ALT_COPY[slug] ?? `Pick ${TOOL_META[slug].name} as a strong alternative.`,
    }))
}

function makePrimary(slug: ToolSlug, reasoning: string): Recommendation['primary'] {
  return { slug, company: TOOL_META[slug].company, reasoning }
}

/* ------------------------------------------------------------------------- */
/*  Quick mode                                                                */
/* ------------------------------------------------------------------------- */

export function recommendQuick(answers: QuickAnswers): Recommendation {
  const { building, comfort, preference } = answers

  // Rule 1: terminal-scary → Cursor (regardless of preference)
  if (comfort === 'terminal-scary') {
    const alts: ToolSlug[] = []
    if (building === 'prototype' || building === 'doc-spec') {
      alts.push('lovable', 'v0')
    } else {
      alts.push('lovable', 'v0')
    }
    return {
      primary: makePrimary('cursor', REASONING.cursorTerminalScary),
      alternates: makeAlternates(alts),
    }
  }

  // Rule 4: prototype/doc-spec + can-install → Lovable
  if ((building === 'prototype' || building === 'doc-spec') && comfort === 'can-install') {
    return {
      primary: makePrimary('lovable', REASONING.lovablePrototype),
      alternates: makeAlternates(['v0', 'bolt']),
    }
  }

  // Rule 2: terminal-native + learn-craft → Claude Code
  if (comfort === 'terminal-native' && preference === 'learn-craft') {
    return {
      primary: makePrimary('claude-code', REASONING.claudeCodeCraft),
      alternates: makeAlternates(['codex', 'cursor']),
    }
  }

  // Rule 3: terminal-native + just-done → Codex
  if (comfort === 'terminal-native' && preference === 'just-done') {
    return {
      primary: makePrimary('codex', REASONING.codexLeadingEdge),
      alternates: makeAlternates(['claude-code', 'cursor']),
    }
  }

  // Rule 5: web-app + can-install → Cursor
  if (building === 'web-app' && comfort === 'can-install') {
    return {
      primary: makePrimary('cursor', REASONING.cursorWebApp),
      alternates: makeAlternates(['bolt', 'claude-code']),
    }
  }

  // Fallback for remaining can-install combos (internal-tool, automation)
  // — these are pragmatic "real software" cases. Send to Cursor with
  // Claude Code as the upgrade path.
  return {
    primary: makePrimary('cursor', REASONING.cursorWebApp),
    alternates: makeAlternates(['claude-code', 'lovable']),
  }
}

/* ------------------------------------------------------------------------- */
/*  Deep mode                                                                 */
/* ------------------------------------------------------------------------- */

/**
 * Deep mode starts from the quick recommendation, then applies score-based
 * boosts/penalties from the additional dimensions. The tool with the highest
 * final score wins. Tie-breaking preserves quick-mode's primary.
 */
export function recommendDeep(answers: DeepAnswers): Recommendation {
  const quick = recommendQuick(answers)

  // Start scores: primary gets a baseline lead so a single boost can't
  // flip the recommendation, but two coherent boosts will.
  const scores: Partial<Record<ToolSlug, number>> = {
    [quick.primary.slug]: 5,
  }
  for (const alt of quick.alternates) {
    scores[alt.slug] = (scores[alt.slug] ?? 0) + 3
  }

  function bump(slug: ToolSlug, delta: number) {
    scores[slug] = (scores[slug] ?? 0) + delta
  }

  // output: visual-ui boosts visual builders
  if (answers.output === 'visual-ui') {
    bump('v0', 4)
    bump('lovable', 4)
    bump('bolt', 3)
    bump('replit', 2)
    bump('cursor', -1)
    bump('claude-code', -2)
    bump('codex', -2)
  }
  if (answers.output === 'code-i-read') {
    bump('cursor', 2)
    bump('claude-code', 2)
    bump('codex', 2)
    bump('lovable', -2)
  }
  if (answers.output === 'just-works') {
    bump('lovable', 2)
    bump('replit', 2)
    bump('v0', 1)
  }

  // team: with-engineers prefers tools that produce reviewable diffs
  if (answers.team === 'with-engineers') {
    bump('claude-code', 3)
    bump('codex', 3)
    bump('cursor', 2)
    bump('lovable', -2)
    bump('replit', -2)
  }
  if (answers.team === 'solo') {
    // No strong push; everything is fine solo.
    bump('cursor', 1)
  }

  // budget: free-only de-emphasizes Codex (paid API)
  if (answers.budget === 'free-only') {
    bump('codex', -4)
    bump('cursor', 3)
    bump('bolt', 2)
    bump('lovable', 1)
    bump('replit', 2)
  }
  if (answers.budget === 'subscription-ok') {
    bump('cursor', 2)
    bump('claude-code', 1)
  }

  // size: long-term prefers persistence
  if (answers.size === 'long-term') {
    bump('claude-code', 3)
    bump('codex', 2)
    bump('cursor', 2)
    bump('lovable', -2)
    bump('v0', -2)
  }
  if (answers.size === 'quick-prototype') {
    bump('lovable', 3)
    bump('v0', 3)
    bump('bolt', 2)
    bump('claude-code', -1)
  }
  if (answers.size === 'production-app') {
    bump('cursor', 2)
    bump('claude-code', 2)
    bump('codex', 1)
  }

  // Pick winner.
  const ranked = (Object.entries(scores) as [ToolSlug, number][])
    .sort((a, b) => b[1] - a[1])

  const winnerSlug = ranked[0][0]
  const winnerReasoning = pickDeepReasoning(winnerSlug, answers)

  // Alternates: next two distinct slugs.
  const altSlugs = ranked
    .map(([slug]) => slug)
    .filter((slug) => slug !== winnerSlug)
    .slice(0, 2)

  return {
    primary: makePrimary(winnerSlug, winnerReasoning),
    alternates: makeAlternates(altSlugs),
  }
}

function pickDeepReasoning(slug: ToolSlug, answers: DeepAnswers): string {
  // If the winner matches what quick mode would have said, use the quick copy
  // since it's already calibrated. Otherwise, synthesize a deep-mode reason.
  const quick = recommendQuick(answers)
  if (quick.primary.slug === slug) return quick.primary.reasoning

  switch (slug) {
    case 'cursor':
      return REASONING.cursorWebApp
    case 'claude-code':
      return REASONING.claudeCodeCraft
    case 'codex':
      return REASONING.codexLeadingEdge
    case 'lovable':
      return REASONING.lovablePrototype
    case 'v0':
      return REASONING.v0VisualUi
    case 'bolt':
      return REASONING.boltSeeItBuilt
    case 'replit':
      return REASONING.replitVisualApproachable
    default:
      return REASONING.cursorWebApp
  }
}
