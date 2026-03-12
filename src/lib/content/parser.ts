import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { createHighlighter } from "shiki";
import type { Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
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
  return highlighterPromise;
}

export async function parseMarkdownToHtml(markdown: string): Promise<string> {
  const highlighter = await getHighlighter();

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(markdown);

  let html = String(result);

  // Replace code blocks with shiki-highlighted versions
  const codeBlockRegex =
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;
  html = html.replace(codeBlockRegex, (_, lang, code) => {
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

  return html;
}

export function extractCheckpointsFromMarkdown(markdown: string): string[] {
  const checkpoints: string[] = [];
  const lines = markdown.split("\n");
  let inCheckpointSection = false;

  for (const line of lines) {
    if (
      line.match(/^#{1,3}\s.*checkpoint/i) ||
      line.match(/^#{1,3}\s.*hands[- ]on/i) ||
      line.match(/^#{1,3}\s.*exercise/i) ||
      line.match(/^#{1,3}\s.*practice/i)
    ) {
      inCheckpointSection = true;
      continue;
    }
    if (inCheckpointSection && line.match(/^#{1,3}\s/)) {
      inCheckpointSection = false;
    }
    if (inCheckpointSection) {
      const match = line.match(/^[-*]\s+\[[ x]?\]\s+(.+)/);
      if (match) {
        checkpoints.push(match[1].trim());
      }
    }
  }

  return checkpoints;
}
