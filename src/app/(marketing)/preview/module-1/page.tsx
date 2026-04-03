import { redirect } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";
import { createClient } from "@/lib/supabase/server";
import { getModuleByNumber } from "@/lib/content/modules";
import { ContentGate } from "@/components/modules/content-gate";
import type { Metadata } from "next";

const MODULE_1 = getModuleByNumber(1)!;

export const metadata: Metadata = {
  title: `Free Preview: Module 1 — ${MODULE_1.title}`,
  description: MODULE_1.description,
};

/**
 * Split HTML content at the Nth <hr> tag boundary.
 * Returns [freeContent, gatedContent].
 */
function splitContentAtHr(html: string, splitAfterNthHr: number): [string, string] {
  let count = 0;
  let splitIndex = -1;
  const hrRegex = /<hr\s*\/?>/gi;
  let match: RegExpExecArray | null;

  while ((match = hrRegex.exec(html)) !== null) {
    count++;
    if (count === splitAfterNthHr) {
      splitIndex = match.index;
      break;
    }
  }

  if (splitIndex === -1) {
    return [html, ""];
  }

  return [html.slice(0, splitIndex), html.slice(splitIndex)];
}

async function getModuleContent(): Promise<string> {
  const jsonPath = join(
    process.cwd(),
    "src/content/modules",
    "01.json"
  );
  const raw = await readFile(jsonPath, "utf-8");
  const data = JSON.parse(raw);
  return data.contentHtml;
}

export default async function Module1PreviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authenticated users go straight to the real module
  if (user) {
    redirect(`/modules/${MODULE_1.slug}`);
  }

  const contentHtml = await getModuleContent();

  // Split after the 4th <hr> — shows intro, "What You'll Get Out of This",
  // Part 1 (Installing Everything), Part 2 (Your First Project),
  // and Part 3 (The Build Loop). Gates Part 4 onward.
  const [freeHtml, gatedHtml] = splitContentAtHr(contentHtml, 5);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="mb-1 text-sm font-medium uppercase tracking-wider text-primary">
          Free Preview
        </p>
        <h1 className="text-3xl font-bold">{MODULE_1.title}</h1>
        <p className="mt-2 text-muted-foreground">
          Read the full module content below — no sign-up required to start
          learning.
        </p>
      </div>

      {/* Free content — real module content, fully readable */}
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: freeHtml }} />
      </div>

      {/* Gate for remaining content */}
      {gatedHtml && (
        <ContentGate
          moduleTitle={MODULE_1.title}
          gatedHtml={gatedHtml}
        />
      )}
    </div>
  );
}
