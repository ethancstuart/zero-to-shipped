CREATE TABLE user_ai_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  query_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, usage_date)
);

ALTER TABLE user_ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage" ON user_ai_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON user_ai_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON user_ai_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all" ON user_ai_usage
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX idx_user_ai_usage_lookup ON user_ai_usage(user_id, usage_date);
