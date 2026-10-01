# 85-Store CMS（Payload）

85-Store のサイトの記事・バナーを管理する CMS です。85pi（Raspberry Pi 5）の docker compose で動かします。

```
[メンバーのスマホ・PC（tailnet 内）]
   │ https://cms.taila713c8.ts.net
   ▼
[85pi: docker compose]
   ├─ tailscale   tailnet に「cms」として参加。HTTPS で payload に転送し、ログインした人のメールを渡す
   ├─ payload     管理画面（ホストにポートを出さない）
   └─ litestream  DB（SQLite）を R2 の 85store-cms-backup へ随時バックアップ
        │ 公開・更新・削除のたびに
        ▼
[R2: 85store-media（media.85-store.com）]
   ├─ media/     画像（元画像と avif / webp の各サイズ）
   └─ content/   公開中の記事・バナーの JSON → サイト（Vercel）が読む
```

- サイトは R2 の JSON だけを読みます。85pi が止まっていても、サイトの表示とビルドは影響を受けません（止まっている間は編集できないだけです）。
- ログインにパスワードは使いません。Tailscale のアカウントのメールアドレスを「メンバー」に登録した人だけが入れます。

## 使い方

- **記事を書く**: 「記事」→「新規作成」。本文の「+」から写真・写真の横並び・埋め込み（YouTube・Spotify・Instagram・Google マップ）を入れられます。
  - 「公開」を押すと、数十秒でサイトに反映されます。「下書き保存」はサイトに出ません。
  - スラッグ（URL）は空なら日付から作ります。半角英数とハイフンで変えられます。
- **バナー**: ドラッグで並び替えます。縦長の画像はトップのヒーロー（先頭から2枚）、それ以外は Pick Up に並びます。
- **メンバーを追加する**（管理者だけ）:
  1. Tailscale の管理画面から、その人を tailnet に招待する
  2. CMS の「メンバー」で、その人の Tailscale のメールアドレスを登録し、権限を選ぶ（管理者 / 編集者）

## セットアップ（初回）

### 1. Cloudflare R2

- バケット `85store-media`（`media.85-store.com` を割り当て済み）と `85store-cms-backup`（非公開）は作成済みです。
- **API トークンを作る**: Cloudflare ダッシュボード → R2 → 「API トークンを管理」→「API トークンを作成」
  - 権限: オブジェクトの読み取りと書き込み
  - 対象: `85store-media` と `85store-cms-backup` の2つだけ
  - 表示された「アクセスキー ID」と「シークレットアクセスキー」を、85pi の `~/85store-cms/.env` の `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` に書く（チャットなどには貼らない）

### 2. Tailscale

- **ACL（アクセス制御）**: 管理画面の Access controls で、次の内容を足します。
  - スタッフが CMS 以外（85pi の vaultwarden・immich など）に入れないよう、全員に何でも許す設定（`"src": ["*"], "dst": ["*"]`）がある場合は、管理者だけにする。

  ```jsonc
  "tagOwners": {
    "tag:cms": ["autogroup:admin"],
  },
  "grants": [
    // 管理者（自分）はすべての端末に入れる
    { "src": ["autogroup:admin"], "dst": ["*"], "ip": ["*"] },
    // メンバー（スタッフ）は CMS の管理画面だけ
    { "src": ["autogroup:member"], "dst": ["tag:cms"], "ip": ["443"] },
    // （tsidp など、既存の設定は残す）
  ],
  ```

- **認証キーを作る**: Settings → Keys → Generate auth key
  - Reusable: オフ、Ephemeral: オフ、Pre-approved: オン、Tags: `tag:cms`
  - 85pi の `~/85store-cms/.env` の `TS_AUTHKEY` に書く

### 3. 85pi に配置する

```bash
./deploy.sh            # ソースを 85pi に送り、85pi の上でビルドして起動（初回は10分ほど）
./deploy.sh logs       # ログを見る
```

`~/85store-cms/.env` の残りの値（`PAYLOAD_SECRET`・`CMS_WEBHOOK_SECRET` など）は作成済みです。`CMS_WEBHOOK_SECRET` は Vercel の環境変数にも同じ値が入っています。

### 4. microCMS から移す（初回だけ）

このPCで移行し、できた DB を 85pi に送ります。画像は R2 に直接アップロードされます。

```bash
cd cms
# 85pi の .env から R2 の値を読み込んで実行（値は表示されない）
set -a; eval "$(ssh hacopi@85pi 'grep -E "^(R2_|MEDIA_PUBLIC_URL)" ~/85store-cms/.env')"; set +a
rm -f data/payload.db && npm run migrate:microcms
./deploy.sh push-db
```

- 移行は何度やり直しても重複しません（microCMS の ID と画像の URL で上書きします）。
- 最後に、本文のテキスト・画像・埋め込みの数を元の記事と比べたレポート（`data/migration-report.json`）を出します。

## バックアップから戻す

Litestream が R2 の `85store-cms-backup` に DB を随時コピーしています（30日分）。

```bash
ssh hacopi@85pi
cd ~/85store-cms
docker compose stop payload litestream
docker compose run --rm --no-deps litestream restore -o /data/payload.restored.db /data/payload.db
docker compose run --rm --no-deps --entrypoint sh payload -c 'mv /data/payload.restored.db /data/payload.db && rm -f /data/payload.db-wal /data/payload.db-shm'
docker compose up -d
```

画像と書き出した JSON は R2 にあるので、DB を戻せば元どおりになります。書き出しをやり直したいときは、どれかの記事を保存し直してください（保存のたびに全件を書き出します）。

## ローカルでの開発

```bash
cd cms
cp .env.example .env   # PAYLOAD_SECRET を入れ、CMS_DEV_LOGIN=info@85-store.com を有効にする
npm install
npm run dev -- -p 3001 # http://localhost:3001/admin
```

- R2 の値が無いときは、画像は `media/`、書き出しは `.local-bucket/` に保存し、`http://localhost:3001/local-bucket/content/...` で配信します。
- サイトをこれにつなぐときは、リポジトリ直下で `CMS_CONTENT_URL=http://localhost:3001/local-bucket/content npm run dev`。
- コレクションを変えたら `npm run generate:types` で `src/payload-types.ts` を作り直します。
