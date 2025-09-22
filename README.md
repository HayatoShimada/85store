# 85-Store - モダンなセレクトショップサイト

85storeは、Next.js 15、TypeScript、Tailwind CSSで構築されたセレクトショップのウェブサイトです。
商品管理にShopify、コンテンツ管理にNotionを活用し、高速で管理しやすいECサイトを実現しています。

## ✨ 主な機能

- 📝 **Notionベースのブログ機能**: リッチテキスト、画像、動画、埋め込みコンテンツに対応
- 🛍️ **Shopify連携**: 在庫管理と決済処理（オプション）
- 📊 **ビューカウント機能**: 記事の閲覧回数を自動追跡・Notion同期
- 🖼️ **画像最適化**: Next.js Image コンポーネントによる自動最適化
- 🔄 **期限切れ画像の自動更新**: Notion画像URLの期限切れを検知して自動更新
- 📱 **レスポンシブデザイン**: モバイル、タブレット、デスクトップに完全対応
- 🎨 **ダークモード対応**: システム設定に応じた自動切り替え
- 📧 **お問い合わせフォーム**: 自動返信メール機能付き

## 🚀 セットアップ

### 前提条件

- Node.js 18.0以上
- npm または yarn
- Notionアカウント
- Shopifyアカウント（オプション：商品販売機能を使用する場合）

### 1. プロジェクトのクローン

```bash
git clone https://github.com/HayatoShimada/85store.git
cd 85store
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env.local`ファイルを作成し、必要な情報を入力してください：

```bash
cp .env.example .env.local
```

以下の環境変数を設定：

```env
# Notion API
NOTION_API_KEY=your_notion_api_key_here
NOTION_BLOG_DATABASE_ID=your_notion_blog_database_id_here
NOTION_PRODUCTS_DATABASE_ID=your_notion_products_database_id_here

# Shopify API（オプション）
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_shopify_storefront_access_token_here

# Next.js
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# SMTP設定（メール送信機能を使用する場合）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_specific_password

# 管理者メールアドレス
ADMIN_EMAIL=admin@example.com
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてサイトを確認できます。

## 📊 Notionデータベースの設定

### ブログ記事用データベースの作成

1. **Notionで新しいデータベースを作成**
   - Notionを開き、新しいページを作成
   - 「Table」または「データベース」を選択

2. **以下のプロパティ（列）を追加**

| プロパティ名 | プロパティタイプ | 説明 | 必須 |
|------------|--------------|------|------|
| **Title** | タイトル | ブログ記事のタイトル | ✅ |
| **Slug** | テキスト | URL用の識別子（例：`my-first-blog`） | ✅ |
| **Excerpt** | テキスト | 記事の抜粋・要約（150文字程度） | ✅ |
| **Date** | 日付 | 公開日 | ✅ |
| **Author** | マルチセレクト | 著者名（複数可） | ✅ |
| **Category** | マルチセレクト | カテゴリー（例：Fashion, Lifestyle） | ✅ |
| **Tags** | マルチセレクト | 複数のタグ（例：新作, トレンド） |  |
| **Status** | マルチセレクト | 公開状態（**Published**で公開） | ✅ |
| **Views** | 数値 | ページビュー数（自動更新） |  |

3. **カバー画像の設定**
   - 各記事ページの上部にカバー画像を追加できます
   - これがブログ一覧でのサムネイル画像になります

### 商品管理用データベースの作成

1. **Notionで新しいデータベースを作成**

2. **以下のプロパティ（列）を追加**

| プロパティ名 | プロパティタイプ | 説明 | 必須 |
|------------|--------------|------|------|
| **Name** | タイトル | 商品名 | ✅ |
| **ShopifyHandle** | テキスト | Shopifyの商品ハンドル（URL識別子） | ✅ |
| **Category** | セレクト | 商品カテゴリー（例：Tops, Bottoms） | ✅ |
| **Price** | 数値 | 商品価格（円） | ✅ |
| **Images** | ファイル | 商品画像（複数可） | ✅ |
| **Description** | テキスト | 商品説明文 | ✅ |
| **Featured** | チェックボックス | ピックアップ商品として表示する場合はチェック |  |
| **Status** | セレクト | 公開状態（**Active**で公開） | ✅ |

### Notionブロックのサポート状況

本システムは以下のNotionブロックタイプに対応しています：

| ブロックタイプ | サポート状況 | 説明 |
|--------------|------------|------|
| **テキスト系** |  |  |
| 段落 | ✅ | 通常のテキスト |
| 見出し1-3 | ✅ | H1, H2, H3タグ |
| 番号付きリスト | ✅ | ネストにも対応 |
| 箇条書きリスト | ✅ | ネストにも対応 |
| チェックリスト | ✅ | チェックボックス付きリスト |
| トグルリスト | ✅ | 折り畳み可能なコンテンツ |
| 引用 | ✅ | 引用ブロック |
| コールアウト | ✅ | アイコン付き強調ブロック |
| **メディア系** |  |  |
| 画像 | ✅ | 自動最適化、期限切れ対応 |
| 動画 | ✅ | 外部動画の埋め込み |
| 音声 | ✅ | 音声ファイルの埋め込み |
| ファイル | ✅ | ダウンロードリンク |
| **埋め込み系** |  |  |
| ブックマーク | ✅ | URLプレビューカード |
| リンクプレビュー | ✅ | GitHub等のリッチプレビュー |
| 埋め込み | ✅ | YouTube, Twitter等の埋め込み |
| **コード系** |  |  |
| コード | ✅ | シンタックスハイライト対応 |
| **その他** |  |  |
| 区切り線 | ✅ | 水平線 |
| 目次 | ✅ | 自動生成される目次 |
| 列（カラム） | ✅ | 複数列レイアウト |

### NotionデータベースIDの取得方法

1. **データベースページを開く**
2. **URLをコピー**
   ```
   https://www.notion.so/[ワークスペース名]/[データベース名]-[データベースID]
   ```
3. **データベースIDを抽出**
   - URLの最後の32文字がデータベースID
   - 例：`a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

