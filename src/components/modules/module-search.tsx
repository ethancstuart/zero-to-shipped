"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Lock, CheckCircle2, PlayCircle, Circle, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MODULE_METADATA } from "@/lib/content/modules";
import { TIER_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ModuleStatus, ModuleTier, RoleTrack } from "@/types";

const STATUS_ICONS = {
  locked: Lock,
  available: Circle,
  in_progress: PlayCircle,
  completed: CheckCircle2,
};

const STATUS_COLORS = {
  locked: "text-muted-foreground/40",
  available: "text-muted-foreground",
  in_progress: "text-primary",
  completed: "text-green-500",
};

interface ModuleSearchProps {
  progressMap: Record<number, ModuleStatus>;
  roleTrack: RoleTrack | null;
}

export function ModuleSearch({ progressMap, roleTrack }: ModuleSearchProps) {
  const [query, setQuery] = useState("");

  const tiers: ModuleTier[] = ["foundations", "intermediate", "advanced", "capstone"];

  const filteredModules = useMemo(() => {
    if (!query.trim()) return null; // null means show all (unfiltered)
    const q = query.toLowerCase().trim();
    return MODULE_METADATA.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tier.toLowerCase().includes(q)
    );
  }, [query]);

  const isFiltering = query.trim().length > 0;

  function renderModule(mod: (typeof MODULE_METADATA)[number]) {
    const status: ModuleStatus = progressMap[mod.number] ?? "locked";
    const isLocked = status === "locked";
    const StatusIcon = STATUS_ICONS[status];
    const relevance = roleTrack ? mod.roleRelevance[roleTrack] : null;

    const content = (
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors",
          isLocked
            ? "opacity-50"
            : "hover:border-primary/30 hover:bg-card/80"
        )}
      >
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            status === "completed"
              ? "bg-green-500/10"
              : status === "in_progress"
              ? "bg-primary/10"
              : "bg-muted"
          )}
        >
          <span
            className={cn(
              "text-sm font-bold",
              status === "completed"
                ? "text-green-500"
                : status === "in_progress"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {mod.number}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{mod.title}</h3>
            {relevance && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  relevance === "core"
                    ? "bg-primary/10 text-primary"
                    : relevance === "recommended"
                    ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {relevance}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{mod.description}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{mod.estimatedHours} hours</span>
            <span>{mod.checkpoints.length} checkpoints</span>
          </div>
        </div>
        <StatusIcon
          className={cn("size-5 shrink-0", STATUS_COLORS[status])}
        />
      </div>
    );

    if (isLocked) return <div key={mod.number}>{content}</div>;
    return (
      <Link key={mod.number} href={`/modules/${mod.slug}`}>
        {content}
      </Link>
    );
  }

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search modules by title, description, or tier..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 pl-9 pr-9"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {isFiltering ? (
        filteredModules && filteredModules.length > 0 ? (
          <div className="space-y-3">
            {filteredModules.map(renderModule)}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-muted-foreground">
              No modules match &ldquo;{query}&rdquo;
            </p>
            <button
              onClick={() => setQuery("")}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        )
      ) : (
        tiers.map((tier) => {
          const modules = MODULE_METADATA.filter((m) => m.tier === tier);
          return (
            <div key={tier}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
                {TIER_LABELS[tier]}
              </h2>
              <div className="space-y-3">
                {modules.map(renderModule)}
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
