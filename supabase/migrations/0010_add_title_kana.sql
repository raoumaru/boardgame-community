ALTER TABLE games ADD COLUMN IF NOT EXISTS title_kana text;

UPDATE games SET title_kana = 'はなび'                         WHERE title = '花火';
UPDATE games SET title_kana = 'てんかめいどう'                 WHERE title = '天下鳴動';
UPDATE games SET title_kana = 'ほうせきのきらめき'             WHERE title = '宝石のきらめき';
UPDATE games SET title_kana = 'かりうた'                       WHERE title = '狩歌';
UPDATE games SET title_kana = 'かりうたぱらだいむしふと'       WHERE title = '狩歌パラダイムシフト';
UPDATE games SET title_kana = 'むすめはだれにもやらん'         WHERE title = '娘は誰にもやらん！';
UPDATE games SET title_kana = 'ごいのおうさま'                 WHERE title = '語彙の王様';
UPDATE games SET title_kana = 'ふきんしんおう'                 WHERE title = '不謹慎王';
UPDATE games SET title_kana = 'ひとにやさしくなるげーむ'       WHERE title = '人にやさしくなるゲーム';
UPDATE games SET title_kana = 'ざんぎょう'                     WHERE title = 'THE残業';
UPDATE games SET title_kana = 'どみにおんいんぼう'             WHERE title = 'ドミニオン：陰謀';
UPDATE games SET title_kana = 'どみにおんよそうきょく'         WHERE title = 'ドミニオン：夜想曲';
