import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  environment: process.env.VERCEL_ENV || "development",
  beforeSend(event) {
    // Don't send rate limit errors as incidents
    if (event.exception?.values?.[0]?.value?.includes("rate limit")) return null;
    return event;
  },
});
