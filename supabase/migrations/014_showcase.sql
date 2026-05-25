CREATE TABLE showcase_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  url text,
  description text NOT NULL,
  screenshot_url text,
  github_url text,
  build_time_minutes integer,
  builder_experience text CHECK (builder_experience IN ('beginner','intermediate','advanced')),
  status text DEFAULT 'pending' CHECK (status IN ('pending','published','rejected')),
  upvotes integer DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE showcase_project_tools (
  project_id uuid REFERENCES showcase_projects(id) ON DELETE CASCADE,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tool_id)
);

ALTER TABLE showcase_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_project_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published" ON showcase_projects
  FOR SELECT USING (status = 'published');
CREATE POLICY "Auth insert" ON showcase_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own read" ON showcase_projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public read project tools" ON showcase_project_tools FOR SELECT USING (true);
