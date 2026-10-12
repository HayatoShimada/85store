-- お客さまが検索した言葉（日本時間の日ごと）。IP などお客さまを特定できる情報は残さない
CREATE TABLE search_log (
  day TEXT NOT NULL,         -- YYYY-MM-DD（日本時間）
  kind TEXT NOT NULL,        -- text（ことば）| image（写真）
  query TEXT NOT NULL,       -- そろえた検索語。写真のときは ''
  count INTEGER NOT NULL DEFAULT 0,
  results INTEGER NOT NULL,  -- 最後に検索したときに出した商品の数
  last_at TEXT NOT NULL,     -- 最後に検索した日時（ISO 8601）
  PRIMARY KEY (day, kind, query)
);
