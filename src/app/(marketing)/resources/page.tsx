import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  FileCode2,
  MessageSquare,
  FileText,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Free guides, templates, prompt libraries, and cheat sheets for building with AI coding tools.",
};

const GUIDES = [
  {
    title: "Git for Product Managers",
    description: "5 commands you'll use every day + branching basics.",
    href: "/guides/git-101",
    status: "live" as const,
  },
  {
    title: "Claude Code for Non-Engineers",
    description: "Build real software with AI — no coding experience required.",
    href: "/guides/claude-code-101",
    status: "live" as const,
  },
  {
    title: "Git 102: Collaboration Workflows",
    description: "PRs, code review, and working with engineering teams.",
    href: "#",
    status: "coming" as const,
  },
  {
    title: "Git 103: CI/CD for Non-Engineers",
    description: "Automated deployments and why they matter.",
    href: "#",
    status: "coming" as const,
  },
];

const RESOURCES = [
  {
    icon: FileCode2,
    title: "MCP Toolkit",
    description:
      "Curated directory of MCP plugins for non-engineers — connect Claude Code to GitHub, Slack, databases, and more.",
    href: "/resources/mcp-plugins",
    external: false,
  },
  {
    icon: FileCode2,
    title: "CLAUDE.md Templates",
    description:
      "3 ready-to-use templates for Next.js + Supabase, data dashboards, and automation projects.",
    href: "https://github.com/ethancstuart/zts-claude-templates",
    external: true,
  },
  {
    icon: MessageSquare,
    title: "Prompt Library",
    description:
      "Curated prompts for building, debugging, refactoring, explaining, and deploying with AI.",
    href: "https://github.com/ethancstuart/zts-prompt-library",
    external: true,
  },
  {
    icon: FileText,
    title: "Cheat Sheets",
    description:
      "Quick-reference guides for every module — from setup to deployment.",
    href: "/dashboard",
    external: false,
  },
];

export default function ResourcesPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Resources</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Free guides, templates, and tools to help you build with AI — whether
            or not you&apos;re enrolled in the course.
          </p>
        </div>

        {/* Guides */}
        <section className="mb-16">
          <div className="mb-6 flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            <h2 className="text-xl font-bold">Guides</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {GUIDES.map((guide) => (
              <div
                key={guide.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h3 className="mb-1 font-semibold">{guide.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {guide.description}
                </p>
                {guide.status === "live" ? (
                  <Link
                    href={guide.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Read guide <ArrowRight className="size-3" />
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground/60">
                    Coming soon
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Templates, Prompts, Cheat Sheets */}
        <section className="mb-16">
          <div className="mb-6 flex items-center gap-2">
            <FileCode2 className="size-5 text-primary" />
            <h2 className="text-xl font-bold">Templates &amp; Tools</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {RESOURCES.map((resource) => (
              <div
                key={resource.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <resource.icon className="mb-3 size-6 text-primary" />
                <h3 className="mb-1 font-semibold">{resource.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {resource.description}
                </p>
                <a
                  href={resource.href}
                  target={resource.external ? "_blank" : undefined}
                  rel={resource.external ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {resource.external ? "View on GitHub" : "View cheat sheets"}
                  {resource.external ? (
                    <ExternalLink className="size-3" />
                  ) : (
                    <ArrowRight className="size-3" />
                  )}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="mb-2 text-xl font-bold">Want the full curriculum?</h2>
          <p className="mb-6 text-muted-foreground">
            16 hands-on modules, gamified progress, and a certificate of completion.
          </p>
          <Button render={<Link href="/pricing" />} size="lg">
            See Pricing
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
