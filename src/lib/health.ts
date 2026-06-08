import { createClient } from "@/lib/supabase/server";
import { listContentByPillar } from "@/lib/content/loader";

type CheckResult = {
  status: "up" | "down";
  latency_ms?: number;
  error?: string;
  count?: number;
  missing?: string[];
};

interface CachedResult {
  result: CheckResult;
  expiresAt: number;
}

const cache = new Map<string, CachedResult>();
const CACHE_TTL_MS = 60_000;

async function withCache(
  key: string,
  fn: () => Promise<CheckResult>,
): Promise<CheckResult> {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.result;
  const result = await fn();
  cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result;
}

export async function checkSupabase(): Promise<CheckResult> {
  return withCache("supabase", async () => {
    const start = Date.now();
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("tools").select("id").limit(1);
      if (error) throw error;
      return { status: "up", latency_ms: Date.now() - start };
    } catch (error) {
      return {
        status: "down",
        latency_ms: Date.now() - start,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });
}

export async function checkContent(): Promise<CheckResult> {
  return withCache("content", async () => {
    try {
      const items = await listContentByPillar("learn");
      if (items.length === 0) return { status: "down", error: "No content found" };
      return { status: "up", count: items.length };
    } catch (error) {
      return {
        status: "down",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });
}

export function checkEnvVars(): CheckResult {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ANTHROPIC_API_KEY",
    "GEMINI_API_KEY",
    "CRON_SECRET",
  ];
  const missing = required.filter((key) => !process.env[key]);
  return missing.length === 0 ? { status: "up" } : { status: "down", missing };
}
