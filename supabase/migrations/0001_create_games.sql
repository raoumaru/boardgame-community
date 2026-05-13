-- games テーブル
create table games (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text unique not null,
  description   text,
  min_players   integer not null,
  max_players   integer not null,
  play_time_min integer not null,
  play_time_max integer,
  difficulty    text check (difficulty in ('easy','medium','hard','expert')),
  genres        text[],
  image_path    text,
  is_published  boolean not null default true,
  sort_order    integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- updated_at 自動更新
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger games_updated_at
  before update on games
  for each row execute function update_updated_at();

-- インデックス
create index games_published_idx on games(is_published);
create index games_genres_idx on games using gin(genres);
create index games_sort_idx on games(sort_order, created_at);

-- RLS 有効化
alter table games enable row level security;

-- 公開ゲームは全員読み取り可
create policy "public read published games"
  on games for select
  using (is_published = true);

-- Supabase Storage: game-images バケット（ダッシュボードで手動作成が必要）
-- バケット設定: Public = true, ファイルサイズ上限 2MB
