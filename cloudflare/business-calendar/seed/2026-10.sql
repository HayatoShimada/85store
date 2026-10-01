-- 2026年10月の営業日（Instagram の営業日カレンダーより）。木曜は通常の定休日なので含めない
INSERT OR REPLACE INTO days (date, kind, opens, closes, note, updated_at, updated_by) VALUES
  ('2026-10-05', 'hours', '13:30', '18:00', NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 'seed'),
  ('2026-10-07', 'closed', NULL, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 'seed'),
  ('2026-10-14', 'closed', NULL, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 'seed'),
  ('2026-10-16', 'closed', NULL, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 'seed'),
  ('2026-10-21', 'closed', NULL, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 'seed'),
  ('2026-10-27', 'closed', NULL, NULL, NULL, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 'seed');
