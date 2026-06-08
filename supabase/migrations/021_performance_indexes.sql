-- Performance indexes for common query patterns
-- All indexes use IF NOT EXISTS for idempotency

-- ============================================================================
-- Vector index evaluation (2026-06-08):
-- Current: pgvector ivfflat index on content_embeddings, lists=100, 768 dims (Gemini)
-- Current count: ~71 embeddings — ivfflat is optimal at this scale
-- Threshold: switch to HNSW at >50K embeddings for better recall at lower latency
-- HNSW migration command (when needed):
--   DROP INDEX IF EXISTS idx_content_embeddings_vector;
--   CREATE INDEX idx_content_embeddings_vector ON content_embeddings
--     USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
-- ============================================================================

-- Tools: lookup by slug (highly used)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);

-- Tool releases: timeline queries (release history per tool, newest first)
CREATE INDEX IF NOT EXISTS idx_tool_releases_tool_date
  ON tool_releases(tool_id, release_date DESC);

-- Ecosystem status: capability matrix lookups
CREATE INDEX IF NOT EXISTS idx_ecosystem_status_tool_cap
  ON ecosystem_status(tool_id, capability);
CREATE INDEX IF NOT EXISTS idx_ecosystem_status_category
  ON ecosystem_status(category);

-- Content index: pillar hub queries
CREATE INDEX IF NOT EXISTS idx_content_index_pillar_status
  ON content_index(pillar, status);
CREATE INDEX IF NOT EXISTS idx_content_index_type
  ON content_index(content_type, status);

-- Featured content lookup (homepage "start here" query)
-- Partial index — only indexes featured rows, smaller and faster
CREATE INDEX IF NOT EXISTS idx_content_index_featured
  ON content_index(is_featured, status)
  WHERE is_featured = true;

-- Showcase: gallery queries (only published)
CREATE INDEX IF NOT EXISTS idx_showcase_status
  ON showcase_projects(status)
  WHERE status = 'published';

-- User AI usage: daily limit checks (added in migration 019)
-- Note: 019 already creates idx_user_ai_usage_lookup. Skipping here.

-- Cron runs: monitoring queries (latest runs per cron)
-- Note: 020 already creates idx_cron_runs_name_started. Skipping here.

-- Progress: user activity lookups
CREATE INDEX IF NOT EXISTS idx_progress_user_content
  ON progress(user_id, content_slug);
