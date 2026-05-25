CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE content_embeddings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_slug text NOT NULL,
  chunk_index integer NOT NULL,
  heading_path text,
  chunk_text text NOT NULL,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_slug, chunk_index)
);

CREATE INDEX ON content_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

ALTER TABLE content_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read embeddings" ON content_embeddings FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(1536),
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
