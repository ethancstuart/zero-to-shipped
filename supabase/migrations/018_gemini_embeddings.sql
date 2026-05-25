-- Switch from OpenAI text-embedding-3-small (1536 dims) to Gemini text-embedding-004 (768 dims)
-- Drop and recreate since no data exists yet

DROP FUNCTION IF EXISTS match_embeddings;
DROP INDEX IF EXISTS content_embeddings_embedding_idx;

ALTER TABLE content_embeddings DROP COLUMN IF EXISTS embedding;
ALTER TABLE content_embeddings ADD COLUMN embedding vector(768);

CREATE INDEX ON content_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  content_slug text,
  chunk_text text,
  heading_path text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    content_slug,
    chunk_text,
    heading_path,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM content_embeddings
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
