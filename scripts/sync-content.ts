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

const CONTENT_SOURCE = join(process.cwd(), "content-source");
const OUTPUT_DIR = join(process.cwd(), "src/content/modules");

// Module file pattern: 01-setup-and-first-build.md
const MODULE_PATTERN = /^(\d{2})-(.+)\.md$/;

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

function wrapCursorContent(html: string): string {
  // Wrap Cursor-specific callouts with data-tool="cursor"
  // Look for content mentioning "Cursor" in tips, notes, or blockquotes
  return html.replace(
    /(<blockquote>[\s\S]*?(?:In Cursor|Cursor tip|Cursor-specific|Using Cursor)[\s\S]*?<\/blockquote>)/gi,
    '<div data-tool="cursor">$1</div>'
  );
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
    let html = await parseMarkdownToHtml(markdown);
    html = wrapCursorContent(html);

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
