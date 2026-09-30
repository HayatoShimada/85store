# CLAUDE.md

このリポジトリで作業する Claude Code 向けのガイドです。

## プロジェクト概要

富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」の公式サイト（https://85-store.com）。
ブログ・商品・バナーは **microCMS** で管理し、購入は Shopify のオンラインストア（https://shop.85-store.com）へ誘導する。

- Next.js 16（App Router / Turbopack / **Cache Components**）
- React 19 / TypeScript 5
- Tailwind CSS v4（CSSファーストの設定。`tailwind.config.ts` は無い）+ `@tailwindcss/typography`
- microCMS（`microcms-js-sdk`）、note.com RSS、Shopify Storefront API
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
| `/` | トップ（バナー・注目記事・最新記事・note・Podcast・おすすめ商品） |
| `/blog`, `/blog/page/[page]` | ブログ一覧（12件ずつ。`/blog/page/1` は `/blog` へリダイレクト） |
| `/blog/[slug]` | 記事。`slug` フィールドがあればスラッグ、なければ microCMS のコンテンツID。IDでアクセスされスラッグがある場合は 308 リダイレクト |
| `/blog/category/[category]`, `/blog/tag/[tag]` | カテゴリ・タグ別一覧（0件は404） |
| `/sitemap.xml`, `/robots.txt`, `/feed.xml`, `/atom.xml` | `app/sitemap.ts` 等で動的生成 |
| `/about`, `/reserve`, `/upstore`, `/contact`, `/shipping`, `/returns`, `/hakoneko` | 固定ページ |

記事へのリンクは必ず `utils/blog.ts` の `getBlogPostPath(post)` で作る（スラッグ対応のため）。

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
