import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata = { title: "Cheat Sheets" };

const CHEAT_SHEETS = [
  {
    title: "Terminal Basics",
    description: "Essential terminal commands for navigating files and running scripts.",
    slug: "terminal-basics",
  },
  {
    title: "Git Commands",
    description: "Common Git commands for version control and collaboration.",
    slug: "git-commands",
  },
  {
    title: "Prompt Patterns",
    description: "Proven prompt templates for different AI coding scenarios.",
    slug: "prompt-patterns",
  },
  {
    title: "Cursor Shortcuts",
    description: "Keyboard shortcuts and productivity tips for Cursor IDE.",
    slug: "cursor-shortcuts",
  },
  {
    title: "Design Principles",
    description: "Quick reference for alignment, contrast, spacing, and hierarchy.",
    slug: "design-principles",
  },
  {
    title: "Security Checklist",
    description: "Security best practices for shipping code built with AI tools.",
    slug: "security-checklist",
  },
  {
    title: "Starter Prompts",
    description: "Copy-paste prompts to kickstart common project types.",
    slug: "starter-prompts",
  },
  {
    title: "Recommended Tools",
    description: "Curated list of tools that pair well with AI coding workflows.",
    slug: "recommended-tools",
  },
  {
    title: "Troubleshooting",
    description: "Common issues and solutions when building with AI tools.",
    slug: "troubleshooting",
  },
];

export default function CheatSheetsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Cheat Sheets</h1>
        <p className="text-muted-foreground">
          Quick reference guides for the tools and techniques covered in the
          course.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHEAT_SHEETS.map((sheet) => (
          <div
            key={sheet.slug}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <FileText className="mb-3 size-6 text-primary" />
            <h3 className="mb-1 font-medium">{sheet.title}</h3>
            <p className="text-sm text-muted-foreground">
              {sheet.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
