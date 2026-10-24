CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS research_passages (
 id text PRIMARY KEY,
 passage text NOT NULL,
 metadata jsonb NOT NULL,
 embedding vector(1536),
 search tsvector GENERATED ALWAYS AS (to_tsvector('english', passage)) STORED
);
CREATE INDEX IF NOT EXISTS passages_search ON research_passages USING gin(search);
