CREATE TABLE user_context (
  user_id uuid REFERENCES profiles(id) PRIMARY KEY,
  experience_level text CHECK (experience_level IN ('beginner','intermediate','advanced')),
  primary_tools text[],
  content_consumed text[],
  topics_of_interest text[],
  last_active timestamptz DEFAULT now(),
  model_version integer DEFAULT 1
);

CREATE TABLE bookmarks (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content_slug text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, content_slug)
);

ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own read/write context" ON user_context
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own read/write bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);
