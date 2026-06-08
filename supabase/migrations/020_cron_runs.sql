CREATE TABLE cron_runs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cron_name text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  duration_ms integer,
  items_processed integer DEFAULT 0,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX idx_cron_runs_name_started ON cron_runs(cron_name, started_at DESC);

ALTER TABLE cron_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage cron runs" ON cron_runs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read cron runs" ON cron_runs
  FOR SELECT USING (auth.role() = 'authenticated');
