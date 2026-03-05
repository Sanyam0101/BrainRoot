-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create notes table with embedding column
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT,
  tags TEXT[],
  embedding vector(384),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS notes_embedding_hnsw
ON notes USING hnsw (embedding vector_cosine_ops)
WITH (m=16, ef_construction=200);

-- Test data (optional)
INSERT INTO notes (user_id, content, tags) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Test note content', ARRAY['test', 'demo']);
