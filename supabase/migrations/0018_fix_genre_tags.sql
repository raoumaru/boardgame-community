-- 推薦アルゴリズムで出現しない/少ないゲームのジャンルタグを修正
-- 対象8本：ニムト・ドデリド・はぁって言うゲーム・DOBBLE・そっとおやすみ・ピクテル・ナナ・ナナトリドリ

-- ニムト: 数字カードのカウンティング戦略ゲーム → strategy 追加
UPDATE games
SET genres = array_append(genres, 'strategy')
WHERE slug = 'nimmt'
  AND NOT ('strategy' = ANY(genres));

-- ドデリド: 声に出す言葉ゲーム → word_sense 追加
UPDATE games
SET genres = array_append(genres, 'word_sense')
WHERE slug = 'doderido'
  AND NOT ('word_sense' = ANY(genres));

-- はぁって言うゲーム: 感情表現当てゲーム → word_sense 追加
UPDATE games
SET genres = array_append(genres, 'word_sense')
WHERE slug = 'haatte-iu-game'
  AND NOT ('word_sense' = ANY(genres));

-- DOBBLE: シンボル合致パズル → puzzle 追加
UPDATE games
SET genres = array_append(genres, 'puzzle')
WHERE slug = 'dobble'
  AND NOT ('puzzle' = ANY(genres));

-- そっとおやすみ: 隠れキャラ役割ゲーム → hidden_role 追加
UPDATE games
SET genres = array_append(genres, 'hidden_role')
WHERE slug = 'sotto-oyasumi'
  AND NOT ('hidden_role' = ANY(genres));

-- ピクテル: お絵かき当てゲーム → puzzle 追加
UPDATE games
SET genres = array_append(genres, 'puzzle')
WHERE slug = 'pictele'
  AND NOT ('puzzle' = ANY(genres));

-- ナナ: 数字のセット集め戦略 → strategy 追加
UPDATE games
SET genres = array_append(genres, 'strategy')
WHERE slug = 'nana'
  AND NOT ('strategy' = ANY(genres));

-- ナナトリドリ: 鳥テーマのセット集め戦略 → strategy 追加
UPDATE games
SET genres = array_append(genres, 'strategy')
WHERE slug = 'nana-toridori'
  AND NOT ('strategy' = ANY(genres));
