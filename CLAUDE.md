# CLAUDE.md

このリポジトリで作業する Claude Code 向けのガイドです。

## プロジェクト概要

富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」の公式サイト（https://85-store.com）。
ブログ・バナーは自前の CMS（**Payload**、`cms/`、85pi で運用）で管理し、購入は Shopify のオンラインストア（https://shop.85-store.com）へ誘導する。
Shopify の商品・コレクション・ストアのページ・ブログ・メニューも、同じ Payload を入力画面にしている（正は Shopify）。

- Next.js 16（App Router / Turbopack / **Cache Components**）
- React 19 / TypeScript 5
- Tailwind CSS v4（CSSファーストの設定。`tailwind.config.ts` は無い）
- CMS（Payload。サイトは R2 に書き出された JSON を読む）、note.com RSS、Shopify Storefront API（新着商品・ポリシー）
- Vercel にデプロイ

## コマンド

```bash
npm run dev      # 開発サーバー（Turbopack）
npm run build    # 本番ビルド
npm run start    # 本番サーバー
npx eslint .     # Lint（next lint は Next 16 で廃止）
npx tsc --noEmit # 型チェック
```

環境変数は `.env.local`（`.env.example` 参照）。記事・バナーは本番の R2（`https://media.85-store.com/content`）を読むので、ローカルでも設定なしで表示できる。

## アーキテクチャ

### データ取得とキャッシュ（`lib/cms.ts` / `lib/note.ts`）

- `next.config.ts` で `cacheComponents: true`。データ取得は `"use cache"` + `cacheTag` + `cacheLife` でキャッシュする。
- 記事・バナーは CMS が R2 に書き出した JSON（`posts/index.json`・`posts/<slug>.json`・`banners.json`）を読み、タグ `blogs` / `banners` でキャッシュする。絞り込み・並べ替え・ページ分けはサイト側で行う。`cacheLife("days")` は通知が届かなかったときの保険。
- **CMS の取得エラーは握りつぶさない。** 空配列や404をキャッシュすると数日間壊れたページが残るため。ビルド失敗なら直前のデプロイが残り、再生成失敗なら古いページが配信され続ける。
- note は補助コンテンツなので、失敗時は空配列を `cacheLife("minutes")` で短くキャッシュして止めない。
- 新しい取得関数を足すときは、キャッシュ層（`loadIndex` / `loadPost` / `loadBanners`）を経由させる。

### 更新の反映（`app/api/revalidate/route.ts`）

CMS が公開・更新のたびに R2 へ書き出したあと `POST /api/revalidate` を呼ぶ。署名（`x-cms-signature`、HMAC-SHA256、`CMS_WEBHOOK_SECRET`）を検証して `revalidateTag(api, { expire: 0 })` する。記事の公開・更新で全体を再ビルドする必要はない。

### Cache Components の注意点

- `export const runtime = 'edge'` と route segment の `export const revalidate` は使えない（キャッシュ期間は `cacheLife` で指定）。
- `generateStaticParams` は空配列だとビルドエラーになる。`utils/static-params.ts` の `nonEmptyParams()` を使う（0件ならダミー値を返し、ページ側で `notFound()`）。
- `generateStaticParams` は**エンコードしていない生の値**を返す。エンコードすると二重エンコードになり、日本語のカテゴリ等が404になる。ページで受け取る `params` は日本語がエンコードされて届くので `decodeURIComponent` する。
- `new Date()` など実行ごとに変わる値は `"use cache"` の中で使う（例: `lib/feed.ts`）。
- `'use cache'` の中で投げた例外は、呼び出し側で catch してもビルドを失敗させる。握りつぶしたいときはキャッシュ関数の中で catch する。

### ルーティング

