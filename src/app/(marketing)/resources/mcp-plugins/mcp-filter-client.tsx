"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MCPPlugin, MCPCategory } from "@/data/mcp-plugins";

interface MCPFilterClientProps {
  plugins: MCPPlugin[];
  categories: MCPCategory[];
  categoryLabels: Record<MCPCategory, string>;
  categoryIcons: Record<MCPCategory, React.ReactNode>;
}

export function MCPFilterClient({
  plugins,
  categories,
  categoryLabels,
  categoryIcons,
}: MCPFilterClientProps) {
  const [activeCategory, setActiveCategory] = useState<MCPCategory | "all">(
    "all"
  );
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const filtered =
    activeCategory === "all"
      ? plugins
      : plugins.filter((p) => p.category === activeCategory);

  const handleCopy = async (slug: string, command: string) => {
    await navigator.clipboard.writeText(command);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <>
      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All ({plugins.length})
        </button>
        {categories.map((cat) => {
          const count = plugins.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {categoryLabels[cat]} ({count})
            </button>
          );
        })}
      </div>

      {/* Plugin Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((plugin) => (
          <div
            key={plugin.slug}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-primary">
                  {categoryIcons[plugin.category]}
                </span>
                <h3 className="font-semibold">{plugin.name}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                {plugin.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-500">
                    <CheckCircle2 className="size-3" />
                    Verified by ZTS
                  </span>
                )}
              </div>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
              {plugin.description}
            </p>
            <p className="mb-3 text-xs text-muted-foreground/70">
              <strong>Use case:</strong> {plugin.useCase}
            </p>

            {/* Install command */}
            <div className="mb-3 flex items-center gap-2">
              <code className="flex-1 truncate rounded-md bg-muted px-3 py-1.5 font-mono text-xs">
                {plugin.installCommand}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 shrink-0 p-0"
                onClick={() =>
                  handleCopy(plugin.slug, plugin.installCommand)
                }
              >
                {copiedSlug === plugin.slug ? (
                  <Check className="size-3.5 text-green-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <a
                href={plugin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View on GitHub <ExternalLink className="size-3" />
              </a>
              <span className="text-[10px] text-muted-foreground/50">
                Verified {plugin.lastVerified}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
