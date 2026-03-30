import { readFile } from "fs/promises";
import { join } from "path";
import { parseMarkdownToHtml } from "@/lib/content/parser";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ModuleContentProps {
  moduleNumber: number;
}

export async function ModuleContent({ moduleNumber }: ModuleContentProps) {
  // Try to load from parsed JSON first, fall back to raw markdown
  const jsonPath = join(
    process.cwd(),
    "src/content/modules",
    `${String(moduleNumber).padStart(2, "0")}.json`
  );

  try {
    const raw = await readFile(jsonPath, "utf-8");
    const data = JSON.parse(raw);
    return <div dangerouslySetInnerHTML={{ __html: data.contentHtml }} />;
  } catch {
    // Fallback: try loading from content-source
    try {
      const { MODULE_METADATA } = await import("@/lib/content/modules");
      const mod = MODULE_METADATA.find((m) => m.number === moduleNumber);
      if (!mod) {
        return (
          <div className="not-prose rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <AlertCircle className="mx-auto mb-3 size-8 text-destructive/60" />
            <h3 className="mb-1 font-semibold">Module not found</h3>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t find content for this module. Try refreshing the page.
            </p>
          </div>
        );
      }

      const mdPath = join(
        process.cwd(),
        "content-source",
        `${String(moduleNumber).padStart(2, "0")}-${mod.slug}.md`
      );
      const markdown = await readFile(mdPath, "utf-8");
      const html = await parseMarkdownToHtml(markdown);
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      return (
        <div className="not-prose rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 size-8 text-destructive/60" />
          <h3 className="mb-1 font-semibold">Something went wrong</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            We couldn&apos;t load this module&apos;s content. Try refreshing the page.
          </p>
          <a
            href=""
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <RefreshCw className="size-4" />
            Refresh Page
          </a>
        </div>
      );
    }
  }
}