4. **.env.localファイルに設定**
   ```env
   NOTION_BLOG_DATABASE_ID=あなたのブログデータベースID
   NOTION_PRODUCTS_DATABASE_ID=あなたの商品データベースID
   ```

### Notion APIキーの取得方法

1. [Notion Developers](https://www.notion.so/my-integrations)にアクセス
2. 「New integration」をクリック
3. 名前を入力（例：85store）
4. 作成後、表示される「Internal Integration Token」をコピー
5. `.env.local`ファイルに設定：
   ```env
   NOTION_API_KEY=あなたのAPIキー
   ```
6. **重要**: データベースにIntegrationを接続
   - データベースページの右上「⋮」→「接続」
   - 作成したIntegration（85store）を選択

## 🖼️ 画像管理

### Notion画像の自動更新機能

NotionのS3画像URLには有効期限があります。本システムは以下の機能で対応しています：

1. **期限切れ検知**: 画像URLの有効期限を自動チェック
2. **自動更新**: 期限切れの場合、Notion APIから新しいURLを取得
3. **プロキシ経由配信**: `/api/image-proxy`経由で画像を配信
4. **キャッシュ機能**: 更新されたURLを一定期間キャッシュ

### バナー画像の設定

ホームページのヒーローセクションにバナー画像を表示する場合：

1. `public/images/`フォルダを作成
2. `hero-banner.jpg`という名前で画像を配置
3. 推奨サイズ：1920x1080px以上

### プレースホルダー画像

カバー画像が設定されていない記事には自動的にプレースホルダー画像が表示されます：
- ファイル: `public/images/placeholder.svg`
- カスタマイズ可能

## 📈 アナリティクス機能

### ビューカウント機能

各ブログ記事の閲覧回数を自動的に追跡します：

1. **自動カウント**: ページ訪問時に自動的にビュー数をインクリメント
2. **リアルタイム更新**: Notion データベースの Views プロパティを更新
3. **表示場所**:
   - ブログ記事ページ（記事メタ情報エリア）
   - ブログ一覧ページ（各カードに表示）
4. **重複防止**: 同一セッション内での重複カウントを防止

### APIエンドポイント

- `POST /api/views/[slug]`: ビューカウントを更新
- `GET /api/views/[slug]`: 現在のビューカウントを取得

## 📧 お問い合わせフォームの設定

### メール送信機能の設定

お問い合わせフォームからメールを送信するには、SMTP設定が必要です。

#### Gmailを使用する場合

1. **2段階認証を有効化**
   - Googleアカウントの設定 → セキュリティ
   - 2段階認証を有効にする

2. **アプリパスワードを生成**
   - セキュリティ → 2段階認証 → アプリパスワード
   - 「メール」と「その他（カスタム名）」を選択
   - 生成されたパスワードをコピー

3. **.env.localに設定**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=生成されたアプリパスワード
   ADMIN_EMAIL=admin@example.com
   ```

#### その他のメールサービス

各メールサービスのSMTP設定を参照して、適切な値を設定してください。

### 機能の詳細

- **自動返信**: お問い合わせ送信者に確認メールを自動送信
- **管理者通知**: 設定された管理者メールアドレスに通知
- **バリデーション**: 必須項目とメールアドレス形式をチェック
- **エラーハンドリング**: 送信失敗時の適切なエラーメッセージ表示

## 🛍️ Shopifyの設定

### Shopifyストアの作成

1. [Shopify公式サイト](https://www.shopify.jp/)にアクセス
2. 「無料体験をはじめる」をクリック
3. メールアドレス、ストア名、その他の情報を入力
4. 14日間の無料トライアルが開始されます

### Storefront API設定

1. **Shopify管理画面にログイン**
2. **「設定」→「アプリと販売チャネル」を選択**
3. **「アプリを開発」→「アプリを作成」**
4. **Storefront APIのスコープを設定**：
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_product_tags`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`

5. **アクセストークンをコピーして.env.localに設定**

## 🎨 カスタマイズ

### カラーテーマ

`tailwind.config.ts`でカラーを変更できます：

```javascript
colors: {
  primary: '#FF6B35',     // オレンジ
  secondary: '#2C3E50',   // チャコールグレー
  navy: '#1E3A5F',        // ネイビー
}
```

### レスポンシブデザイン

すべてのコンポーネントは以下のブレークポイントに対応：
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🚀 デプロイ

### Vercel へのデプロイ

1. [Vercel](https://vercel.com)にサインアップ
2. GitHubリポジトリを連携
3. 環境変数を設定
4. デプロイ

### 環境変数の設定

Vercelのダッシュボードで以下の環境変数を設定：
- `NOTION_API_KEY`
- `NOTION_BLOG_DATABASE_ID`
- `NOTION_PRODUCTS_DATABASE_ID`
- `SHOPIFY_STORE_DOMAIN`（オプション）
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`（オプション）
- `NEXT_PUBLIC_SITE_URL`（本番環境のURL）

## 📝 トラブルシューティング

### よくある問題と解決方法

#### Notionからデータが取得できない

1. **APIキーの確認**
   - `.env.local`の`NOTION_API_KEY`を確認
   - キーの前後に余分なスペースがないか確認

2. **データベースIDの確認**
   - URLから正しくIDを抽出しているか
   - ハイフンを除く32文字を使用

3. **Integrationの接続確認**
   - データベースにIntegrationが接続されているか
   - データベース右上の「⋮」→「接続」で確認

4. **プロパティ名の確認**
   - プロパティ名が完全一致しているか（大文字小文字も区別）
   - スペースの有無も確認

#### 画像が表示されない

1. **画像URLの期限切れ**
   - 自動更新機能が動作しているか確認
   - ブラウザコンソールでエラーを確認

2. **next.config.tsの設定**
   - 画像ドメインが正しく設定されているか

3. **プレースホルダー画像**
   - `/public/images/placeholder.svg`が存在するか確認

#### ビューカウントが更新されない

1. **Viewsプロパティの確認**
   - Notionデータベースに数値型の「Views」プロパティが存在するか

2. **APIエンドポイントの確認**
   - ブラウザのネットワークタブで`/api/views/[slug]`へのリクエストを確認

3. **権限の確認**
   - Notion IntegrationにUpdate権限があるか

### 開発のヒント

- **キャッシュのクリア**: `npm run build`前に`.next`フォルダを削除
- **型チェック**: `npm run type-check`で型エラーを確認
- **リンター**: `npm run lint`でコードスタイルをチェック
- **画像最適化**: 画像は可能な限りWebP形式を使用

## 🧪 開発コマンド

### 利用可能なスクリプト

```bash
# 開発サーバーの起動（Turbopack使用）
npm run dev

# 本番用ビルド（画像ダウンロードを含む）
npm run build

# 本番サーバーの起動
npm run start

# リンター実行
npm run lint

# Notion画像のダウンロード
npm run download-images
```

### ビルド前の画像処理

ビルドコマンド (`npm run build`) は自動的に以下を実行します：
1. `download-images` スクリプトでNotion画像をローカルにダウンロード
2. Next.jsアプリケーションのビルド

これにより、Notion画像の期限切れ問題を事前に回避できます。

## 📦 主な依存パッケージ

- **Framework**: Next.js 15.5
- **言語**: TypeScript 5
- **スタイル**: Tailwind CSS 3.4
- **Notion API**: @notionhq/client
- **Shopify**: @shopify/hydrogen-react
- **画像処理**: sharp
- **データフェッチ**: SWR
- **アイコン**: lucide-react

## 🤝 コントリビューション

プルリクエストは歓迎します。大きな変更の場合は、まずissueを開いて変更内容を説明してください。

## 📄 ライセンス

このプロジェクトはMITライセンスです。

## 🔗 関連リンク

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Notion API ドキュメント](https://developers.notion.com)
- [Shopify Storefront API](https://shopify.dev/api/storefront)
- [Tailwind CSS](https://tailwindcss.com)