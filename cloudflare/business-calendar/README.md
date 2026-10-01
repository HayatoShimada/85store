# 営業日カレンダー（Cloudflare Worker）

85-Store の営業日（休業日・その日だけの営業時間・通常の営業時間）を管理する Worker です。

| ホスト | 役割 | 保護 |
|---|---|---|
| `calendar-admin.85-store.com` | 管理画面と書き込みAPI | Cloudflare Access（ログイン方法は Tailscale の tsidp のみ・info@85-store.com だけ許可）。Worker 側でも Access の JWT とメールを検証 |
| `calendar.85-store.com` | 公開の読み取りAPI `GET /v1/calendar` | なし（営業日は公開情報。GET のみ・キャッシュなし） |

サイト（Vercel）はブラウザから `https://calendar.85-store.com/v1/calendar` を直接読むので、保存した内容は **再デプロイなしで** カレンダーと「営業中」の表示に反映されます（表示時・60秒ごと・タブに戻ったとき）。データは D1 に保存します。

```
管理者の端末（tailnet 内）
  → calendar-admin.85-store.com
  → Cloudflare Access（ログイン: https://idp.<tailnet>.ts.net の tsidp）
  → Worker → D1
サイトのブラウザ → calendar.85-store.com/v1/calendar → Worker → D1
```

tsidp は Funnel 経由（tailnet の外）からの `/authorize` を拒否するため、tailnet 内の端末からしかログインできません（Cloudflare からのトークン交換だけが Funnel を通ります）。

---

## 1. Worker をデプロイする

```bash
cd cloudflare/business-calendar
npm install
npx wrangler login

# D1 を作成し、表示された database_id を wrangler.jsonc に書く
npx wrangler d1 create 85store-business-calendar
npm run db:migrate:remote

# （任意）2026年10月の営業日を入れる
npx wrangler d1 execute 85store-business-calendar --remote --file seed/2026-10.sql

npm run deploy
```

`calendar-admin.85-store.com` と `calendar.85-store.com` のカスタムドメインは、デプロイ時に自動で作られます（DNS は Cloudflare）。

`https://calendar.85-store.com/v1/calendar` を開いて JSON が返れば OK です。管理画面はまだ Access を設定していないので 401 になります（正常）。

## 2. tsidp を 85pi で動かす

### 2-1. Tailscale の ACL（管理コンソール → Access controls）

```jsonc
"tagOwners": {
  "tag:tsidp": ["autogroup:admin"],
},
"nodeAttrs": [
  // tsidp を Funnel で公開できるようにする（Cloudflare がトークンを取りに来るため）
  { "target": ["tag:tsidp"], "attr": ["funnel"] },
],
"grants": [
  // （既存の grants はそのまま残す）
  {
    // tsidp の管理画面（クライアント登録）を info@ だけに許可
    "src": ["info@85-store.com"],
    "dst": ["tag:tsidp"],
    "app": { "tailscale.com/cap/tsidp": [{ "allow_admin_ui": true }] },
  },
],
```

### 2-2. 認証キーを作る

管理コンソール → Settings → Keys → Generate auth key。Tags に `tag:tsidp` を付けます。

### 2-3. 85pi で起動

```bash
# このディレクトリの tsidp/compose.yaml を 85pi にコピーして
echo "TS_AUTHKEY=tskey-auth-..." > .env
docker compose up -d
docker compose logs -f   # 証明書の発行に数分かかることがある
```

tailnet 内の端末で `https://idp.<tailnet>.ts.net` を開き、tsidp の画面が出れば OK です。

### 2-4. Cloudflare 用のクライアントを登録

tsidp の管理画面で新しいクライアントを追加します。

- 名前: `Cloudflare Access`
- Redirect URI: `https://<チーム名>.cloudflareaccess.com/cdn-cgi/access/callback`

表示された **Client ID / Client Secret** を控えます。

## 3. Cloudflare Zero Trust を設定する

### 3-1. ログイン方法に tsidp を追加

Zero Trust → Settings → Authentication → Login methods → Add new → **OpenID Connect**

| 項目 | 値 |
|---|---|
| Name | `Tailscale` |
| App ID / Client secret | 2-4 で控えた値 |
| Auth URL | `https://idp.<tailnet>.ts.net/authorize` |
| Token URL | `https://idp.<tailnet>.ts.net/token` |
| Certificate URL | `https://idp.<tailnet>.ts.net/.well-known/jwks.json` |
| PKCE | オフ |
| Email claim | `email` |
| OIDC Claims（scopes） | `openid` `email` `profile` |

「Test」で tsidp のログインが通ることを確認します（tailnet 内の端末で）。

### 3-2. 管理画面を Access で保護

