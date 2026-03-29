import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  ExternalLink,
  FolderOpen,
  GitBranch,
  MessageSquare,
  Search,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MCP_PLUGINS,
  CATEGORY_LABELS,
  type MCPCategory,
} from "@/data/mcp-plugins";
import { siteConfig } from "@/lib/constants";
import { MCPFilterClient } from "./mcp-filter-client";

export const metadata: Metadata = {
  title: "MCP Plugins for Non-Engineers",
  description:
    "A curated directory of MCP plugins that connect your AI coding tools to external services. Filtered for non-engineers — no CS degree required.",
  openGraph: {
    title: "MCP Plugins for Non-Engineers",
    description:
      "A curated directory of MCP plugins that connect your AI coding tools to external services.",
    url: `${siteConfig.url}/resources/mcp-plugins`,
    images: [
      {
        url: `/api/og?template=guide&title=${encodeURIComponent("MCP Plugins for Non-Engineers")}&subtitle=${encodeURIComponent("The Non-Engineer's MCP Toolkit — Zero to Ship")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

const CATEGORY_ICON_MAP: Record<MCPCategory, React.ReactNode> = {
  filesystem: <FolderOpen className="size-5" />,
  search: <Search className="size-5" />,
  developer: <GitBranch className="size-5" />,
  communication: <MessageSquare className="size-5" />,
  data: <Database className="size-5" />,
  productivity: <Zap className="size-5" />,
};

export default function MCPPluginsPage() {
  const categories = Object.keys(CATEGORY_LABELS) as MCPCategory[];

  return (
    <div className="py-20">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
            MCP Plugins for Non-Engineers
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            MCP (Model Context Protocol) lets your AI coding tools connect to
            external services — databases, GitHub, Slack, and more. These are the
            plugins we recommend for PMs, BAs, and non-engineers building with AI.
          </p>
        </div>

        {/* What is MCP? */}
        <div className="mb-12 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold">
            What is MCP?
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Think of MCP as USB ports for your AI tool. Just like USB lets you plug
            a keyboard, mouse, or external drive into your computer, MCP lets you
            plug external services into Claude Code or Cursor. Once connected, your
            AI can read your Slack messages, query your database, or manage your
            GitHub repos — all from a single conversation.
          </p>
          <p className="text-sm text-muted-foreground">
            Installing a plugin is one command. No coding required.
          </p>
        </div>

        {/* Filter + Cards */}
        <MCPFilterClient
          plugins={MCP_PLUGINS}
          categories={categories}
          categoryLabels={CATEGORY_LABELS}
          categoryIcons={CATEGORY_ICON_MAP}
        />

        {/* Governance Disclaimer */}
        <div className="mt-12 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <Shield className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <div>
            <p className="mb-1 text-sm font-medium text-amber-500">
              A note on third-party plugins
            </p>
            <p className="text-sm text-muted-foreground">
              These plugins connect AI tools to external services. Review what data
              each plugin accesses before installing. Zero to Ship does not audit the
              security or data practices of third-party MCP servers. Plugins marked
              &ldquo;Verified by ZTS&rdquo; have been tested by us but are still
              maintained by their respective authors.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="mb-2 text-xl font-bold">
            Learn to build with these tools
          </h2>
          <p className="mb-6 text-muted-foreground">
            Zero to Ship teaches non-engineers to build real products with AI coding
            tools. 16 modules, hands-on projects, and a certificate.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button render={<Link href="/pricing" />} size="lg">
              See Pricing
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button
              render={<Link href="/guides/claude-code-101" />}
              variant="outline"
              size="lg"
            >
              Read Claude Code 101
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
