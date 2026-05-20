-- ① games テーブルに is_owned / submitter_nickname を追加
ALTER TABLE games
  ADD COLUMN IF NOT EXISTS is_owned           BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS submitter_nickname TEXT;

-- ② game_submissions テーブル新規作成
CREATE TABLE IF NOT EXISTS game_submissions (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT        NOT NULL,
  submitter_nickname TEXT        NOT NULL,
  image_path         TEXT        NOT NULL,
  image_consented    BOOLEAN     NOT NULL DEFAULT FALSE,
  description        TEXT,
  min_players        INT,
  max_players        INT,
  play_time_min      INT,
  play_time_max      INT,
  difficulty         TEXT,
  genres             TEXT[],
  submitter_comment  TEXT,
  status             TEXT        NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','approved','rejected')),
  admin_note         TEXT,
  approved_game_id   UUID        REFERENCES games(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at        TIMESTAMPTZ
);

-- ③ RLS 設定
ALTER TABLE game_submissions ENABLE ROW LEVEL SECURITY;

-- 誰でも申請できる（INSERT）
CREATE POLICY "allow_public_insert"
  ON game_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 読み取り・更新・削除はサービスロール（管理者）のみ
-- service_role は RLS をバイパスするためポリシー不要
