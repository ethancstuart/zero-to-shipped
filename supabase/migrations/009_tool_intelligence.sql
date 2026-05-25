-- Tool registry
CREATE TABLE tools (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  website text,
  github_repo text,
  changelog_url text,
  category text CHECK (category IN ('ide','cli','platform','framework')),
  current_version text,
  last_release_date timestamptz,
  description text,
  scraper_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Release tracking
CREATE TABLE tool_releases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  version text NOT NULL,
  release_date timestamptz NOT NULL,
  summary text,
  significance text CHECK (significance IN ('major','minor','patch')),
  raw_changelog text,
  source_url text,
  capabilities text[],
  response_hash text,
  brief_status text DEFAULT 'pending' CHECK (brief_status IN ('pending','draft','published','skipped')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tool_id, version)
);

-- Capability comparison matrix
CREATE TABLE ecosystem_status (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  capability text NOT NULL,
  category text NOT NULL,
  supported boolean DEFAULT false,
  maturity text CHECK (maturity IN ('experimental','beta','stable','mature')),
  quality_score integer CHECK (quality_score BETWEEN 1 AND 5),
  notes text,
  last_verified timestamptz DEFAULT now(),
  verified_by text DEFAULT 'manual' CHECK (verified_by IN ('automated','manual')),
  UNIQUE(tool_id, capability)
);

-- Capability change history
CREATE TABLE ecosystem_status_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ecosystem_status_id uuid REFERENCES ecosystem_status(id) ON DELETE CASCADE NOT NULL,
  old_supported boolean,
  old_quality_score integer,
  new_supported boolean,
  new_quality_score integer,
  changed_at timestamptz DEFAULT now()
);

-- Content index (cache of MDX frontmatter for dynamic queries)
CREATE TABLE content_index (
  slug text PRIMARY KEY,
  pillar text NOT NULL,
  content_type text NOT NULL,
  title text NOT NULL,
  tools text[],
  tool_versions jsonb,
  status text NOT NULL,
  freshness text DEFAULT 'current' CHECK (freshness IN ('current','needs_refresh','outdated')),
  freshness_checked_at timestamptz,
  freshness_reason text,
  is_premium boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  published_at timestamptz,
  indexed_at timestamptz DEFAULT now()
);

-- Content analytics (aggregated engagement metrics)
CREATE TABLE content_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_slug text NOT NULL,
  views integer DEFAULT 0,
  sandbox_launches integer DEFAULT 0,
  completions integer DEFAULT 0,
  fork_count integer DEFAULT 0,
  avg_time_seconds integer,
  period_start date NOT NULL,
  period_end date NOT NULL,
  UNIQUE(content_slug, period_start)
);

ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read analytics" ON content_analytics FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_content_analytics_slug ON content_analytics(content_slug, period_start DESC);
CREATE INDEX idx_tool_releases_tool_date ON tool_releases(tool_id, release_date DESC);
CREATE INDEX idx_ecosystem_status_tool ON ecosystem_status(tool_id);
CREATE INDEX idx_ecosystem_status_capability ON ecosystem_status(capability);
CREATE INDEX idx_content_index_pillar ON content_index(pillar, status, published_at DESC);
CREATE INDEX idx_content_index_freshness ON content_index(freshness) WHERE freshness != 'current';

-- RLS
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_index ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read tools" ON tools FOR SELECT USING (true);
CREATE POLICY "Public read releases" ON tool_releases FOR SELECT USING (true);
CREATE POLICY "Public read ecosystem" ON ecosystem_status FOR SELECT USING (true);
CREATE POLICY "Public read history" ON ecosystem_status_history FOR SELECT USING (true);
CREATE POLICY "Public read content_index" ON content_index FOR SELECT USING (true);
