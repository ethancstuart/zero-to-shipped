import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "ethan@zerotoship.app";

/**
 * Admin-only endpoint that deliberately throws so we can verify Sentry is
 * actually capturing server-side errors. Paired with /admin/sentry-test UI.
 *
 * GET  — throws via Sentry.captureException (caught, returns 200 with id)
 * POST — throws uncaught, triggering Next.js error boundary + Sentry auto-capture
 */

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return false;
  }
  return true;
}

export async function GET() {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dsnConfigured = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
  const environment =
    process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown";

  const err = new Error(
    `ZTS Sentry verification test — server-side captureException at ${new Date().toISOString()}`
  );
  const eventId = Sentry.captureException(err, {
    tags: { source: "admin-sentry-test-get" },
    level: "info",
  });

  // Force-flush so the event reaches Sentry before the response returns
  await Sentry.flush(3000);

  return NextResponse.json({
    ok: true,
    dsnConfigured,
    environment,
    eventId,
    message: dsnConfigured
      ? "Test exception sent to Sentry. Check your Sentry dashboard for the event ID above."
      : "NEXT_PUBLIC_SENTRY_DSN is NOT set. The test ran but nothing was sent — the SDK silently drops events without a DSN.",
  });
}

export async function POST() {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Uncaught throw — Sentry's Next.js integration auto-captures this
  throw new Error(
    `ZTS Sentry verification test — uncaught server error at ${new Date().toISOString()}`
  );
}
