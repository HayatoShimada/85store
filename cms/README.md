# 85-Store CMS（Payload）

85-Store の入力画面をまとめた CMS です。85pi（Raspberry Pi 5）の docker compose で動かします。

- **サイト（85-store.com）**: 記事・バナー
- **Shopify（shop.85-store.com）**: 商品・コレクション・ストアのページ・ブログの記事・メニュー（正は Shopify。→「Shopify との同期」）

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

[payload] ⇄ [Shopify Admin API]  商品・ストアの内容（Payload 専用のアプリ。Client Credentials）
[payload] → [85crm の内部 API]   説明文の AI 生成（tailscale serve の 11443 番。tailnet 内だけ）
```

- サイトは R2 の JSON だけを読みます。85pi が止まっていても、サイトの表示とビルドは影響を受けません（止まっている間は編集できないだけです）。
- ログインにパスワードは使いません。Tailscale のアカウントのメールアドレスを「メンバー」に登録した人だけが入れます。

## 使い方

- **記事を書く**: 「記事」→「新規作成」。本文の「+」から写真・写真の横並び・埋め込み（YouTube・Spotify・Instagram・Google マップ）を入れられます。
  - 「公開」を押すと、数十秒でサイトに反映されます。「下書き保存」はサイトに出ません。
  - スラッグ（URL）は空なら日付から作ります。半角英数とハイフンで変えられます。
- **バナー**: ドラッグで並び替えます。縦長の画像はトップのヒーロー（先頭から2枚）、それ以外は Pick Up に並びます。
- **商品**: 「商品」→ 開くと Shopify の最新の内容を取り込みます。直して保存すると Shopify に送ります。
  - 古着は「ブランド」「品名」から商品名（`[BRAND] 品名 [USED]`）を作ります。自動コレクションの多くが商品名で判定しているので、形を崩さないでください。
  - 新しく作った商品は、すべての販売チャネルに出します（表示するかは「状態」で決まります）。原価・SKU・初期在庫は作成時だけ送ります。
  - 「説明文を作る（AI）」は 85crm の生成を呼び、説明文を置き換えます（保存すると Shopify に送ります）。
  - 削除はできません。やめる商品は「状態」をアーカイブにします。
- **コレクション・ストアのページ・ストアの記事・メニュー**: 商品と同じく、開くと取り込み、保存で送ります。
  - 本文は「見たまま」と「HTML を直接」。画像・埋め込みのある既存の本文は、崩さないよう「HTML を直接」で取り込んでいます。
  - 削除は管理者だけです（Shopify からも消えます）。
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
./deploy.sh            # この PC で arm64 向けにビルドし、イメージを 85pi に送って起動（15分ほど）
./deploy.sh logs       # ログを見る
```

- 85pi の上ではビルドしません（immich などと合わせてメモリが足りなくなり、85pi が落ちたことがあるため）。
- この PC で初めてビルドするときだけ、arm64 のエミュレーションを入れます: `docker run --privileged --rm tonistiigi/binfmt --install arm64`

`~/85store-cms/.env` の残りの値（`PAYLOAD_SECRET`・`CMS_WEBHOOK_SECRET` など）は作成済みです。`CMS_WEBHOOK_SECRET` は Vercel の環境変数にも同じ値が入っています。

### 4. microCMS から移す（初回だけ）

このPCで移行し、できた DB を 85pi に送ります。画像は R2 に直接アップロードされます。

```bash
cd cms
# 85pi の .env から R2 の値を読み込んで実行（値は表示されない）
set -a; eval "$(ssh hacopi@85pi.taila713c8.ts.net 'grep -E "^(R2_|MEDIA_PUBLIC_URL)" ~/85store-cms/.env')"; set +a
rm -f data/payload.db && npm run migrate:microcms
./deploy.sh push-db
```

- 移行は何度やり直しても重複しません（microCMS の ID と画像の URL で上書きします）。
- 最後に、本文のテキスト・画像・埋め込みの数を元の記事と比べたレポート（`data/migration-report.json`）を出します。

## Shopify との同期

正は Shopify です。Payload は入力画面で、編集する前に Shopify の内容を取り込みます（`src/shopify/`）。

- **取り込み**: 画面を開いたときと、10分ごと（商品は 0・10・20…分、ストアの内容は 5・15・25…分）。Payload で保存したがまだ送れていないもの（待ち・dry-run・衝突・エラー）は取り込みません。
- **送る**: 保存するとジョブに積み、2秒後に送ります（失敗したら2回までやり直し、1分ごとに拾い直す）。送ったあとに読み直して、Shopify が付けたもの（オートメーションの「新着」タグなど）も書き戻します。
- **衝突**: 前回の同期のあとに Shopify 側（管理画面・85crm・POS など）でも変わっていたら、送らずに止めます。右の欄に違いが出るので、「Payload の内容で上書きする / Shopify の内容を取り込む」を選んで保存します。
- **モード**（85pi の `.env`）: `SHOPIFY_SYNC_MODE`（商品）・`SHOPIFY_STORE_SYNC_MODE`（ストアの内容）。`off` / `dry-run`（送る内容を記録するだけ）/ `live`。変えたら `docker compose up -d payload`。
- **全件の取り込み・差分の確認**（管理者だけ）: 新しく同期の対象を足したときは、dry-run で全件を取り込み、差分がゼロになってから live にします。

  | | 取り込み | 差分の確認 |
  |---|---|---|
  | 商品 | `POST /api/shopify/import-products` | `GET /api/shopify/diff-products` |
  | ストアの内容 | `POST /api/shopify/import-store` | `GET /api/shopify/diff-store` |

- **新しく撮った商品写真**は 85pi の `/data/product-photos` に一時的に置き、Shopify に上げたら消します（写真の正も Shopify）。コレクション・記事の画像は「画像」（R2）から選び、Shopify にコピーされます。

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
- **本番（85pi）の DB はマイグレーションで変えます**（本番では Payload が表を自動で作らないため）。コレクションを変えたら、R2 のダミーの値を付けてマイグレーションを作り、`src/migrations/` をコミットします（起動時に適用されます）。R2 の値が無いと、画像の保存先の列が違うマイグレーションになります。

  ```bash
  R2_ACCOUNT_ID=x R2_ACCESS_KEY_ID=x R2_SECRET_ACCESS_KEY=x R2_BUCKET=x MEDIA_PUBLIC_URL=https://media.85-store.com \
    npm run payload migrate:create <名前>
  ```

  - 表の「作成か名前の変更か」を聞かれたら、データを移す必要がなければ「create table」を選びます。
  - グループの中に `id` という名前の欄を作らない（検索できなくなる）。入れ子の配列は階層ごとに名前を変える（同じ名前だと関連の名前がぶつかる）。
