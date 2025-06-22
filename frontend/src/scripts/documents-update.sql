-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to existing document_chunks table
ALTER TABLE document_chunks 
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Add index for embedding column for better performance
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding 
ON document_chunks USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100); 