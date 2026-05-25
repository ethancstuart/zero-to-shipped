export const siteConfig = {
  name: 'Prototype Studio',
  description: 'Learn to build real products with AI. Watch sessions. Follow guides. Set up your own agent system.',
  url: 'https://prototypestudio.dev',
  ogImage: '/og-default.png',
  creator: 'Prototype Studio',
  keywords: [
    'AI prototyping',
    'vibe coding',
    'claude code',
    'cursor',
    'gemini cli',
    'AI agents',
    'build with AI',
  ],
};

export const TIER_LABELS = {
  foundations: "Tier 1: Foundations",
  intermediate: "Tier 2: Intermediate",
  advanced: "Tier 3: Advanced",
  capstone: "Capstone",
} as const;

export const ROLE_LABELS = {
  pm: "Product Manager",
  pjm: "Project Manager",
  ba: "Business Analyst",
  bi: "BI Engineer",
} as const;

export const TOOL_LABELS = {
  "claude-code": "Claude Code",
  cursor: "Cursor",
} as const;
