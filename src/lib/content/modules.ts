import type { ModuleMeta } from "@/types";

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
    ships: "A working web app built from a plain-English prompt, running in a browser with a real URL.",
    prerequisites: [],
    checkpoints: [
      "Install Cursor (or Claude Code), Node.js, Python, and Git",
      "Build a working application from a natural language prompt",
      "Run your app in the browser",
      "Iterate at least 5 times, improving the app with each iteration",
      "Describe the build loop (prompt → review → run → evaluate → iterate)",
      "Debug at least one thing that broke using the debugging protocol",
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
    ships: "Three versions of the same app showing how prompt quality changes the output — documented and committed.",
    prerequisites: [1],
    checkpoints: [
      "Build the same application three times with three different prompt quality levels",
      "Identify the five elements of a good prompt (context, constraints, examples, definition of done, format)",
      "Save all three versions and document the differences",
      "Articulate the critical evaluation framework (works? solves the problem? correct? complete? would you put your name on it?)",
      "Write the 1-page reflection",
      "Name at least 2 situations where you should NOT use AI",
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
    ships: "Your Module 1 project with 10+ code annotations explaining what each part does.",
    prerequisites: [1],
    checkpoints: [
      "Identify HTML, CSS, JavaScript, and Python by sight",
      "Explain what each of the three web layers does (structure, style, behavior)",
      "Annotate your Module 1 project with 10+ comments explaining code sections",
      "Read an error message and identify the error type and location",
      "Complete the error reading practice (introduce and diagnose 3 errors)",
      "Explain what an API is without using the phrase 'Application Programming Interface'",
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
    ships: "A set of CLI scripts that automate at least one task in your daily workflow.",
    prerequisites: [1],
    checkpoints: [
      "Open the terminal in your AI tool without looking up how",
      "Complete the 10-task navigation exercise",
      "Navigate to any folder on your computer using cd",
      "List files, create folders, and create files from the terminal",
      "Use AI in the terminal to generate at least 3 commands you didn't know",
      "When something isn't working, instinctively check pwd and ls",
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
    ships: "A version-controlled project on GitHub with 5+ commits, a branch, and a merged pull request.",
    prerequisites: [1, 4],
    checkpoints: [
      "Your Module 1 project (or a new project) is in a GitHub repository",
      "You have 5+ commits with meaningful messages",
      "Create at least one branch and merge it via pull request",
      "Resolve at least one merge conflict",
      "Your repo has a .gitignore that excludes .env and system files",
      "Explain commits, branches, merging, and pull requests without jargon",
      "Run git status instinctively when something seems off",
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
    ships: "A project blueprint with rule files that make AI follow your conventions without being asked.",
    prerequisites: [2, 5],
    checkpoints: [
      "Have a .cursor/rules/ directory (or CLAUDE.md) with 3+ rule files in a project",
      "Complete the before/after comparison and document the differences",
      "Commit your blueprints to Git",
      "Explain what blueprints do and why they matter to a non-technical colleague",
      "Test that the AI follows your conventions without explicit prompting",
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
    ships: "A documented ideation session with 20+ ideas, evaluated and committed to Git.",
    prerequisites: [2],
    checkpoints: [
      "Complete a structured brainstorming session with 20+ ideas",
      "Use at least 3 different ideation techniques",
      "Critically evaluate each idea for originality (Obvious / Interesting / Novel)",
      "Identify which ideas you would NOT have reached without AI",
      "Document the session in a file, committed to Git",
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
    ships: "A scoped project plan with task breakdown, estimates, and a stress-tested research synthesis.",
    prerequisites: [2, 6],
    checkpoints: [
      "Complete a project scoping exercise with Must Have / Should Have / Won't Have",
      "Create a task breakdown with estimates and dependencies",
      "Stress-test a plan and document the results",
      "Complete a research synthesis from multiple sources",
      "Fact-check at least 3 specific claims and document accuracy",
      "Articulate when to use AI for planning vs. when to plan with humans",
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
    ships: "A multi-component interactive tool deployed to a live URL with real user feedback.",
    prerequisites: [3, 5, 6],
    checkpoints: [
      "Build a multi-component application (not a single-page experiment)",
      "Deploy it to a live URL",
      "At least one other person has used it and given feedback",
      "Code is in Git with meaningful commits and blueprints",
      "Explain component thinking in your own words",
      "Evaluate the build vs. buy tradeoff for your tool",
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
    ships: "A presentation deck with charts and a standalone architecture diagram, exported and committed.",
    prerequisites: [3, 6],
    checkpoints: [
      "Build a presentation deck with 8+ slides",
      "Deck includes at least one chart and one diagram",
      "Create at least one standalone architecture or process diagram",
      "Export deliverables to shareable formats (PDF, PNG, SVG)",
      "Commit everything to Git",
      "Articulate when to use your AI tool vs. traditional presentation tools",
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
    ships: "A restyled project that looks noticeably more professional, with before/after documentation.",
    prerequisites: [9],
    checkpoints: [
      "Restyle a previous project using the four design principles",
      "Document before/after with specific explanations for each change",
      "Name the four principles (alignment, contrast, spacing, hierarchy)",
      "Apply a consistent color palette (5 or fewer colors)",
      "Apply a consistent typography scale",
      "The restyled project looks noticeably more professional",
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
    ships: "A data product prototype with charts, table, summary metrics, and a production handoff doc.",
    prerequisites: [9],
    checkpoints: [
      "Create a realistic synthetic dataset (30+ records)",
      "Build a data product prototype with charts, table, and summary metrics",
      "Filters work correctly across all components",
      "Write at least 2 SQL queries and explain them",
      "Write a production handoff document",
      "Verify calculations manually for at least 3 metrics",
      "Explain the staging → intermediate → mart data architecture pattern",
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
    ships: "A working automation that runs on a schedule, logs its actions, and has a documented ROI estimate.",
    prerequisites: [4, 6],
    checkpoints: [
      "Build at least one working automation",
      "Automation has error handling (doesn't crash silently)",
      "Automation has logging (you can see what it did)",
      "Write a README documenting what it does and how to run it",
      "Estimate time saved per week",
      "Articulate whether the automation was worth building (ROI)",
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
    ships: "A security-audited, documented project with test coverage — shipped to a live URL.",
    prerequisites: [5, 9],
    checkpoints: [
      "Complete security audit on all course projects",
      "Fix any security issues found (credentials, .gitignore gaps)",
      "Read documentation for a new library and integrate it without AI-only guidance",
      "Ship at least one project with user-facing documentation",
      "Walk through the security checklist for any project you've built",
      "Describe the difference between manual testing and hoping",
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
    ships: "A merged pull request on someone else's project, plus a handoff document for one of yours.",
    prerequisites: [5, 6],
    checkpoints: [
      "Contribute to someone else's project via a pull request",
      "Review at least one PR (real or simulated) with specific, constructive feedback",
      "Write a handoff document for one of your projects",
      "Have someone read your handoff doc and incorporate their feedback",
      "Describe the feature branch workflow",
      "Articulate how your technical literacy changes the product-engineering dynamic",
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
    ships: "A complete product solving a real problem — live URL, user documentation, and a certificate of completion.",
    prerequisites: [5, 6, 9, 14],
    checkpoints: [
      "Solve a real, clearly articulated problem with a defined target user",
      "Plan and scope the project (scope document, task breakdown, or project plan)",
      "Set up project with blueprints, logical structure, and version control (10+ commits)",
      "Build core functionality that runs without errors and handles edge cases",
      "Apply design principles — clean, consistent, stakeholder-ready",
      "Ship to a live URL with user-facing documentation and README",
      "Write a reflection covering approach, decisions, what worked, and what didn't",
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

export function getCoreModulesForRole(role: import("@/types").RoleTrack): number[] {
  return MODULE_METADATA
    .filter((m) => m.roleRelevance[role] === "core")
    .map((m) => m.number);
}

export function arePrerequisitesMet(
  moduleNumber: number,
  completedModules: number[]
): boolean {
  const mod = getModuleByNumber(moduleNumber);
  if (!mod) return false;
  return mod.prerequisites.every((p) => completedModules.includes(p));
}
