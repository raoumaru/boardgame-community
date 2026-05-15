-- 漢字タイトルの title_kana 補完（日本語検索対応）
-- 既存設定（0010）: 花火/狩歌/狩歌パラダイムシフト/娘は誰にもやらん！/語彙の王様/不謹慎王/人にやさしくなるゲーム/THE残業

UPDATE games SET title_kana = 'はんにんはおどる'
  WHERE slug = 'hannin-wa-odoru';

UPDATE games SET title_kana = 'たったいまかんがえたぷろぽーずのことばをきみにそそぐよ'
  WHERE slug = 'propose-kotoba';

UPDATE games SET title_kana = 'きぬたしかしんけいすいじゃく'
  WHERE slug = 'kinuta-shika-memory';

UPDATE games SET title_kana = 'おんそくちゃーはん'
  WHERE slug = 'sonic-chahan';

UPDATE games SET title_kana = 'おじゃまもの'
  WHERE slug = 'saboteur';

UPDATE games SET title_kana = 'はぁっていうげーむ'
  WHERE slug = 'haa-game';

UPDATE games SET title_kana = 'いまさらきけないびじねすようごげーむ'
  WHERE slug = 'business-jargon-game';

UPDATE games SET title_kana = 'えせげいじゅつかにゅーよーくへいく'
  WHERE slug = 'fake-artist-new-york';

UPDATE games SET title_kana = 'なぶらえんざんしげーむ'
  WHERE slug = 'nabla-operator-game';
