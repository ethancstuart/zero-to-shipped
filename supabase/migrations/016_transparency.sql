CREATE TABLE platform_costs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  month date NOT NULL,
  category text NOT NULL CHECK (category IN ('hosting','api_claude','api_gemini','database','redis','domain','other')),
  amount_cents integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE platform_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read costs" ON platform_costs FOR SELECT USING (true);