| パス | 内容 |
|---|---|
| `/` | トップ（ヒーロー・Pick Up・新着商品・最新記事・note・Podcast・Works・店舗情報） |
| `/blog`, `/blog/page/[page]` | ブログ一覧（12件ずつ。`/blog/page/1` は `/blog` へリダイレクト） |
| `/blog/[slug]` | 記事（スラッグ）。microCMS から移した記事は、そのコンテンツIDがスラッグ。`id`（旧コンテンツID）でアクセスされ、スラッグと違う場合は 308 リダイレクト |
| `/blog/category/[category]`, `/blog/tag/[tag]` | カテゴリ・タグ別一覧（0件は404） |
| `/blog/products`, `/blog/styling`, `/blog/event` | ブログの区分（`utils/blog.ts` の `BLOG_SECTIONS` でカテゴリをまとめる。0件でも出す）。ショップのメニューからリンクしている。区分と同じ1つのカテゴリ（Products・Styling）の `/blog/category/...` は区分へ 308 |
| `/faq` | よくある質問（`lib/faq.ts`。表示・FAQPage の構造化データ・llms.txt で共有） |
| `/sitemap.xml`, `/robots.txt`, `/feed.xml`, `/atom.xml`, `/llms.txt` | `app/sitemap.ts` 等で動的生成。llms.txt は AI 向けの要約（`lib/llms.ts`）、robots.txt は AI のクローラーを明示的に許可 |
| `/about`, `/reserve`, `/upstore`, `/contact`, `/hakoneko` | 固定ページ（hakoneko は独自デザインのゲーム紹介ページ） |
| `/works` | 85-Store がつくったもの（ハコネコ・VividAtmos・BlackBullet・foxtrotdesign）。定義は `lib/works.ts`、画像は `public/images/works/`（4:3 のスクリーンショット）。トップ・About・フッターからも導線あり |
| `/shipping`, `/returns`, `/terms`, `/privacy` | Shopify のポリシーを表示 |

記事へのリンクは必ず `utils/blog.ts` の `getBlogPostPath(post)` で作る（スラッグ対応のため）。

### 営業日カレンダー（[business-calendar](https://github.com/HayatoShimada/business-calendar)・`lib/business-calendar.ts`）

- 休業日・その日だけの営業時間・通常の営業時間は、Cloudflare Worker の管理画面（`calendar-admin.85-store.com`）で入力し、D1 に保存する。
- 管理画面は Cloudflare Access で保護し、ログイン方法は 85pi で動かす **tsidp**（Tailscale の ID で入る OIDC）だけ。tsidp は tailnet 外からのログインを拒否するので、tailnet 内の info@85-store.com だけが使える。Worker 側でも Access の JWT とメールを検証する。
- サイトはブラウザから公開API（`https://calendar.85-store.com/v1/calendar`、`NEXT_PUBLIC_CALENDAR_API_URL` で変更可）を直接読む（`components/useBusinessCalendar.ts`）。**再デプロイ・キャッシュの再検証なしで即反映**される（表示時・60秒ごと・タブ復帰時）。
- クローラーや AI にも見えるよう、今後60日の臨時休業・営業時間の変更はサーバーでも読み（`lib/business-calendar-server.ts`、1時間ごとに取り直す。失敗してもページは止めない）、文字の一覧（`components/UpcomingSpecialDays.tsx`）と店舗の構造化データの `specialOpeningHoursSpecification`（`components/StoreStructuredData.tsx`）に出す。休業日を Event として載せない。
- 判定ロジックは `lib/business-calendar.ts`（`resolveDay` / `getStatusAt`、日本時間）。APIが使えないときは `STORE.hours`（通常ルール）で表示する。
- 「営業中」表示は `components/StoreStatus.tsx`、カレンダーは `components/BusinessCalendar.tsx`（トップの店舗情報・About・Reserve）。時刻に依存する表示はブラウザでだけ描く（`useNow`）。
- カレンダーの「共有」ボタンは `components/ShareCalendarButton.tsx`。画像は Worker が配信する `calendar-image.js`（canvas で描く ES モジュール）をブラウザで読み込んで作り、Web Share API（iOS の共有シート・Android の Sharesheet）で渡す。使えないブラウザでは画像を保存してリンクをコピーする。共有シートはタップ直後にしか開けないので、画像は先に作っておく。
- SNS へのお知らせは管理画面の「お知らせを作る」で行う（変更内容から文面と画像を作り、共有シートで X・Instagram に投稿。API は使わない）。
- Worker 本体は公開リポジトリ HayatoShimada/business-calendar（汎用版・MIT）。このリポジトリの `cloudflare/business-calendar/` には 85-Store 用の `wrangler.jsonc` と `deploy.sh`（決まったバージョンを `upstream/` に取得してデプロイ）だけを置く。Worker のコードを直すときは business-calendar 側で直してタグを打ち、`deploy.sh` の `VERSION` を上げる。

