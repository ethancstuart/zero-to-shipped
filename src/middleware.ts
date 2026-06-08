import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { authLimiter } from "@/lib/rate-limit";

const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .filter(Boolean);

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed =
    !origin ||
    origin === process.env.NEXT_PUBLIC_SITE_URL ||
    ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed
      ? origin || process.env.NEXT_PUBLIC_SITE_URL || "*"
      : "",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = crypto.randomUUID();

  // Propagate request ID via request headers so downstream route handlers
  // can read it via request.headers.get('x-request-id').
  request.headers.set("x-request-id", requestId);

  // Auth rate limiting for OAuth callback
  if (pathname.startsWith("/auth/callback")) {
    const identifier =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "anon";
    const result = await authLimiter.limit(identifier);
    if (!result.success) {
      const res = new NextResponse("Too many auth attempts", { status: 429 });
      res.headers.set("X-Request-Id", requestId);
      return res;
    }
  }

  // CORS for /api/v1/*
  if (pathname.startsWith("/api/v1/")) {
    const corsHeaders = getCorsHeaders(request.headers.get("origin"));
    if (request.method === "OPTIONS") {
      const preflight = new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
      preflight.headers.set("X-Request-Id", requestId);
      preflight.headers.set("X-API-Version", "1");
      return preflight;
    }
    const response = await updateSession(request);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response.headers.set("X-Request-Id", requestId);
    response.headers.set("X-API-Version", "1");
    return response;
  }

  const response = await updateSession(request);
  response.headers.set("X-Request-Id", requestId);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
