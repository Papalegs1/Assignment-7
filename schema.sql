BEGIN;

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL CHECK (length(trim(name)) > 0)
);

CREATE TABLE IF NOT EXISTS jokes (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  setup TEXT NOT NULL,
  delivery TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jokes_category_id ON jokes(category_id);

COMMIT;
