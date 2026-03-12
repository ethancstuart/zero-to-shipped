import type { ModuleMeta, ModuleTier, RoleTrack } from "@/types";

export const MODULE_METADATA: ModuleMeta[] = [
  // Tier 1: Foundations (Modules 1-5)
  {
    number: 1,
    slug: "setup-and-first-build",
    title: "Setup & First Build",
    tier: "foundations",
    estimatedHours: "3–5",
    description:
      "Install your tools, configure your environment, and build your first project with AI assistance.",
    prerequisites: [],
    checkpoints: [
      "Install Node.js and verify with node --version",
      "Install Git and configure your identity",
      "Install your AI coding tool (Claude Code or Cursor)",
      "Create your first project directory",
      "Generate a simple web page with AI assistance",
      "Open your project in the browser",
      "Make three iterative improvements using AI",
    ],
    roleRelevance: { pm: "core", pjm: "core", ba: "core", bi: "core" },
  },
  {
    number: 2,
    slug: "prompt-engineering",
    title: "Prompt Engineering",
    tier: "foundations",
    estimatedHours: "4–6",
    description:
      "Master the art of giving AI clear, specific instructions that produce exceptional output.",
    prerequisites: [1],
    checkpoints: [
      "Write a basic prompt and identify its weaknesses",
      "Apply the Context-Task-Format framework to improve a prompt",
      "Use role-based prompting for domain-specific output",
      "Chain prompts for a multi-step task",
      "Compare outputs from vague vs. specific prompts",
      "Build a personal prompt template library",
      "Critically evaluate AI output for errors and hallucinations",
    ],
    roleRelevance: { pm: "core", pjm: "core", ba: "core", bi: "core" },
  },
  {
    number: 3,
    slug: "how-code-works",
    title: "How Code Actually Works",
    tier: "foundations",
    estimatedHours: "3–5",
    description:
      "Build HTML, CSS, and JavaScript literacy so you can read and evaluate AI-generated code.",
    prerequisites: [1],
    checkpoints: [
      "Identify HTML elements in a web page",
      "Modify CSS styles and observe visual changes",
      "Read a JavaScript function and predict its output",
      "Trace data flow through a simple application",
      "Identify a bug in AI-generated code",
      "Explain the purpose of a code file to a non-technical person",
    ],
    roleRelevance: { pm: "core", pjm: "recommended", ba: "core", bi: "core" },
  },
  {
    number: 4,
    slug: "terminal-and-cli",
    title: "Terminal & CLI",
    tier: "foundations",
    estimatedHours: "2–3",
    description:
      "Navigate the terminal confidently to run commands, manage files, and execute scripts.",
    prerequisites: [1],
    checkpoints: [
      "Navigate directories with cd, ls, and pwd",
      "Create and manage files from the terminal",
      "Run an npm command successfully",
      "Read and interpret terminal error messages",
      "Use command history and tab completion efficiently",
    ],
    roleRelevance: {
      pm: "core",
      pjm: "recommended",
      ba: "recommended",
      bi: "core",
    },
  },
  {
    number: 5,
    slug: "version-control",
    title: "Version Control with Git",
    tier: "foundations",
    estimatedHours: "5–7",
    description:
      "Track changes, collaborate safely, and never lose work with Git and GitHub.",
    prerequisites: [1, 4],
    checkpoints: [
      "Initialize a Git repository",
      "Stage and commit changes with meaningful messages",
      "Create and switch between branches",
      "Push to GitHub and verify your repository",
      "Create a pull request with a clear description",
      "Resolve a simple merge conflict",
      "Use git log and git diff to review history",
    ],
    roleRelevance: { pm: "core", pjm: "core", ba: "recommended", bi: "core" },
  },
  // Tier 2: Intermediate (Modules 6-10)
  {
    number: 6,
    slug: "blueprints",
    title: "Blueprints & Project Architecture",
    tier: "intermediate",
    estimatedHours: "4–6",
    description:
      "Create context files and project structures that produce consistent, high-quality AI output.",
    prerequisites: [2, 5],
    checkpoints: [
      "Create a project blueprint document",
      "Write a rules/context file for your AI tool",
      "Define a file structure for a new project",
      "Use blueprints to maintain consistency across sessions",
      "Iterate on a blueprint based on output quality",
      "Create role-specific blueprint templates",
    ],
    roleRelevance: {
      pm: "core",
      pjm: "recommended",
      ba: "recommended",
      bi: "core",
    },
  },
  {
    number: 7,
    slug: "brainstorming-and-ideation",
    title: "Brainstorming & Ideation",
    tier: "intermediate",
    estimatedHours: "3–4",
    description:
      "Use AI to generate divergent ideas, challenge assumptions, and push past obvious solutions.",
    prerequisites: [2],
    checkpoints: [
      "Generate 20+ ideas for a problem space",
      "Use constraint-based prompts to push past obvious solutions",
      "Apply SCAMPER or another ideation framework with AI",
      "Evaluate and rank ideas using a scoring matrix",
      "Document your top 3 ideas with rationale",
    ],
    roleRelevance: {
      pm: "core",
      pjm: "optional",
      ba: "recommended",
      bi: "optional",
    },
  },
  {
    number: 8,
    slug: "planning-and-research",
    title: "Planning & Research",
    tier: "intermediate",
    estimatedHours: "4–5",
    description:
      "Scope projects, break down tasks, and stress-test plans using AI as a thinking partner.",
    prerequisites: [2, 6],
    checkpoints: [
      "Break a project into discrete, actionable tasks",
      "Create a project timeline with dependencies",
      "Use AI to stress-test a plan for risks",
      "Write a one-page project brief",
      "Estimate effort and identify critical path",
      "Create a decision document for a technical tradeoff",
    ],
    roleRelevance: { pm: "core", pjm: "core", ba: "core", bi: "recommended" },
  },
  {
    number: 9,
    slug: "interactive-tools",
    title: "Interactive Tools",
    tier: "intermediate",
    estimatedHours: "6–8",
    description:
      "Build interactive tools with components, state management, and data visualization.",
    prerequisites: [3, 5, 6],
    checkpoints: [
      "Build a form with input validation",
      "Implement state management for user interactions",
      "Create a data visualization (chart or graph)",
      "Add filtering and sorting to a data display",
      "Deploy an interactive tool to a live URL",
      "Handle edge cases and error states",
      "Gather feedback and iterate on your tool",
    ],
    roleRelevance: { pm: "core", pjm: "recommended", ba: "core", bi: "core" },
  },
  {
    number: 10,
    slug: "decks-and-visuals",
    title: "Decks & Visuals",
    tier: "intermediate",
    estimatedHours: "4–5",
    description:
      "Build presentations, architecture diagrams, and visual assets using AI coding tools.",
    prerequisites: [3, 6],
    checkpoints: [
      "Create a presentation with 5+ slides",
      "Build an architecture or flow diagram",
      "Generate a visual asset (icon set, illustration, or chart)",
      "Apply consistent branding to visual outputs",
      "Export visuals in multiple formats",
    ],
    roleRelevance: {
      pm: "recommended",
      pjm: "recommended",
      ba: "core",
      bi: "optional",
    },
  },
  // Tier 3: Advanced (Modules 11-15)
  {
    number: 11,
    slug: "design-principles",
    title: "Design Principles",
    tier: "advanced",
    estimatedHours: "4–5",
    description:
      "Apply alignment, contrast, spacing, and hierarchy to make your builds look professional.",
    prerequisites: [9],
    checkpoints: [
      "Audit a page for alignment issues and fix them",
      "Apply contrast to establish visual hierarchy",
      "Use consistent spacing with a defined scale",
      "Implement a typography system (headings, body, captions)",
      "Before/after: redesign a page using all four principles",
    ],
    roleRelevance: {
      pm: "recommended",
      pjm: "optional",
      ba: "recommended",
      bi: "optional",
    },
  },
  {
    number: 12,
    slug: "data-products",
    title: "Data Products",
    tier: "advanced",
    estimatedHours: "5–7",
    description:
      "Build data architectures, write queries, transform data, and display insights.",
    prerequisites: [9],
    checkpoints: [
      "Design a data schema for a use case",
      "Write SQL queries to extract insights",
      "Build a data transformation pipeline",
      "Create an interactive data dashboard",
      "Implement data validation and quality checks",
      "Document your data product for stakeholders",
    ],
    roleRelevance: { pm: "recommended", pjm: "optional", ba: "core", bi: "core" },
  },
  {
    number: 13,
    slug: "automations",
    title: "Automations & Workflows",
    tier: "advanced",
    estimatedHours: "5–6",
    description:
      "Build Python scripts for repetitive tasks and create an automation decision framework.",
    prerequisites: [4, 6],
    checkpoints: [
      "Identify a manual workflow worth automating",
      "Write a Python script to automate a repetitive task",
      "Add error handling and logging to your script",
      "Schedule an automation to run periodically",
      "Apply the automation decision framework to 3 workflows",
      "Document your automation for handoff",
    ],
    roleRelevance: {
      pm: "optional",
      pjm: "recommended",
      ba: "recommended",
      bi: "core",
    },
  },
  {
    number: 14,
    slug: "docs-security-testing-shipping",
    title: "Documentation, Security, Testing & Shipping",
    tier: "advanced",
    estimatedHours: "5–6",
    description:
      "Read documentation effectively, apply security best practices, write tests, and deploy.",
    prerequisites: [5, 9],
    checkpoints: [
      "Navigate and extract information from technical docs",
      "Identify and fix a security vulnerability",
      "Write automated tests for a feature",
      "Set up a CI/CD pipeline",
      "Deploy a project with environment variables",
      "Create a README that explains your project",
    ],
    roleRelevance: {
      pm: "recommended",
      pjm: "core",
      ba: "optional",
      bi: "recommended",
    },
  },
  {
    number: 15,
    slug: "collaboration",
    title: "Collaboration & Working with Engineers",
    tier: "advanced",
    estimatedHours: "4–5",
    description:
      "Collaborate on code with Git workflows, code review, and prototype handoff.",
    prerequisites: [5, 6],
    checkpoints: [
      "Create a feature branch and submit a PR",
      "Review someone else's code and leave constructive feedback",
      "Write a technical specification for a feature",
      "Hand off a prototype with clear documentation",
      "Pair-build a feature using AI tools collaboratively",
    ],
    roleRelevance: {
      pm: "core",
      pjm: "core",
      ba: "recommended",
      bi: "recommended",
    },
  },
  // Capstone (Module 16)
  {
    number: 16,
    slug: "capstone",
    title: "Capstone Project",
    tier: "capstone",
    estimatedHours: "10–15",
    description:
      "Apply everything you've learned to build, ship, and present a real project.",
    prerequisites: [5, 6, 9, 14],
    checkpoints: [
      "Identify a real problem worth solving",
      "Research and create a project plan",
      "Set up project with blueprints and version control",
      "Build the core functionality",
      "Apply design principles to polish the UI",
      "Test and fix edge cases",
      "Document and ship to a live URL",
      "Write a reflection on your learning journey",
    ],
    roleRelevance: { pm: "core", pjm: "core", ba: "core", bi: "core" },
  },
];

export function getModuleBySlug(slug: string): ModuleMeta | undefined {
  return MODULE_METADATA.find((m) => m.slug === slug);
}

export function getModuleByNumber(num: number): ModuleMeta | undefined {
  return MODULE_METADATA.find((m) => m.number === num);
}

export function getModulesByTier(tier: ModuleMeta["tier"]): ModuleMeta[] {
  return MODULE_METADATA.filter((m) => m.tier === tier);
}

export function arePrerequisitesMet(
  moduleNumber: number,
  completedModules: number[]
): boolean {
  const mod = getModuleByNumber(moduleNumber);
  if (!mod) return false;
  return mod.prerequisites.every((p) => completedModules.includes(p));
}
