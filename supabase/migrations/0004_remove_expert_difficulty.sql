-- expert を hard に変換（アグリコラ・テラフォーミング・マーズ）
update games set difficulty = 'hard' where difficulty = 'expert';

-- check制約を更新（expert を除外）
alter table games drop constraint if exists games_difficulty_check;
alter table games add constraint games_difficulty_check
  check (difficulty in ('easy', 'medium', 'hard'));