### 記事本文のレンダリング（`app/blog/[slug]/page.tsx`）

CMS が書き出した本文の HTML（Lexical から変換済み）をサーバーで加工してから `dangerouslySetInnerHTML` で出力する。

1. `lib/content-images.ts` — `<img data-avif data-webp>`（CMS が書き出すサイズ別の srcset）を `<picture>`（AVIF優先・WebP、`loading="lazy"`）に変換
2. `lib/toc.ts` — h2/h3 にIDを付け、目次データを抽出（目次をSSRしてCLSを防ぐ）

### サーバー / クライアントコンポーネント

- 基本はサーバーコンポーネント。記事データ（特に `content`）をクライアントコンポーネントの props に渡さない（RSCペイロードに本文HTMLが載る）。
- 画像の読み込み失敗時の差し替えは `components/FallbackImage.tsx`（小さなクライアントコンポーネント）を使う。
- 日付は `utils/date.ts` の `formatDate()`（Asia/Tokyo固定）で表示し、`<time dateTime>` で囲む。サーバーはUTCなので `toLocaleDateString` を直接使わない。

### 画像

- `next/image` で `fill` を使うときは必ず `sizes` を指定する（未指定だと100vw扱いで過大な画像を取得する）。
- `public/` の写真は長辺1600px程度・EXIF削除済みで置く。
- リモート画像は `next.config.ts` の `images.remotePatterns` に登録されたホストのみ。

### SEO

- 各ページで canonical を `alternates: pageAlternates("/path")`（`lib/metadata.ts`）で指定する。`alternates: { canonical }` と直接書くと、レイアウトの RSS / Atom の案内が消える。タイトルは `app/layout.tsx` のテンプレート（`%s | 85-Store（ハコストア）`）に任せ、ページ側で店名を重ねない。
- 構造化データは `components/StructuredData.tsx`。店舗の事実（住所・電話・支払い方法・価格帯・取り扱い）は `lib/store-info.ts` を唯一の定義元にし、表示・構造化データ・FAQ・llms.txt で同じ値を使う（AI や地図の検索で店の情報が食い違わないように）。
- Google マップへのリンクは Maps URLs（`https://www.google.com/maps/search/?api=1&query=…`）で書く。`maps.app.goo.gl` の短縮リンクはスマホでアプリが開かないことがある。

## デザインシステム「モダングリッド」

白地に1pxの罫線グリッドで面を区切り、写真と大きなロゴタイプ（Archivo 幅125%）で見せる。トークンは `app/globals.css` の `@theme`、共通の部品は同ファイルの `@layer components`。

- **色**: `bg` / `surface`（沈んだ面）/ `ink`（文字）/ `ink-2`（補助テキスト）/ `muted`（日付・キャプション）/ `rule`（罫線）/ `accent`・`accent-2`（アクセント面）/ `footer`
  - **アクセントは面にだけ使い、上の文字は `on-accent` / `on-accent-2`**（ライトではオレンジ×黒、深緑×白）。`orange` のような色名のクラスは使わない（テーマで色が変わるため）
