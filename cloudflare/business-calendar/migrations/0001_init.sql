-- 通常の営業時間と定休曜日（1行だけ）
CREATE TABLE settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  opens TEXT NOT NULL,
  closes TEXT NOT NULL,
  closed_weekdays TEXT NOT NULL, -- JSON配列（0=日曜 … 6=土曜）
  updated_at TEXT NOT NULL,
  updated_by TEXT
);

INSERT INTO settings (id, opens, closes, closed_weekdays, updated_at, updated_by)
VALUES (1, '12:00', '18:00', '[4]', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 'init');

-- 日付ごとの例外（臨時休業 / その日だけの営業時間）
CREATE TABLE days (
  date TEXT PRIMARY KEY, -- YYYY-MM-DD（日本時間）
  kind TEXT NOT NULL CHECK (kind IN ('closed', 'hours')),
  opens TEXT,
  closes TEXT,
  note TEXT,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);
