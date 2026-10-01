# CLAUDE.md

このリポジトリで作業する Claude Code 向けのガイドです。

## プロジェクト概要

富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」の公式サイト（https://85-store.com）。
ブログ・商品・バナーは **microCMS** で管理し、購入は Shopify のオンラインストア（https://shop.85-store.com）へ誘導する。

- Next.js 16（App Router / Turbopack / **Cache Components**）
- React 19 / TypeScript 5
- Tailwind CSS v4（CSSファーストの設定。`tailwind.config.ts` は無い）
- microCMS（`microcms-js-sdk`）、note.com RSS、Shopify Storefront API（新着商品・ポリシー）
- Vercel にデプロイ

## コマンド

```bash
npm run dev      # 開発サーバー（Turbopack）
npm run build    # 本番ビルド
npm run start    # 本番サーバー
npx eslint .     # Lint（next lint は Next 16 で廃止）
npx tsc --noEmit # 型チェック
```

環境変数は `.env.local`（`.env.example` 参照）。microCMS の値が無くてもビルドは通る（記事0件として扱う）。

## アーキテクチャ

### データ取得とキャッシュ（`lib/microcms.ts` / `lib/note.ts`）

- `next.config.ts` で `cacheComponents: true`。データ取得は `"use cache"` + `cacheTag` + `cacheLife` でキャッシュする。
- microCMS はエンドポイント名をタグにする（`blogs` / `products` / `banners`）。`cacheLife("days")` はWebhookが届かなかったときの保険。
- **microCMS のAPIエラーは握りつぶさない。** 空配列や404をキャッシュすると数日間壊れたページが残るため。ビルド失敗なら直前のデプロイが残り、再生成失敗なら古いページが配信され続ける。
- note は補助コンテンツなので、失敗時は空配列を `cacheLife("minutes")` で短くキャッシュして止めない。
- 新しい取得関数を足すときは、キャッシュ層（`cachedGetList` / `cachedGet`）を経由させる。

### 更新の反映（`app/api/revalidate/route.ts`）

microCMS の Webhook（カスタム通知）が `POST /api/revalidate` を呼び、署名（`x-microcms-signature`、HMAC-SHA256、`MICROCMS_WEBHOOK_SECRET`）を検証して `revalidateTag(api, { expire: 0 })` する。記事の公開・更新で全体を再ビルドする必要はない。

### Cache Components の注意点

- `export const runtime = 'edge'` と route segment の `export const revalidate` は使えない（キャッシュ期間は `cacheLife` で指定）。
- `generateStaticParams` は空配列だとビルドエラーになる。`utils/static-params.ts` の `nonEmptyParams()` を使う（0件ならダミー値を返し、ページ側で `notFound()`）。
- `generateStaticParams` は**エンコードしていない生の値**を返す。エンコードすると二重エンコードになり、日本語のカテゴリ等が404になる。ページで受け取る `params` は日本語がエンコードされて届くので `decodeURIComponent` する。
- `new Date()` など実行ごとに変わる値は `"use cache"` の中で使う（例: `lib/feed.ts`）。
- `'use cache'` の中で投げた例外は、呼び出し側で catch してもビルドを失敗させる。握りつぶしたいときはキャッシュ関数の中で catch する。

### ルーティング

| パス | 内容 |
|---|---|
| `/` | トップ（ヒーロー・Pick Up・新着商品・最新記事・note・Podcast・店舗情報） |
| `/blog`, `/blog/page/[page]` | ブログ一覧（12件ずつ。`/blog/page/1` は `/blog` へリダイレクト） |
| `/blog/[slug]` | 記事。`slug` フィールドがあればスラッグ、なければ microCMS のコンテンツID。IDでアクセスされスラッグがある場合は 308 リダイレクト |
| `/blog/category/[category]`, `/blog/tag/[tag]` | カテゴリ・タグ別一覧（0件は404） |
| `/sitemap.xml`, `/robots.txt`, `/feed.xml`, `/atom.xml` | `app/sitemap.ts` 等で動的生成 |
| `/about`, `/reserve`, `/upstore`, `/contact`, `/hakoneko` | 固定ページ（hakoneko は独自デザインのゲーム紹介ページ） |
| `/shipping`, `/returns`, `/terms`, `/privacy` | Shopify のポリシーを表示 |

記事へのリンクは必ず `utils/blog.ts` の `getBlogPostPath(post)` で作る（スラッグ対応のため）。

### 営業日カレンダー（[business-calendar](https://github.com/HayatoShimada/business-calendar)・`lib/business-calendar.ts`）

