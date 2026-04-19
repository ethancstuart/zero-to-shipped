"use client";

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { PROMPTS, CATEGORY_LABELS } from "@/lib/library/prompts";
import type { PromptCategory } from "@/lib/library/prompts";
import { PromptCard } from "./PromptCard";
import { LibraryEmailGate } from "./LibraryEmailGate";

const STORAGE_KEY = "zts_prompts_unlocked";
const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as PromptCategory[];

export function PromptLibraryClient() {
  const [activeCategory, setActiveCategory] = useState<PromptCategory>("build");
  const [search, setSearch] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      setUnlocked(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      // SSR safety
    }
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PROMPTS.filter(
      (p) =>
        p.category === activeCategory &&
        (!q ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.prompt.toLowerCase().includes(q))
    );
  }, [activeCategory, search]);

  const freePrompts = filtered.filter((p) => p.free);
  const gatedPrompts = filtered.filter((p) => !p.free);
  const showGate = !unlocked && gatedPrompts.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search prompts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Prompts */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No prompts match your search.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Free prompts always visible */}
          {freePrompts.map((p) => (
            <PromptCard key={p.id} prompt={p} />
          ))}

          {/* Gated section */}
          {showGate ? (
            <LibraryEmailGate
              storageKey={STORAGE_KEY}
              heading={`${gatedPrompts.length} more prompts in this category`}
              description="Enter your email to unlock the full library — 40+ prompts across 6 categories."
            >
              {gatedPrompts.map((p) => (
                <PromptCard key={p.id} prompt={p} />
              ))}
            </LibraryEmailGate>
          ) : (
            gatedPrompts.map((p) => (
              <PromptCard key={p.id} prompt={p} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
