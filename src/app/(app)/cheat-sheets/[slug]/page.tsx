import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { readFile } from "fs/promises";
import { join } from "path";
import { ArrowLeft } from "lucide-react";
import { parseMarkdownToHtml } from "@/lib/content/parser";
import { ToolToggle } from "@/components/modules/tool-toggle";
import type { Profile } from "@/types";

const CHEAT_SHEETS: Record<string, string> = {
  "terminal-basics": "Terminal Basics",
  "git-commands": "Git Commands",
  "prompt-patterns": "Prompt Patterns",
  "cursor-shortcuts": "Cursor Shortcuts",
  "design-principles": "Design Principles",
  "security-checklist": "Security Checklist",
  "starter-prompts": "Starter Prompts",
  "recommended-tools": "Recommended Tools",
  troubleshooting: "Troubleshooting",
  "claude-code-skills": "Claude Code Skills",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const title = CHEAT_SHEETS[slug];
  if (!title) return { title: "Cheat Sheet Not Found" };
  return { title: `${title} — Cheat Sheet` };
}

export default async function CheatSheetPage({ params }: Props) {
  const { slug } = await params;

  if (!CHEAT_SHEETS[slug]) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tool_preference")
    .eq("id", user.id)
    .single();

  const toolPreference = (profile as Pick<Profile, "tool_preference">)
    .tool_preference;

  // Load markdown from content-source
  const mdPath = join(process.cwd(), "content-source", `${slug}.md`);
  let html: string;
  try {
    const markdown = await readFile(mdPath, "utf-8");
    html = await parseMarkdownToHtml(markdown);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link
          href="/cheat-sheets"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All Cheat Sheets
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">{CHEAT_SHEETS[slug]}</h1>
          <ToolToggle current={toolPreference} />
        </div>
      </div>

      <div
        data-tool-active={toolPreference}
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
