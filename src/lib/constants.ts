export const siteConfig = {
  name: "Zero to Ship",
  title: "Zero to Ship — Build with AI, No Engineering Degree Required",
  description:
    "A gamified learning platform teaching PMs, Project Managers, BAs, and BI Engineers to build real products with AI coding tools.",
  url: "https://zerotoship.app",
  ogImage: "/og.png",
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
