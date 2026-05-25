CREATE TABLE arena_challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  task_spec text NOT NULL,
  time_limit_minutes integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE arena_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id uuid REFERENCES arena_challenges(id) ON DELETE CASCADE NOT NULL,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  video_url text,
  duration_seconds integer,
  lines_of_code integer,
  prompt_count integer,
  iteration_count integer,
  result_score integer CHECK (result_score BETWEEN 1 AND 5),
  starter_repo_url text,
  final_repo_url text,
  builder_experience text CHECK (builder_experience IN ('beginner','intermediate','advanced')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE arena_votes (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES arena_challenges(id) ON DELETE CASCADE,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, challenge_id)
);

ALTER TABLE arena_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE arena_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE arena_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read arena" ON arena_challenges FOR SELECT USING (true);
CREATE POLICY "Public read entries" ON arena_entries FOR SELECT USING (true);
CREATE POLICY "Public read votes" ON arena_votes FOR SELECT USING (true);
CREATE POLICY "Auth insert votes" ON arena_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
