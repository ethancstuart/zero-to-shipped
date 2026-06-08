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

  // Auth rate limiting for OAuth callback
  if (pathname.startsWith("/auth/callback")) {
    const identifier =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "anon";
    const result = await authLimiter.limit(identifier);
    if (!result.success) {
      return new NextResponse("Too many auth attempts", { status: 429 });
    }
  }

  // CORS for /api/v1/*
  if (pathname.startsWith("/api/v1/")) {
    const corsHeaders = getCorsHeaders(request.headers.get("origin"));
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: corsHeaders });
    }
    const response = await updateSession(request);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