- **表示モード（テーマ）**: ライト / ダーク / 猫（店長スヌーの毛色）。`<html data-theme>` で切り替え、`app/globals.css` の `:root[data-theme='…']` で色トークンだけを上書きする
  - ヘッダーの `ThemeSwitcher` で選び、`localStorage` に保存。未選択ならOSのダークモード設定に従う
  - 最初の描画前に `lib/theme.ts` の `THEME_INIT_SCRIPT`（`<head>` のインラインスクリプト）で反映し、ちらつきを防ぐ
  - 新しい色を足すときは、3テーマすべてでAA（4.5:1）を満たすか確認する
- **書体**: 和文・本文は IBM Plex Sans JP（`font-sans`）、英字・数字・ロゴは Archivo（`font-display`、数字は `.num`）
- **文字サイズ**: `text-xs`〜`text-2xl`、`text-display`（ロゴタイプ）。すべて `clamp()` で画面幅に応じて変わる
- **形**: 角丸なし（営業状況とチップだけピル型）。影・すりガラス（backdrop-filter）は使わない
- **見出し**: セクション見出しは英語（`SectionHeading` の `title`）＋日本語の補足（`description`）
- **部品**: `.wrap`（最大幅と左右余白）、`.section`（セクション間の余白）、`.grid-lines`（罫線グリッド）、`.btn` + `.btn-primary / .btn-secondary / .btn-inverse`、`.chip`、`.status`、`.facts`（見出し/値の罫線リスト）、`.media-frame`、`.article-body`（記事本文）
- **カードの画像は枠いっぱいに**: 一覧カード（`.media-frame`）は枠の比率（記事4:5・Pick Up 4:3 など）に `object-fit: cover` で拡大し、はみ出た部分は切り取る（余白の帯を出さない）。記事本文の画像は比率を崩さず、縦長は高さ72vhまで、連続する縦長写真は2枚並び（`lib/content-images.ts`）
- **アクセシビリティ**: 文字色はすべてAA以上、`:focus-visible` の枠線、`prefers-reduced-motion` で動きを止める、タップ領域は44px以上

### トップページの構成とデータの出どころ

| セクション | データ |
|---|---|
| ヒーローの写真2枚 | CMS の **縦長のバナー**（先頭から2枚）。足りない分は `public/images` の写真 |
| Pick Up | CMS の縦長以外のバナー（`detailButtonUrl` があればリンク） |
| New Arrivals | Shopify Storefront API の新着・在庫ありの商品（`lib/shopify-storefront.ts`） |
| Journal / note / Podcast | CMS の最新記事 / note RSS / Spotify 埋め込み |
| Store | `lib/store-info.ts`（店舗情報の唯一の定義元。住所・地図・駐車場のURL・通常の営業時間）＋ 営業日カレンダー |

配送・返品・利用規約・プライバシーポリシーのページは、オンラインストア（Shopify）のポリシーを Storefront API で取得して表示している（`components/PolicyPage.tsx`）。内容の変更は Shopify 管理画面で行う。

## CMS（`cms/`、Payload）

