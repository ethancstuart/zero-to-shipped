export interface AgentTemplate {
  name: string;
  slug: string;
  description: string;
  useCase: string;
  difficulty: AgentDifficulty;
  tier: "polished" | "beta";
  buildTime: string;
  stack: string[];
  features: string[];
  repoPath: string;
}

export type AgentDifficulty = "beginner" | "intermediate" | "advanced";

export const DIFFICULTY_LABELS: Record<AgentDifficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const DIFFICULTY_COLORS: Record<AgentDifficulty, string> = {
  beginner: "text-green-400 bg-green-400/10 border-green-400/20",
  intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-red-400 bg-red-400/10 border-red-400/20",
};

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    name: "Daily AI News Digest",
    slug: "daily-ai-news-digest",
    description:
      "An agent that scans RSS feeds and news APIs every morning, summarizes the top AI stories, and emails you a clean digest before your first meeting.",
    useCase:
      "Stay current on AI without doom-scrolling. Great for PMs who need to brief stakeholders on AI trends.",
    difficulty: "beginner",
    tier: "polished",
    buildTime: "~30 minutes to fork and configure",
    stack: ["TypeScript", "Anthropic SDK", "Resend", "RSS Parser"],
    features: [
      "Configurable RSS feed sources",
      "AI-powered summarization with key takeaways",
      "Clean HTML email template",
      "Cron-scheduled via Vercel or local",
      "Customizable digest format and length",
    ],
    repoPath: "/templates/daily-ai-news-digest",
  },
  {
    name: "Council Advisory Agent",
    slug: "council-advisory-agent",
    description:
      "A multi-persona decision review system. Define a board of AI advisors with different expertise, submit a proposal, and get a structured review from every angle — then a unified verdict.",
    useCase:
      "Run strategic decisions through a diverse advisory board before committing. Based on a real system used to make every decision for Zero to Ship.",
    difficulty: "intermediate",
    tier: "polished",
    buildTime: "~45 minutes to fork and customize personas",
    stack: ["TypeScript", "Anthropic SDK", "Structured Output"],
    features: [
      "Multi-persona evaluation (3+ advisors)",
      "Structured review phases: domain review → discussion → verdict",
      "Customizable persona definitions",
      "Markdown-formatted output with clear recommendations",
      "Works with any domain — product, career, business, technical",
    ],
    repoPath: "/templates/council-advisory-agent",
  },
  {
    name: "Data Monitor Agent",
    slug: "data-monitor-agent",
    description:
      "A configurable agent that watches metrics you care about — API response times, database row counts, Stripe revenue — and alerts you when thresholds are crossed.",
    useCase:
      "Replace manual dashboard checking. Get notified only when something needs attention.",
    difficulty: "intermediate",
    tier: "beta",
    buildTime: "~1 hour to configure data sources",
    stack: ["TypeScript", "Anthropic SDK", "Supabase", "Resend"],
    features: [
      "Configurable metric sources (API, database, Stripe)",
      "Threshold-based alerting with cooldown periods",
      "AI-generated context for why a metric changed",
      "Minimum polling interval safeguard (prevents API abuse)",
      "Historical trend tracking",
    ],
    repoPath: "/templates/data-monitor-agent",
  },
  {
    name: "PR Review Agent",
    slug: "pr-review-agent",
    description:
      "An agent that reviews GitHub pull requests — checks for security issues, code quality, missing tests, and unclear naming — then posts a structured review comment.",
    useCase:
      "Get a second set of eyes on every PR. Especially useful for solo builders and small teams without dedicated code reviewers.",
    difficulty: "advanced",
    tier: "beta",
    buildTime: "~1.5 hours to configure and connect to GitHub",
    stack: ["TypeScript", "Anthropic SDK", "GitHub API", "Octokit"],
    features: [
      "Automated PR analysis on webhook trigger",
      "Security vulnerability scanning",
      "Code quality and naming convention checks",
      "Missing test detection",
      "Structured GitHub review comments",
      "Configurable review strictness levels",
    ],
    repoPath: "/templates/pr-review-agent",
  },
];

export const REPO_URL = "https://github.com/ethancstuart/zts-agent-templates";
