// Public site URL. Resolution order:
//   1. NEXT_PUBLIC_SITE_URL (explicit override — preferred for prod)
//   2. VERCEL_URL (auto-set on Vercel preview/prod builds, https-prefixed)
//   3. https://zerotoship.app (final fallback — current production hostname)
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  'https://zerotoship.app';

export const siteConfig = {
  name: 'Prototype Studio',
  description: 'Learn to build real products with AI. Watch sessions. Follow guides. Set up your own agent system.',
  url: SITE_URL,
  ogImage: `${SITE_URL}/og-default.png`,
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
