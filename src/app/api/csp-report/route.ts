import { log } from "@/lib/logger";
import { apiLimiter } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit to prevent abuse
  const identifier =
    request.headers.get("x-forwarded-for")?.split(",")[0] || "anon";
  const result = await apiLimiter.limit(`csp-report:${identifier}`);
  if (!result.success) {
    return new Response(null, { status: 429 });
  }

  try {
    const report = await request.json();
    log("warn", "CSP violation reported", {
      route: "/api/csp-report",
      violation: report["csp-report"] || report,
    });
  } catch {
    // Invalid JSON — ignore
  }

  return new Response(null, { status: 204 });
}
