#!/usr/bin/env bash
# 管理API・公開APIの動作確認（wrangler dev と test/access-mock.mjs を起動した状態で実行）
TOKENS=${1:?tokens.json のパス}
B=${BASE:-http://127.0.0.1:8787}
ADMIN=$(node -e "console.log(require('$TOKENS').admin)")
OTHER=$(node -e "console.log(require('$TOKENS').other)")
WRONG=$(node -e "console.log(require('$TOKENS').wrongAud)")
ORIGIN="https://calendar-admin.85-store.com"
C="curl -s -m 10"
t(){ printf "%-40s %s\n" "$1" "$2"; }
put(){ $C -w ' %{http_code}' -X PUT -H "Origin: $ORIGIN" -H "Cf-Access-Jwt-Assertion: $ADMIN" -H 'Content-Type: application/json' -d "$2" "$B$1"; }
t "管理画面: トークンなし" "$($C -o /dev/null -w '%{http_code}' $B/)"
t "管理画面: AUD違い" "$($C -o /dev/null -w '%{http_code}' -H "Cf-Access-Jwt-Assertion: $WRONG" $B/)"
t "管理画面: 許可外のメール" "$($C -o /dev/null -w '%{http_code}' -H "Cf-Access-Jwt-Assertion: $OTHER" $B/)"
t "管理画面: 管理者" "$($C -o /dev/null -w '%{http_code} %{content_type}' -H "Cf-Access-Jwt-Assertion: $ADMIN" $B/)"
t "/api/me" "$($C -H "Cf-Access-Jwt-Assertion: $ADMIN" $B/api/me)"
t "PUT: Originなし（CSRF）" "$($C -o /dev/null -w '%{http_code}' -X PUT -H "Cf-Access-Jwt-Assertion: $ADMIN" -H 'Content-Type: application/json' -d '{"kind":"closed"}' $B/api/days/2026-10-07)"
t "PUT: 10/07 休業" "$(put /api/days/2026-10-07 '{"kind":"closed","note":"仕入れのため"}')"
t "PUT: 10/05 13:30-18:00" "$(put /api/days/2026-10-05 '{"kind":"hours","opens":"13:30","closes":"18:00"}')"
t "PUT: 不正な時刻" "$(put /api/days/2026-10-06 '{"kind":"hours","opens":"25:00","closes":"18:00"}')"
t "PUT: 開店>=閉店" "$(put /api/days/2026-10-06 '{"kind":"hours","opens":"18:00","closes":"12:00"}')"
t "PUT: 存在しない日付 2/30" "$(put /api/days/2026-02-30 '{"kind":"closed"}')"
t "PUT: 壊れたJSON" "$(put /api/days/2026-10-06 '{bad')"
t "公開API: PUT は不可" "$($C -o /dev/null -w '%{http_code}' -X PUT $B/v1/calendar)"
t "公開API: 書き込み後" "$($C "$B/v1/calendar?from=2026-10-01&to=2026-10-31" | head -c 200)"
t "公開API: 期間が長すぎる" "$($C -w ' %{http_code}' "$B/v1/calendar?from=2026-01-01&to=2027-12-31")"
t "PUT: 通常の設定" "$(put /api/settings '{"opens":"12:00","closes":"18:00","closedWeekdays":[4]}')"
t "DELETE: 10/07" "$($C -w ' %{http_code}' -X DELETE -H "Origin: $ORIGIN" -H "Cf-Access-Jwt-Assertion: $ADMIN" $B/api/days/2026-10-07)"
t "公開API: 削除後" "$($C "$B/v1/calendar?from=2026-10-01&to=2026-10-31" | head -c 200)"