- 休業日・その日だけの営業時間・通常の営業時間は、Cloudflare Worker の管理画面（`calendar-admin.85-store.com`）で入力し、D1 に保存する。
- 管理画面は Cloudflare Access で保護し、ログイン方法は 85pi で動かす **tsidp**（Tailscale の ID で入る OIDC）だけ。tsidp は tailnet 外からのログインを拒否するので、tailnet 内の info@85-store.com だけが使える。Worker 側でも Access の JWT とメールを検証する。
- サイトはブラウザから公開API（`https://calendar.85-store.com/v1/calendar`、`NEXT_PUBLIC_CALENDAR_API_URL` で変更可）を直接読む（`components/useBusinessCalendar.ts`）。**再デプロイ・キャッシュの再検証なしで即反映**される（表示時・60秒ごと・タブ復帰時）。
- 判定ロジックは `lib/business-calendar.ts`（`resolveDay` / `getStatusAt`、日本時間）。APIが使えないときは `STORE.hours`（通常ルール）で表示する。
- 「営業中」表示は `components/StoreStatus.tsx`、カレンダーは `components/BusinessCalendar.tsx`（トップの店舗情報・About・Reserve）。時刻に依存する表示はブラウザでだけ描く（`useNow`）。
- カレンダーの「共有」ボタンは `components/ShareCalendarButton.tsx`。画像は Worker が配信する `calendar-image.js`（canvas で描く ES モジュール）をブラウザで読み込んで作り、Web Share API（iOS の共有シート・Android の Sharesheet）で渡す。使えないブラウザでは画像を保存してリンクをコピーする。共有シートはタップ直後にしか開けないので、画像は先に作っておく。
- SNS へのお知らせは管理画面の「お知らせを作る」で行う（変更内容から文面と画像を作り、共有シートで X・Instagram に投稿。API は使わない）。
- Worker 本体は公開リポジトリ HayatoShimada/business-calendar（汎用版・MIT）。このリポジトリの `cloudflare/business-calendar/` には 85-Store 用の `wrangler.jsonc` と `deploy.sh`（決まったバージョンを `upstream/` に取得してデプロイ）だけを置く。Worker のコードを直すときは business-calendar 側で直してタグを打ち、`deploy.sh` の `VERSION` を上げる。

### 記事本文のレンダリング（`app/blog/[slug]/page.tsx`）

microCMS のリッチエディタHTMLをサーバーで加工してから `dangerouslySetInnerHTML` で出力する。

1. `lib/content-images.ts` — microCMS画像を `<picture>`（AVIF優先・WebP、srcset、`loading="lazy"`）に変換
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

- 各ページで `alternates.canonical` を指定する。タイトルは `app/layout.tsx` のテンプレート（`%s | 85-Store（ハコストア）`）に任せ、ページ側で店名を重ねない。
- 構造化データは `components/StructuredData.tsx`。

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
- **画像の比率は崩さない**: 一覧カードは4:5の枠（`.media-frame`）に `object-fit: contain` で収め、縦長は幅を狭めて中央に置く。記事本文の縦長画像は高さ72vhまで、連続する縦長写真は2枚並び（`lib/content-images.ts`）
- **アクセシビリティ**: 文字色はすべてAA以上、`:focus-visible` の枠線、`prefers-reduced-motion` で動きを止める、タップ領域は44px以上

### トップページの構成とデータの出どころ

| セクション | データ |
|---|---|
| ヒーローの写真2枚 | microCMS の **縦長のバナー**（先頭から2枚）。足りない分は `public/images` の写真 |
| Pick Up | microCMS の縦長以外のバナー（`detailButtonUrl` があればリンク） |
| New Arrivals | Shopify Storefront API の新着・在庫ありの商品（`lib/shopify-storefront.ts`） |
| Journal / note / Podcast | microCMS の最新記事 / note RSS / Spotify 埋め込み |
| Store | `lib/store-info.ts`（店舗情報の唯一の定義元。住所・地図・駐車場のURL・通常の営業時間）＋ 営業日カレンダー |

配送・返品・利用規約・プライバシーポリシーのページは、オンラインストア（Shopify）のポリシーを Storefront API で取得して表示している（`components/PolicyPage.tsx`）。内容の変更は Shopify 管理画面で行う。

## microCMS のコンテンツモデル

- **blogs**: `title`, `slug`（任意。半角英数とハイフン推奨）, `content`（リッチエディタ）, `eyecatch`, `featured`, `category`（複数）, `tags`（複数）, `author`, `excerpt`, `description`
- **products**: `name`, `shopifyHandle`, `category`, `price`, `images`, `description`, `featured`
- **banners**: `image`, `title`, `subtitle`, `show*Button`, `detailButtonUrl`, `detailButtonText`, `order`

型は `types/microcms.ts`。

## プロジェクト固有のルール

- 日本語サイト。UI文言・コンテンツ・ドキュメントは日本語（コードや技術設定に関するものを除く）。
- コメントは日本語で、周囲のコード量に合わせて簡潔に。

## トラブルシューティング

### ローカルで microCMS / note への fetch が `ECONNRESET` / `Network Error` になる

一部のネットワーク環境では、Node 24（OpenSSL 3.5）の耐量子TLS鍵交換（X25519MLKEM768）でClientHelloが大きくなり、CloudFront宛の接続がリセットされる（curlでは再現しない）。Vercel上では発生しない。ローカルでは鍵交換グループを固定するプリロードを使う:

```bash
echo "require('tls').DEFAULT_ECDH_CURVE = 'X25519:P-256:P-384';" > /tmp/tls-fix.cjs
NODE_OPTIONS="--require /tmp/tls-fix.cjs" npm run build
```
