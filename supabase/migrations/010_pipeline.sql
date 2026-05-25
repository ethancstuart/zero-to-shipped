CREATE TABLE pipeline_runs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_type text NOT NULL CHECK (trigger_type IN ('release_detected','manual','scheduled')),
  trigger_data jsonb,
  status text DEFAULT 'running' CHECK (status IN ('running','completed','failed','needs_review')),
  total_tokens integer DEFAULT 0,
  total_cost_cents integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE pipeline_steps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid REFERENCES pipeline_runs(id) ON DELETE CASCADE NOT NULL,
  step_order integer NOT NULL,
  agent_role text NOT NULL CHECK (agent_role IN ('watcher','analyst','writer','fact_checker','publisher')),
  status text DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed','skipped')),
  input_summary text,
  output_summary text,
  full_transcript jsonb,
  tokens_used integer DEFAULT 0,
  cost_cents integer DEFAULT 0,
  duration_ms integer,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz
);

CREATE INDEX idx_pipeline_runs_status ON pipeline_runs(status, started_at DESC);
CREATE INDEX idx_pipeline_steps_run ON pipeline_steps(run_id, step_order);

ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read pipeline_runs" ON pipeline_runs FOR SELECT USING (true);
CREATE POLICY "Public read pipeline_steps" ON pipeline_steps FOR SELECT USING (true);
