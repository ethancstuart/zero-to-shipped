-- Migration 023: Allow content_index to carry the rendered MDX body for
-- auto-published briefs.
--
-- Why: on Vercel, cron-generated MDX files (e.g. the weekly digest) don't
-- persist on the filesystem between invocations. By optionally storing the
-- body alongside the index row, the loader can render those briefs without
-- requiring a committed file. Existing filesystem-backed content is unaffected
-- because the column is nullable and the loader prefers disk first.

ALTER TABLE content_index
  ADD COLUMN IF NOT EXISTS body_mdx text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS series text;

CREATE INDEX IF NOT EXISTS idx_content_index_series ON content_index(series)
  WHERE series IS NOT NULL;
