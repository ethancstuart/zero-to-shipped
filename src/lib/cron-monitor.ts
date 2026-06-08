import { createClient } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";
import { log } from "@/lib/logger";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

interface CronResult {
  itemsProcessed?: number;
  metadata?: Record<string, unknown>;
}

export async function withCronMonitoring(
  name: string,
  fn: () => Promise<CronResult | void>,
): Promise<void> {
  const supabase = getServiceClient();
  const startTime = Date.now();

  // Insert run record
  const { data: run } = await supabase
    .from("cron_runs")
    .insert({ cron_name: name, status: "running" })
    .select()
    .single();

  log("info", "Cron started", { cron: name, runId: run?.id });

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    await supabase
      .from("cron_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        items_processed: result?.itemsProcessed ?? 0,
        metadata: result?.metadata ?? {},
      })
      .eq("id", run?.id);

    log("info", "Cron completed", {
      cron: name,
      duration_ms: duration,
      items: result?.itemsProcessed,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    await supabase
      .from("cron_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        error_message: errorMessage,
      })
      .eq("id", run?.id);

    Sentry.captureException(error, { tags: { cron: name } });
    log("error", "Cron failed", {
      cron: name,
      duration_ms: duration,
      error: errorMessage,
    });
    throw error;
  }
}
