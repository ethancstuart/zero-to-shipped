import { readFile } from "fs/promises";
import { join } from "path";
import { parseMarkdownToHtml } from "@/lib/content/parser";

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
      if (!mod) return <p>Module content not found.</p>;

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
        <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
          <p className="text-muted-foreground">
            Module content is being prepared. Run{" "}
            <code className="rounded bg-muted px-1 font-mono text-sm">
              npm run sync-content
            </code>{" "}
            to generate module content.
          </p>
        </div>
      );
    }
  }
}
