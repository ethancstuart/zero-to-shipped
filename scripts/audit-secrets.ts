import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const PATTERNS = [
  { name: "Stripe secret key", regex: /sk_(test|live)_[a-zA-Z0-9]{20,}/g },
  { name: "Stripe webhook secret", regex: /whsec_[a-zA-Z0-9]{20,}/g },
  { name: "Supabase service role", regex: /service_role/g },
  {
    name: "Anthropic API key",
    regex: /sk-ant-api[0-9]{2}-[a-zA-Z0-9_-]{80,}/g,
  },
  { name: "Resend API key", regex: /re_[a-zA-Z0-9_-]{20,}/g },
  { name: "OpenAI key", regex: /sk-(proj-)?[a-zA-Z0-9]{40,}/g },
  {
    name: "Generic Bearer token",
    regex:
      /\bey[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g,
  },
];

const buildDir = join(process.cwd(), ".next/static");

function* walk(dir: string): Generator<string> {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.endsWith(".js") || entry.endsWith(".mjs")) {
      yield fullPath;
    }
  }
}

let found = 0;
for (const file of walk(buildDir)) {
  const content = readFileSync(file, "utf-8");
  for (const { name, regex } of PATTERNS) {
    const matches = content.match(regex);
    if (matches) {
      found += matches.length;
      console.error(
        `❌ Found ${matches.length} match(es) for "${name}" in ${file}`,
      );
    }
  }
}

if (found > 0) {
  console.error(
    `\nSecret audit FAILED: ${found} potential secret(s) found in client bundle`,
  );
  process.exit(1);
}

console.log("✅ Secret audit passed — no secrets found in client bundle");