- 85pi の docker compose で動かす（Payload 3・SQLite。Litestream で R2 の `85store-cms-backup` へ随時バックアップ）。手順は `cms/README.md`、配置は `cms/deploy.sh`。
- 管理画面は `https://cms.85-store.com`。DNS は CMS の端末（tailscale のサイドカー）の tailnet のアドレスを指すので、tailnet の外からは届かない。tailscale serve が 443 番を PROXY プロトコル付きで Caddy に転送し、Caddy が TLS を終端（証明書は Let's Encrypt から Cloudflare の DNS で取る）。Payload のカスタム認証（`cms/src/lib/tailscale-auth.ts`）が、接続元のアドレスを tailscaled に whois で問い合わせ、「メンバー」に登録されたメールだけを通す。Payload と Caddy は 127.0.0.1 でだけ待ち受け、ホストにポートを出さない（接続元を偽装できないようにするため）。
- コレクション（サイト）: `posts`（下書き/公開・Lexical 本文に写真・写真の横並び・埋め込み）、`banners`（並び替え）、`categories`、`media`（R2 に保存、avif/webp の 480〜1600）、`users`（管理者/編集者）。
- コレクション（Shopify）: `products`・`brands`・`productPhotos`、`shopifyCollections`、`storePages`・`storeBlogs`・`storeArticles`・`storeMenus`。
- 公開・更新・削除のたびに `cms/src/publish/` が公開中のデータを JSON にして R2（`85store-media` の `content/`）に書き出し、サイトの `/api/revalidate` を呼ぶ。**サイトは 85pi に直接アクセスしない**（書き出された JSON だけを読む）。書き出す形は `types/cms.ts` と `cms/src/publish/export.ts` で合わせる。
- 本文の HTML は microCMS と同じ構造（`<figure><img width height>`、埋め込みは padding の div + iframe）で出すので、`lib/toc.ts`・`groupPortraitFigures`・`.article-body` の CSS がそのまま使える。
- Event1st / Event2nd のカテゴリは Reserve ページのイベント一覧に使っている（名前を変えない）。
- `cms/` は独立した package.json・tsconfig を持ち、サイトの tsc・eslint の対象外。

### Shopify との同期（`cms/src/shopify/`）

- **正は Shopify**。Payload は入力画面で、画面を開いたときと10分ごとに Shopify から取り込み、保存すると Shopify に送る（Payload Jobs）。前回の同期のあとに Shopify 側でも変わっていたら送らずに止め、どちらを残すか選んでもらう（指紋で比べる）。
- 商品は `sync.ts`（productSet。新しい商品は全販売チャネルに出す）、ストアの内容は `store/`（コレクション・ページ・ブログ・記事・メニューの定義と共通の `engine.ts`）。
- モードは 85pi の `.env` の `SHOPIFY_SYNC_MODE`（商品）・`SHOPIFY_STORE_SYNC_MODE`（ストア）。新しく同期の対象を足したら、dry-run で全件を取り込み、差分ゼロ（`/api/shopify/diff-*`）を確かめてから live にする。
- 商品を送ったら、サイトの `/api/revalidate` に `shopify-products` を送り、New Arrivals を作り直す。
- 本番の DB はマイグレーション（`cms/src/migrations/`）で変える。作り方は `cms/README.md`。
- 説明文の AI 生成は 85crm の内部 API（tailnet 内の `:11443/internal`、`X-Internal-Token`）を呼ぶ。

## プロジェクト固有のルール

- 日本語サイト。UI文言・コンテンツ・ドキュメントは日本語（コードや技術設定に関するものを除く）。
- コメントは日本語で、周囲のコード量に合わせて簡潔に。

## トラブルシューティング

### ローカルで note などへの fetch が `ECONNRESET` / `Network Error` になる

一部のネットワーク環境では、Node 24（OpenSSL 3.5）の耐量子TLS鍵交換（X25519MLKEM768）でClientHelloが大きくなり、CloudFront宛の接続がリセットされる（curlでは再現しない）。Vercel上では発生しない。ローカルでは鍵交換グループを固定するプリロードを使う:

```bash
echo "require('tls').DEFAULT_ECDH_CURVE = 'X25519:P-256:P-384';" > /tmp/tls-fix.cjs
NODE_OPTIONS="--require /tmp/tls-fix.cjs" npm run build
```

## Next.js のドキュメント

Next.js 16 は、学習データとは API・決まりごと・ファイル構成が違うことがある。コードを書く前に `node_modules/next/dist/docs/` の該当するガイドを読み、非推奨の案内に従う。
（`next dev` がこの内容を英語で自動で書き足さないよう、`next.config.ts` で `agentRules: false` にしている）
