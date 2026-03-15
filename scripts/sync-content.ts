/**
 * Content Sync Script
 *
 * Parses markdown files from content-source/ (git submodule)
 * and outputs parsed JSON to src/content/modules/
 *
 * Usage: npx tsx scripts/sync-content.ts
 */

import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { createHighlighter } from "shiki";
import type { Highlighter } from "shiki";

const CONTENT_SOURCE = join(process.cwd(), "content-source");
const OUTPUT_DIR = join(process.cwd(), "src/content/modules");

// Module file pattern: 01-setup-and-first-build.md
const MODULE_PATTERN = /^(\d{2})-(.+)\.md$/;

let highlighterInstance: Highlighter | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [
        "javascript",
        "typescript",
        "python",
        "bash",
        "json",
        "html",
        "css",
        "sql",
        "markdown",
        "yaml",
      ],
    });
  }
  return highlighterInstance;
}

async function parseMarkdownToHtml(markdown: string): Promise<string> {
  const { unified } = await import("unified");
  const remarkParse = (await import("remark-parse")).default;
  const remarkGfm = (await import("remark-gfm")).default;
  const remarkRehype = (await import("remark-rehype")).default;
  const rehypeRaw = (await import("rehype-raw")).default;
  const rehypeStringify = (await import("rehype-stringify")).default;

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(markdown);

  return String(result);
}

function highlightCodeBlocks(html: string, highlighter: Highlighter): string {
  const codeBlockRegex =
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;
  return html.replace(codeBlockRegex, (_, lang, code) => {
    const decoded = code
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"');
    try {
      return highlighter.codeToHtml(decoded, {
        lang,
        themes: { dark: "github-dark", light: "github-light" },
      });
    } catch {
      return `<pre><code>${code}</code></pre>`;
    }
  });
}

function wrapToolContent(html: string): string {
  // Wrap blockquotes that start with "In Cursor" / "In Claude Code"
  // Uses tempered greedy token to prevent crossing blockquote boundaries
  html = html.replace(
    /<blockquote>\s*<p>\s*<strong>In Cursor(?::?)<\/strong>((?:(?!<blockquote>)[\s\S])*?)<\/blockquote>/gi,
    '<div data-tool="cursor"><blockquote><p><strong>In Cursor:</strong>$1</blockquote></div>'
  );
  html = html.replace(
    /<blockquote>\s*<p>\s*<strong>In Claude Code(?::?)<\/strong>((?:(?!<blockquote>)[\s\S])*?)<\/blockquote>/gi,
    '<div data-tool="claude-code"><blockquote><p><strong>In Claude Code:</strong>$1</blockquote></div>'
  );
  return html;
}

async function main() {
  console.log("Syncing content from", CONTENT_SOURCE);

  await mkdir(OUTPUT_DIR, { recursive: true });

  let files: string[];
  try {
    files = await readdir(CONTENT_SOURCE);
  } catch {
    console.error(
      "Content source directory not found. Set up the git submodule:\n" +
        "  git submodule add <repo> content-source"
    );
    process.exit(1);
  }

  const moduleFiles = files
    .filter((f) => MODULE_PATTERN.test(f))
    .sort();

  console.log(`Found ${moduleFiles.length} module files`);

  for (const file of moduleFiles) {
    const match = file.match(MODULE_PATTERN);
    if (!match) continue;

    const [, numStr, slug] = match;
    const moduleNumber = parseInt(numStr, 10);

    console.log(`  Processing module ${moduleNumber}: ${slug}`);

    const markdown = await readFile(join(CONTENT_SOURCE, file), "utf-8");

    // Extract title from first heading
    const titleMatch = markdown.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1] : slug;

    // Extract metadata from frontmatter-style comments
    const tierMatch = markdown.match(/Tier\s+(\d)/i);
    const hoursMatch = markdown.match(/(\d+[-–]\d+)\s*hours/i);

    // Parse to HTML
    const highlighter = await getHighlighter();
    let html = await parseMarkdownToHtml(markdown);
    html = highlightCodeBlocks(html, highlighter);
    html = wrapToolContent(html);

    const output = {
      number: moduleNumber,
      slug,
      title,
      tier: tierMatch ? parseInt(tierMatch[1]) : null,
      estimatedHours: hoursMatch ? hoursMatch[1] : null,
      contentHtml: html,
      processedAt: new Date().toISOString(),
    };

    await writeFile(
      join(OUTPUT_DIR, `${numStr}.json`),
      JSON.stringify(output, null, 2)
    );
  }

  console.log(`\nDone! Processed ${moduleFiles.length} modules to ${OUTPUT_DIR}`);
}

main().catch(console.error);
