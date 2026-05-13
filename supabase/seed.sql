-- テスト用シードデータ（10タイトル）
insert into games (title, slug, description, min_players, max_players, play_time_min, play_time_max, difficulty, genres, sort_order) values
  ('カタン', 'catan', '資源を集め、開拓地を建設して得点を競う定番ボードゲーム。交渉と戦略が重要。', 3, 4, 60, 120, 'medium', array['strategy', 'euro'], 1),
  ('ナンジャモンジャ', 'nanjamo', 'カードのキャラクターに名前をつけて、素早く呼ぶスピードゲーム。老若男女楽しめる。', 2, 6, 15, 30, 'easy', array['party', 'card'], 2),
  ('パンデミック', 'pandemic', '世界に蔓延する病原菌を協力して根絶する協力型ゲーム。難易度調整可能。', 2, 4, 45, 60, 'hard', array['cooperative', 'strategy'], 3),
  ('ito', 'ito', '1〜100の数字カードをヒントだけで小さい順に並べる協力ゲーム。盛り上がること間違いなし。', 2, 10, 20, 30, 'easy', array['party', 'cooperative'], 4),
  ('ドミニオン', 'dominion', 'デッキ構築型ゲームの元祖。カードを購入・使用しながら最強のデッキを作る。', 2, 4, 30, 60, 'medium', array['strategy', 'card', 'euro'], 5),
  ('ワードウルフ', 'word-wolf', '少数派の単語を持つ人（ウルフ）を議論で見つけ出す正体隠匿系パーティーゲーム。', 3, 8, 10, 20, 'easy', array['party'], 6),
  ('アグリコラ', 'agricola', '農場経営シミュレーション。食料を確保しながら農場を発展させる重量級ゲーム。', 1, 5, 90, 150, 'expert', array['strategy', 'euro'], 7),
  ('ダイスタワー', 'dice-tower', '仮タイトル。ダイスを使ったアクション選択ゲーム。', 2, 5, 30, 45, 'medium', array['dice', 'strategy'], 8),
  ('コードネーム', 'codenames', 'チームに分かれてワードヒントを出し、エージェントカードを当てるチーム対戦ゲーム。', 2, 8, 15, 30, 'easy', array['party', 'abstract'], 9),
  ('テラフォーミング・マーズ', 'terraforming-mars', '火星を人類が住める惑星に改造する長時間プレイの重量級ゲーム。エンジン構築が醍醐味。', 1, 5, 120, 180, 'expert', array['strategy', 'euro'], 10);
