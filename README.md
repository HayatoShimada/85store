# 85-Store

富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」の公式サイトです。
Next.js 15（App Router）+ TypeScript + Tailwind CSS で構築し、コンテンツ管理に microCMS、商品連携に Shopify を利用しています。

- 本番サイト: https://85-store.com
- オンラインストア: https://shop.85-store.com

## ✨ 主な機能

- 📝 **ブログ**: microCMS で記事を管理（カテゴリ・タグ・注目記事に対応）
- 🛍️ **商品表示**: microCMS の商品データ + Shopify Storefront API による在庫状況の取得とオンラインストアへの導線
- 🖼️ **バナー管理**: トップページのヒーローバナーを microCMS から動的に取得
- ✍️ **note連携**: note.com の記事をトップページに表示
- 🎙️ **Podcast**: Spotify の埋め込みプレイヤー
- 📅 **予約ページ**: Limited Store / 1st Floor(85-Store) / 2nd Floor(85-UpStore) の案内
- 📧 **お問い合わせフォーム**: nodemailer による自動返信・管理者通知
- 📈 **アクセス解析**: Vercel Analytics / Speed Insights
- 🗺️ **SEO**: next-sitemap によるサイトマップ生成、動的OG画像、構造化データ
- 📱 **レスポンシブ / ダークモード対応**

## 🛠️ 技術スタック

| 分類 | 技術 |
|------|------|
| フレームワーク | Next.js 15（App Router / Turbopack） |
| 言語 | TypeScript 5 / React 19 |
| スタイル | Tailwind CSS 3.4（@tailwindcss/typography） |
| CMS | microCMS（microcms-js-sdk） |
| EC連携 | Shopify Storefront API（@shopify/storefront-api-client） |
| メール送信 | nodemailer |
| デプロイ | Vercel |

## 🚀 セットアップ

### 前提条件

- Node.js 18.0 以上
- microCMS アカウント
- Shopify ストア（オプション：商品連携を使う場合）

### 手順

```bash
# 1. クローン
git clone https://github.com/HayatoShimada/85store.git
cd 85store

# 2. 依存関係のインストール
npm install

# 3. 環境変数の設定
cp .env.example .env.local
# .env.local を編集して各値を設定

# 4. 開発サーバーの起動
npm run dev
```

ブラウザで http://localhost:3000 を開いて確認できます。

## 🔑 環境変数

`.env.example` を参照してください。主な変数は以下の通りです。

### 必須

| 変数 | 説明 |
|------|------|
| `MICROCMS_SERVICE_DOMAIN` | microCMS のサービスドメイン（`xxx.microcms.io` の `xxx` 部分） |
| `MICROCMS_API_KEY` | microCMS の API キー |
| `NEXT_PUBLIC_SITE_URL` | サイトURL（本番では `https://85-store.com`） |

### オプション

| 変数 | 説明 |
|------|------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | お問い合わせフォーム用SMTP設定 |
| `CONTACT_EMAIL` | お問い合わせ通知の宛先メールアドレス |
| `SHOPIFY_STORE_DOMAIN` | Shopify ストアドメイン（必ず `*.myshopify.com` を指定） |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Storefront API アクセストークン |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Admin API アクセストークン |
| `NEXT_PUBLIC_SHOPIFY_ONLINE_STORE_DOMAIN` | オンラインストアのカスタムドメイン（商品URL生成に使用） |

## 📊 microCMS のコンテンツモデル

### ブログ（blog）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `title` | テキスト | 記事タイトル |
| `content` | リッチエディタ | 本文（HTML） |
| `eyecatch` | 画像 | アイキャッチ画像 |
| `published` | 真偽値 | 公開フラグ |
| `featured` | 真偽値 | 注目記事フラグ |
| `category` | セレクト（複数） | カテゴリ |
| `tags` | セレクト（複数） | タグ |
| `author` | テキスト | 著者名 |
| `excerpt` / `description` | テキスト | 抜粋・説明文 |

### 商品（product）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `name` | テキスト | 商品名 |
| `shopifyHandle` | テキスト | Shopify 商品ハンドル |
| `category` | セレクト | 商品カテゴリ |
| `price` | 数値 | 価格（円） |
| `images` | 画像（複数） | 商品画像 |
| `description` | テキスト | 商品説明 |
| `featured` | 真偽値 | おすすめ表示フラグ |

### バナー（banner）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `image` | 画像 | バナー画像 |
| `title` / `subtitle` | テキスト | 見出し・サブテキスト |
| `showOnlineShopButton` / `showBlogButton` / `showDetailButton` | 真偽値 | 各ボタンの表示切替 |
| `detailButtonUrl` / `detailButtonText` | テキスト | 詳細ボタンのリンク先・ラベル |
| `order` | 数値 | 表示順 |

## 📁 ディレクトリ構成

```
app/
├── page.tsx           # トップページ（バナー・ブログ・note・Podcast・商品）
├── about/             # ストア紹介
├── blog/              # ブログ一覧・記事詳細・カテゴリ・タグ
├── contact/           # お問い合わせフォーム
├── reserve/           # 予約案内
├── upstore/           # 2nd Floor（85-UpStore）紹介
├── hakoneko/          # ハコネコ（ミニコンテンツ）
├── returns/           # 返品ポリシー
├── shipping/          # 配送について
└── api/
    ├── contact/       # お問い合わせフォーム送信
    └── shopify/       # Shopify 商品情報の取得

components/            # UIコンポーネント
lib/
├── microcms.ts        # microCMS API クライアント・データ取得
├── note.ts            # note.com 記事の取得
└── shopify.ts         # Shopify Storefront API 連携

types/                 # 型定義（microCMS / Shopify）
utils/                 # ユーティリティ
```

## 🧪 開発コマンド

```bash
npm run dev      # 開発サーバー（Turbopack）
npm run build    # 本番ビルド
npm run start    # 本番サーバー
npm run lint     # ESLint
```

## 🛍️ Shopify 連携について

商品ページは microCMS で管理し、`shopifyHandle` を通じて Shopify と紐付けます。

- **在庫状況**: Storefront API から取得して表示
- **購入導線**: サイト内でのチェックアウトは行わず、オンラインストア（`shop.85-store.com`）へリンク
- **APIドメイン**: `SHOPIFY_STORE_DOMAIN` には必ず `*.myshopify.com` ドメインを指定してください（カスタムドメイン不可）

### Storefront API に必要なスコープ

- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_inventory`
- `unauthenticated_read_product_tags`

## 🚀 デプロイ（Vercel）

1. [Vercel](https://vercel.com) で GitHub リポジトリを連携
2. ダッシュボードで環境変数を設定（上記「環境変数」参照）
3. `main` ブランチへの push で自動デプロイ

## 🎨 カスタマイズ

カラーテーマは `tailwind.config.ts` で変更できます。

```ts
colors: {
  primary: '#FF6B35',   // オレンジ
  secondary: '#2C3E50', // チャコールグレー
  navy: '#1E3A5F',      // ネイビー
}
```

## 🔗 関連リンク

- [Next.js ドキュメント](https://nextjs.org/docs)
- [microCMS ドキュメント](https://document.microcms.io/)
- [Shopify Storefront API](https://shopify.dev/api/storefront)
- [Tailwind CSS](https://tailwindcss.com)
