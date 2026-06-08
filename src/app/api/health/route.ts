import { checkSupabase, checkContent, checkEnvVars } from "@/lib/health";
import {
  supabaseBreaker,
  claudeBreaker,
  geminiBreaker,
} from "@/lib/circuit-breaker";

export const dynamic = "force-dynamic";

export async function GET() {
  const [supabase, content] = await Promise.all([
    checkSupabase(),
    checkContent(),
  ]);
  const env = checkEnvVars();

  const checks = { supabase, content, env };
  const circuits = {
    supabase: supabaseBreaker.getState(),
    claude: claudeBreaker.getState(),
    gemini: geminiBreaker.getState(),
  };

  let status: "healthy" | "degraded" | "unhealthy";
  if (supabase.status === "down" || env.status === "down") {
    status = "unhealthy";
  } else if (
    content.status === "down" ||
    Object.values(circuits).some((s) => s !== "closed")
  ) {
    status = "degraded";
  } else {
    status = "healthy";
  }

  return Response.json(
    {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      checks,
      circuits,
    },
    {
      status: status === "unhealthy" ? 503 : 200,
    },
  );
}
