import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Validate environment variables at startup
  await import("@/lib/env");

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
