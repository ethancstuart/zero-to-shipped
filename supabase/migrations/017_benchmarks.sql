CREATE TABLE benchmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  task text NOT NULL,
  input_prompt text NOT NULL,
  evaluation_criteria jsonb NOT NULL,
  tools_to_test text[],
  run_frequency text CHECK (run_frequency IN ('weekly','monthly','on_release')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE benchmark_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  benchmark_id uuid REFERENCES benchmarks(id) ON DELETE CASCADE NOT NULL,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  run_date timestamptz DEFAULT now(),
  output_text text,
  scores jsonb,
  tokens_used integer,
  cost_cents integer,
  duration_ms integer,
  evaluator_notes text
);

ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read benchmarks" ON benchmarks FOR SELECT USING (true);
CREATE POLICY "Public read results" ON benchmark_results FOR SELECT USING (true);
