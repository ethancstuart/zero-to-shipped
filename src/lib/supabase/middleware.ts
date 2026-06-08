import { createServerClient } from "@supabase/ssr";
import * as Sentry from "@sentry/nextjs";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Skip if env vars aren't configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Public routes that don't require auth
    const publicRoutes = [
      "/",
      "/auth/callback",
      "/pricing",
      "/leaderboard",
      "/guides",
      "/resources",
      "/agents",
      "/privacy",
      "/terms",
      "/pulse",
      "/build",
      "/learn",
      "/system",
      "/tools",
      "/compare",
      "/showcase",
      "/waitlist",
      "/library",
      "/ask",
      "/about",
      "/transparency",
      "/learning-paths",
      "/which-tool",
    ];
    const isPublicRoute =
      publicRoutes.some((route) => request.nextUrl.pathname === route) ||
      request.nextUrl.pathname.startsWith("/u/") ||
      request.nextUrl.pathname.startsWith("/verify/") ||
      request.nextUrl.pathname.startsWith("/api/") ||
      request.nextUrl.pathname.startsWith("/guides/") ||
      request.nextUrl.pathname.startsWith("/resources/") ||
      request.nextUrl.pathname.startsWith("/learn/") ||
      request.nextUrl.pathname.startsWith("/pulse/") ||
      request.nextUrl.pathname.startsWith("/build/") ||
      request.nextUrl.pathname.startsWith("/system/") ||
      request.nextUrl.pathname.startsWith("/tools/") ||
      request.nextUrl.pathname.startsWith("/compare/") ||
      request.nextUrl.pathname.startsWith("/showcase/") ||
      request.nextUrl.pathname.startsWith("/which-tool/") ||
      request.nextUrl.pathname.startsWith("/for/") ||
      request.nextUrl.pathname.startsWith("/library/") ||
      request.nextUrl.pathname.startsWith("/learning-paths/");

    // Capture referral code from URL into a cookie
    const refCode = request.nextUrl.searchParams.get("ref");
    if (refCode && !request.cookies.get("zts_ref")) {
      supabaseResponse.cookies.set("zts_ref", refCode, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    }

    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  } catch (e) {
    // If Supabase fails, allow the request through
    Sentry.captureException(e);
  }

  return supabaseResponse;
}
