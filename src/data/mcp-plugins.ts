export interface MCPPlugin {
  name: string;
  slug: string;
  category: MCPCategory;
  description: string;
  useCase: string;
  url: string;
  installCommand: string;
  verified: boolean;
  lastVerified: string;
}

export type MCPCategory =
  | "filesystem"
  | "search"
  | "developer"
  | "communication"
  | "data"
  | "productivity";

export const CATEGORY_LABELS: Record<MCPCategory, string> = {
  filesystem: "Filesystem",
  search: "Search & Web",
  developer: "Developer Tools",
  communication: "Communication",
  data: "Data & Databases",
  productivity: "Productivity",
};

export const CATEGORY_ICONS: Record<MCPCategory, string> = {
  filesystem: "FolderOpen",
  search: "Search",
  developer: "GitBranch",
  communication: "MessageSquare",
  data: "Database",
  productivity: "Zap",
};

export const MCP_PLUGINS: MCPPlugin[] = [
  // Filesystem
  {
    name: "Filesystem",
    slug: "filesystem",
    category: "filesystem",
    description:
      "Read, write, and manage files on your local machine. Essential for any project that needs to create or modify files outside your working directory.",
    useCase: "Reading config files, writing reports, organizing project assets",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    installCommand: "claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/dir",
    verified: true,
    lastVerified: "2026-03-29",
  },
  {
    name: "Memory",
    slug: "memory",
    category: "filesystem",
    description:
      "Persistent key-value memory that survives between sessions. Claude can store and recall information across conversations.",
    useCase: "Remembering project decisions, tracking preferences, storing context between sessions",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
    installCommand: "claude mcp add memory -- npx -y @modelcontextprotocol/server-memory",
    verified: true,
    lastVerified: "2026-03-29",
  },

  // Search & Web
  {
    name: "Brave Search",
    slug: "brave-search",
    category: "search",
    description:
      "Web search powered by Brave. Claude can search the internet for current information, documentation, and answers.",
    useCase: "Researching APIs, finding documentation, checking current best practices",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
    installCommand: "claude mcp add brave-search -- npx -y @modelcontextprotocol/server-brave-search",
    verified: true,
    lastVerified: "2026-03-29",
  },
  {
    name: "Fetch",
    slug: "fetch",
    category: "search",
    description:
      "Fetch and read web pages, APIs, and online resources. Converts HTML to readable markdown for Claude to process.",
    useCase: "Reading documentation, scraping product pages, consuming REST APIs",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    installCommand: "claude mcp add fetch -- npx -y @modelcontextprotocol/server-fetch",
    verified: true,
    lastVerified: "2026-03-29",
  },
  {
    name: "Puppeteer",
    slug: "puppeteer",
    category: "search",
    description:
      "Control a headless browser. Navigate pages, take screenshots, fill forms, and extract data from dynamic websites.",
    useCase: "Testing your app, scraping JavaScript-rendered content, automating web workflows",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
    installCommand: "claude mcp add puppeteer -- npx -y @modelcontextprotocol/server-puppeteer",
    verified: true,
    lastVerified: "2026-03-29",
  },

  // Developer Tools
  {
    name: "GitHub",
    slug: "github",
    category: "developer",
    description:
      "Full GitHub integration. Create repos, manage issues, open pull requests, review code, and manage releases — all through Claude.",
    useCase: "Managing project repos, creating issues from specs, reviewing PRs",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
    installCommand: "claude mcp add github -- npx -y @modelcontextprotocol/server-github",
    verified: true,
    lastVerified: "2026-03-29",
  },
  {
    name: "GitLab",
    slug: "gitlab",
    category: "developer",
    description:
      "GitLab integration for managing repositories, merge requests, issues, and CI/CD pipelines.",
    useCase: "Enterprise teams using GitLab for source control and DevOps",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/gitlab",
    installCommand: "claude mcp add gitlab -- npx -y @modelcontextprotocol/server-gitlab",
    verified: false,
    lastVerified: "2026-03-29",
  },
  {
    name: "Sentry",
    slug: "sentry",
    category: "developer",
    description:
      "Query error tracking data from Sentry. Find bugs, analyze error patterns, and investigate production issues.",
    useCase: "Debugging production errors, monitoring app health, triaging issues",
    url: "https://github.com/getsentry/sentry-mcp",
    installCommand: "claude mcp add sentry -- npx -y @sentry/mcp-server",
    verified: true,
    lastVerified: "2026-03-29",
  },

  // Communication
  {
    name: "Slack",
    slug: "slack",
    category: "communication",
    description:
      "Read and send Slack messages, manage channels, and search conversation history. Turn Slack threads into actionable tasks.",
    useCase: "Summarizing channels, drafting messages, extracting action items from threads",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
    installCommand: "claude mcp add slack -- npx -y @modelcontextprotocol/server-slack",
    verified: true,
    lastVerified: "2026-03-29",
  },
  {
    name: "Google Drive",
    slug: "google-drive",
    category: "communication",
    description:
      "Access Google Drive files — read docs, spreadsheets, and presentations. Search across your Drive.",
    useCase: "Pulling data from shared spreadsheets, reading project docs, searching for specs",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive",
    installCommand: "claude mcp add gdrive -- npx -y @modelcontextprotocol/server-gdrive",
    verified: false,
    lastVerified: "2026-03-29",
  },

  // Data & Databases
  {
    name: "PostgreSQL",
    slug: "postgresql",
    category: "data",
    description:
      "Connect directly to PostgreSQL databases. Run queries, inspect schemas, and analyze data without leaving your AI tool.",
    useCase: "Querying production data, building reports, exploring database schemas",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
    installCommand: "claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres postgresql://localhost/mydb",
    verified: true,
    lastVerified: "2026-03-29",
  },
  {
    name: "SQLite",
    slug: "sqlite",
    category: "data",
    description:
      "Read and query SQLite databases. Perfect for local data analysis, prototyping, and working with embedded databases.",
    useCase: "Analyzing local datasets, prototyping data models, querying app databases",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite",
    installCommand: "claude mcp add sqlite -- npx -y @modelcontextprotocol/server-sqlite /path/to/database.db",
    verified: true,
    lastVerified: "2026-03-29",
  },

  // Productivity
  {
    name: "Linear",
    slug: "linear",
    category: "productivity",
    description:
      "Manage Linear issues, projects, and cycles. Create tickets from code context, update status, and track project progress.",
    useCase: "Creating issues from bug reports, updating project status, sprint planning",
    url: "https://github.com/jerhadf/linear-mcp-server",
    installCommand: "claude mcp add linear -- npx -y linear-mcp-server",
    verified: false,
    lastVerified: "2026-03-29",
  },
  {
    name: "Notion",
    slug: "notion",
    category: "productivity",
    description:
      "Read and write Notion pages, databases, and blocks. Turn your Notion workspace into a data source for Claude.",
    useCase: "Pulling specs from Notion, updating project wikis, creating pages from templates",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/notion",
    installCommand: "claude mcp add notion -- npx -y @modelcontextprotocol/server-notion",
    verified: false,
    lastVerified: "2026-03-29",
  },
];
