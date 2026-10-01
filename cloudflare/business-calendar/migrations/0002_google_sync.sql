-- Googleマップ（ビジネスプロフィール）への同期の状態（1行だけ）
CREATE TABLE sync_status (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_attempt_at TEXT,
  last_success_at TEXT,
  last_error TEXT
);

INSERT INTO sync_status (id) VALUES (1);
