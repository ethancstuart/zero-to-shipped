CREATE TABLE knowledge_nodes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  node_type text NOT NULL CHECK (node_type IN ('tool','capability','concept','content','project','persona')),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE knowledge_edges (
  source_id uuid REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  target_id uuid REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  relationship text NOT NULL CHECK (relationship IN ('requires','teaches','uses','enables','compares','built_with','related')),
  weight float DEFAULT 1.0,
  metadata jsonb,
  PRIMARY KEY (source_id, target_id, relationship)
);

CREATE INDEX idx_knowledge_edges_source ON knowledge_edges(source_id);
CREATE INDEX idx_knowledge_edges_target ON knowledge_edges(target_id);

ALTER TABLE knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read nodes" ON knowledge_nodes FOR SELECT USING (true);
CREATE POLICY "Public read edges" ON knowledge_edges FOR SELECT USING (true);
