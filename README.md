# 85-Store

富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」の公式サイトです。
Next.js 16（App Router / Cache Components）+ TypeScript + Tailwind CSS v4 で構築し、コンテンツ管理に自前の CMS（Payload、85pi で運用）、商品連携に Shopify を利用しています。

- 本番サイト: https://85-store.com
- オンラインストア: https://shop.85-store.com

## ✨ 主な機能

- 📝 **ブログ**: CMS（Payload、[85store-cms](https://github.com/HayatoShimada/85store-cms)）で記事を管理（カテゴリ・タグ・注目記事・下書き・写真の横並び・埋め込み）。スタッフも Tailscale のアカウントで書ける
- ⚡ **キャッシュと即時反映**: `use cache` でキャッシュし、CMS の公開通知で更新されたデータだけを再検証
- 🖼️ **バナー管理**: トップページのヒーロー・Pick Up のバナーを CMS で並び替え
- ✍️ **note連携**: note.com の記事をトップページに表示
- 🎙️ **Podcast**: Spotify の埋め込みプレイヤー
- 📅 **予約ページ**: Limited Store / 1st Floor(85-Store) / 2nd Floor(85-UpStore) の案内
- 🗓️ **営業日カレンダー**: Cloudflare Worker の管理画面（Tailscale 内の管理者だけがログイン可能）で休業日・営業時間を設定し、サイトに即反映（Worker は [business-calendar](https://github.com/HayatoShimada/business-calendar) として公開。設定は `cloudflare/business-calendar/`）
- 📧 **お問い合わせフォーム**: nodemailer による自動返信・管理者通知
- 📈 **アクセス解析**: Vercel Analytics / Speed Insights
- 🗺️ **SEO**: `app/sitemap.ts` / `app/robots.ts` によるサイトマップ・robots.txt 生成、RSS/Atom フィード、構造化データ
- 📱 **レスポンシブ対応**

## 🛠️ 技術スタック

| 分類 | 技術 |
|------|------|
| フレームワーク | Next.js 16（App Router / Turbopack / Cache Components） |
| 言語 | TypeScript 5 / React 19.3 |
| スタイル | Tailwind CSS v4 |
| CMS | Payload 3（別リポジトリ [85store-cms](https://github.com/HayatoShimada/85store-cms)、85pi の docker compose・SQLite）。画像と書き出しは Cloudflare R2 |
| EC連携 | Shopify Storefront API（@shopify/storefront-api-client） |
| メール送信 | nodemailer |
| デプロイ | Vercel |

## 🚀 セットアップ

### 前提条件

- Node.js 20.9 以上
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
| `CMS_WEBHOOK_SECRET` | CMS からの更新通知の署名検証用（CMS の `.env` と同じ値） |
| `NEXT_PUBLIC_SITE_URL` | サイトURL（本番では `https://85-store.com`） |

### オプション

| 変数 | 説明 |
|------|------|
| `CMS_CONTENT_URL` | CMS が書き出した JSON の場所（既定は `https://media.85-store.com/content`） |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | お問い合わせフォーム用SMTP設定 |
| `CONTACT_EMAIL` | お問い合わせ通知の宛先メールアドレス |
| `SHOPIFY_STORE_DOMAIN` | Shopify ストアドメイン（必ず `*.myshopify.com` を指定） |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Storefront API アクセストークン |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Admin API アクセストークン |
| `NEXT_PUBLIC_SHOPIFY_ONLINE_STORE_DOMAIN` | オンラインストアのカスタムドメイン（商品URL生成に使用） |

## 📊 CMS（85store-cms）

記事・バナーは 85pi で動かす Payload CMS で管理します。管理画面は `https://cms.85-store.com`（tailnet 内からのみ）。コードは別リポジトリ [HayatoShimada/85store-cms](https://github.com/HayatoShimada/85store-cms) にあり、セットアップ・メンバーの追加・バックアップはそちらの README を参照してください。

| コレクション | 主な項目 |
|---|---|
| 記事（posts） | タイトル・本文（写真・写真の横並び・埋め込み）・アイキャッチ・説明文・スラッグ・公開日・カテゴリ・タグ・注目の記事・下書き/公開 |
| バナー（banners） | 画像・タイトル・サブタイトル・リンク先（ドラッグで並び替え） |
| カテゴリ（categories） | 名前（URL にも使う） |
| 画像（media） | R2 に保存し、avif / webp の各サイズを作る |
| メンバー（users） | Tailscale のメールアドレス・権限（管理者 / 編集者） |

公開するたびに、CMS が公開中の記事・バナーを JSON にして R2（`media.85-store.com/content/`）に書き出し、サイトの `/api/revalidate` を呼びます。サイトはこの JSON だけを読むので、85pi が止まっていても表示とビルドは影響を受けません。

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
├── sitemap.ts / robots.ts / feed.xml / atom.xml  # SEO・フィード
└── api/
    ├── contact/       # お問い合わせフォーム送信
    ├── revalidate/    # CMS の公開通知によるキャッシュ再検証
    └── shopify/       # Shopify 商品情報の取得

components/            # UIコンポーネント
lib/
├── cms.ts             # CMS が R2 に書き出した記事・バナーの取得（use cache）
├── note.ts            # note.com 記事の取得
├── content-images.ts  # 記事本文の画像最適化
├── toc.ts             # 目次の生成
├── feed.ts            # RSS / Atom フィード
└── shopify.ts         # Shopify Storefront API 連携

types/                 # 型定義（CMS / Shopify）
utils/                 # ユーティリティ
```

## 🧪 開発コマンド

```bash
npm run dev      # 開発サーバー（Turbopack）
npm run build    # 本番ビルド
npm run start    # 本番サーバー
npx eslint .     # ESLint
```

## 🛍️ Shopify 連携について

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

### 更新の反映（CMS の公開通知）

記事・バナーを公開・更新すると、CMS が R2 に書き出したあと `https://85-store.com/api/revalidate` を呼び、該当データのキャッシュだけを破棄します（再ビルド不要）。署名は `x-cms-signature`（HMAC-SHA256）で、Vercel と CMS の両方に同じ `CMS_WEBHOOK_SECRET` を設定します。

## 🎨 デザイン

デザインシステム「モダングリッド」（白地の罫線グリッド、墨・オレンジ・深緑）。トークンと共通部品は `app/globals.css` にあり、使い方は `CLAUDE.md` の「デザインシステム」にまとめています。

- **トップのヒーロー写真**: CMS のバナーのうち、縦長の画像が先頭から2枚使われます。横長・正方形のバナーは「Pick Up」に並びます。
- **新着アイテム**: Shopify の新着・在庫ありの商品が自動で表示されます。
- **配送・返品・利用規約・プライバシーポリシー**: Shopify 管理画面のポリシーがそのまま表示されます。
- **店舗情報**（営業時間・住所・地図・駐車場）: `lib/store-info.ts` で一元管理しています。

## 🔗 関連リンク

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Payload ドキュメント](https://payloadcms.com/docs)
- [Shopify Storefront API](https://shopify.dev/api/storefront)
- [Tailwind CSS](https://tailwindcss.com)