Zero Trust → Access → Applications → Add an application → **Self-hosted**

- Application domain: `calendar-admin.85-store.com`
- Identity providers: **Tailscale だけ** にチェック（Instant Auth をオン）
- Policy: Action **Allow**、Include → Emails → `info@85-store.com`

作成後、アプリの **Application Audience (AUD) Tag** と、チームドメイン（`<チーム名>.cloudflareaccess.com`）を `wrangler.jsonc` の `ACCESS_AUD` / `ACCESS_TEAM_DOMAIN` に書いて、もう一度 `npm run deploy` します。

## 4. 動作確認

- tailnet 内の info@ の端末で `https://calendar-admin.85-store.com` を開く → Tailscale でログイン → 管理画面が出る
- 日付をタップして休業にする → サイトのカレンダーと「営業中」の表示がすぐ変わる
- Tailscale を切った端末で開く → tsidp のログインが「not allowed over funnel」で拒否される
- 別のメールアドレスのアカウント → Access で拒否される

## 5. Googleマップ（ビジネスプロフィール）への自動反映

管理画面で保存するたびに、Googleマップの **通常の営業時間** と **特別営業時間**（今日から180日先まで）を管理画面の内容に合わせます（`src/google.ts`）。

> 同期を始めると、Googleマップで直接編集した特別営業時間は上書きされます。編集は管理画面に一本化してください。

### 前提: Business Profile API の利用承認

2026-10-01 に申請済み（ケースID: 7-6137000041496）。Google Cloud Console の「割り当て」で Business Profile 関連 API が **0 QPM → 300 QPM** になっていれば承認済みです。

### 承認後の手順

1. Google Cloud Console（申請したプロジェクト）で次の API を有効にする
   - My Business Account Management API
   - My Business Business Information API
2. 「API とサービス → OAuth 同意画面」を設定（外部・テストユーザーに info@85-store.com）
3. 「認証情報 → OAuth クライアント ID を作成」で種類 **デスクトップ アプリ** を作る
4. セットアップを実行（ブラウザで許可 → 店舗を選ぶ → secret を登録。値は画面に出ない）

   ```bash
   cd cloudflare/business-calendar
   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/google-setup.mjs --import
   ```

   `--import` を付けると、Googleマップに今ある「今日以降の特別営業時間」（祝日の営業時間など）を管理画面に取り込みます（管理画面で設定済みの日は上書きしません）。
5. 管理画面の「Googleマップ」の欄で「今すぐ反映する」を押し、「反映済み」になることと、Googleマップの特別営業時間に出ることを確認する

OAuth 同意画面が「テスト」のままだとリフレッシュトークンが7日で切れるので、動作確認後に「本番環境」に公開してください（自分だけが使うアプリなので審査は不要です）。

---

## ローカルでの開発・テスト

```bash
npm run db:migrate:local
# テスト用の Access 鍵（JWKS）とトークンを用意
node test/access-mock.mjs /tmp/tokens.json &
npx wrangler dev --local --env-file test/dev.vars --ip 127.0.0.1 --port 8787
# 別のターミナルで
./test/api-test.sh /tmp/tokens.json
```

`test/dev.vars` は Access の検証先をローカルのテスト用 JWKS に向けます（`ACCESS_CERTS_URL`）。本番では設定しません。

Googleマップへの同期を試すときは、Google の代わりのテストサーバーを使います:

```bash
node test/google-mock.mjs /tmp/google.log &
npx wrangler dev --local --env-file test/dev.vars --env-file test/dev-google.vars --ip 127.0.0.1 --port 8787
# 保存すると /tmp/google.log に Google へ送った内容が記録される
```

## API

| メソッド・パス | 説明 |
|---|---|
| `GET /v1/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD` | 公開。通常の営業時間と、期間内の例外日。省略時は「7日前〜120日後」 |
| `GET /` | 管理画面（要 Access） |
| `GET /api/me` | ログイン中のメール |
| `GET /api/calendar` | 公開APIと同じ形式 |
| `PUT /api/days/:date` | `{ "kind": "closed", "note"? }` または `{ "kind": "hours", "opens": "13:30", "closes": "18:00", "note"? }` |
| `DELETE /api/days/:date` | その日を通常どおりに戻す |
| `PUT /api/settings` | `{ "opens": "12:00", "closes": "18:00", "closedWeekdays": [4] }`（0=日曜） |
| `GET /api/sync-status` | Googleマップへの反映状況（未連携 / 最終成功時刻 / エラー） |
| `POST /api/sync` | Googleマップへの反映をやり直す |

書き込みは管理画面と同じオリジンの JSON リクエストだけを受け付けます（CSRF 対策）。
