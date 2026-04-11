"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { createBrowserClient } from "@supabase/ssr";
import { AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const ADMIN_EMAIL = "ethan@zerotoship.app";

interface ServerTestResult {
  ok: boolean;
  dsnConfigured: boolean;
  environment: string;
  eventId: string | null;
  message: string;
}

export default function SentryTestPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [serverResult, setServerResult] = useState<ServerTestResult | null>(
    null
  );
  const [serverLoading, setServerLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [clientEventId, setClientEventId] = useState<string | null>(null);
  const [clientLoading, setClientLoading] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthorized(user?.email === ADMIN_EMAIL);
    });
  }, []);

  const runServerTest = async () => {
    setServerLoading(true);
    setServerError(null);
    setServerResult(null);
    try {
      const res = await fetch("/api/admin/sentry-test", { method: "GET" });
      if (!res.ok) {
        setServerError(`Server returned ${res.status}`);
      } else {
        const data: ServerTestResult = await res.json();
        setServerResult(data);
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setServerLoading(false);
    }
  };

  const runClientTest = async () => {
    setClientLoading(true);
    setClientEventId(null);
    try {
      const err = new Error(
        `ZTS Sentry verification test — client-side captureException at ${new Date().toISOString()}`
      );
      const id = Sentry.captureException(err, {
        tags: { source: "admin-sentry-test-client" },
        level: "info",
      });
      await Sentry.flush(3000);
      setClientEventId(id || "(no event id returned — DSN likely missing)");
    } finally {
      setClientLoading(false);
    }
  };

  if (authorized === null) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          This page is restricted to administrators.
        </p>
      </div>
    );
  }

  const dsnPresent = serverResult?.dsnConfigured ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sentry Verification</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trigger test exceptions to confirm Sentry is wired up and capturing
          events from both the server and the browser.
        </p>
      </div>

      {/* Status banner */}
      {dsnPresent === false && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold text-amber-500">
              NEXT_PUBLIC_SENTRY_DSN is not configured.
            </p>
            <p className="mt-1 text-muted-foreground">
              The Sentry SDK is installed but has no DSN. Events fire silently
              and nothing reaches your dashboard. Add the DSN to{" "}
              <code className="rounded bg-background px-1">.env.local</code>{" "}
              and to Vercel environment variables, then redeploy.
            </p>
          </div>
        </div>
      )}
      {dsnPresent === true && (
        <div className="flex items-start gap-3 rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-sm">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" />
          <div>
            <p className="font-semibold text-green-500">DSN is configured.</p>
            <p className="mt-1 text-muted-foreground">
              Environment:{" "}
              <code className="rounded bg-background px-1">
                {serverResult?.environment}
              </code>
              . If test events appear in your Sentry dashboard, verification
              passes.
            </p>
          </div>
        </div>
      )}

      {/* Server test */}
      <Card>
        <CardHeader>
          <CardTitle>1. Server-side capture</CardTitle>
          <CardDescription>
            Calls <code>/api/admin/sentry-test</code> which throws an Error and
            passes it to <code>Sentry.captureException</code> on the server,
            then flushes before returning.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runServerTest} disabled={serverLoading}>
            {serverLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Triggering…
              </>
            ) : (
              "Trigger server error"
            )}
          </Button>

          {serverError && (
            <div className="flex items-start gap-2 rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <XCircle className="mt-0.5 size-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {serverResult && (
            <div className="space-y-2 rounded border border-border bg-muted/40 p-3 text-sm">
              <div className="flex items-center gap-2">
                {serverResult.dsnConfigured ? (
                  <CheckCircle2 className="size-4 text-green-500" />
                ) : (
                  <XCircle className="size-4 text-destructive" />
                )}
                <span className="font-medium">{serverResult.message}</span>
              </div>
              {serverResult.eventId && (
                <div className="text-xs text-muted-foreground">
                  Event ID:{" "}
                  <code className="rounded bg-background px-1">
                    {serverResult.eventId}
                  </code>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client test */}
      <Card>
        <CardHeader>
          <CardTitle>2. Client-side capture</CardTitle>
          <CardDescription>
            Runs <code>Sentry.captureException</code> directly in the browser
            and flushes. Tests the client SDK (
            <code>sentry.client.config.ts</code>).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runClientTest} disabled={clientLoading}>
            {clientLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Triggering…
              </>
            ) : (
              "Trigger client error"
            )}
          </Button>

          {clientEventId && (
            <div className="space-y-2 rounded border border-border bg-muted/40 p-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500" />
                <span className="font-medium">
                  Client event captured (or dropped if DSN missing).
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Event ID:{" "}
                <code className="rounded bg-background px-1">
                  {clientEventId}
                </code>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Next steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Trigger both tests above. Each should return an event ID and a
              success message.
            </li>
            <li>
              Open your Sentry project dashboard → Issues. You should see one
              &ldquo;ZTS Sentry verification test&rdquo; event per trigger,
              tagged with <code>source</code>.
            </li>
            <li>
              Mark those two test events as <em>Resolved</em> so they&apos;re
              out of your live issue list before launch.
            </li>
            <li>
              If no events arrive: check that{" "}
              <code>NEXT_PUBLIC_SENTRY_DSN</code> is set in both{" "}
              <code>.env.local</code> (for dev) and Vercel env (for prod), then
              redeploy.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
