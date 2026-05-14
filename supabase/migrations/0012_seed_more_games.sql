INSERT INTO games (title, slug, description, rules, recommended_for, min_players, max_players, play_time_min, play_time_max, difficulty, genres, is_published, sort_order) VALUES

('ナブラ演算子ゲーム', 'nabla-operator-game',
'東大生が作った本気の数学対戦ゲーム！微積分で相手の基底をゼロに追い込め。',
'各プレイヤーは「1」「x」「x²」の関数基底を持ってスタート。微分・極限などの演算カードを使い、相手の基底をすべて「0」や「∞」に変換すれば勝利。∇演算子は全基底を同時微分する必殺技。計算ミスは即敗北の緊張感！',
'数学（特に数Ⅲ・微積分）が得意な理系プレイヤー向け。2人でじっくり頭を使いたい人向け',
2, 2, 5, 15, 'hard', ARRAY['strategy', 'puzzle'], true, 193),

('ギャングポーカー', 'gang-poker',
'ギャング団で金庫を狙え！ポーカーベースの協力型カードゲーム。',
'テキサスホールデムをベースに、全員でお互いの手札の強さの順位を予測し合う。ブラフは禁止で、チップで自分の強さを正直に伝える。3ラウンド成功で金塊ゲット、3回失敗でアラーム発動！',
'ポーカー初心者でも楽しめる、協力ゲームが好きな人向け',
3, 6, 15, 25, 'easy', ARRAY['cooperative', 'strategy'], true, 194);
