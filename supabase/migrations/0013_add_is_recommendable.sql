ALTER TABLE games
  ADD COLUMN IF NOT EXISTS is_recommendable boolean NOT NULL DEFAULT true;
