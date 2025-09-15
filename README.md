# 85-Store - モダンなセレクトショップサイト

85storeは、Next.js、TypeScript、Tailwind CSSで構築されたセレクトショップのウェブサイトです。
商品管理にShopify、コンテンツ管理にNotionを使用しています。

## 🚀 セットアップ

### 前提条件

- Node.js 18.0以上
- npm または yarn
- Notionアカウント
- Shopifyアカウント（オプション：商品販売機能を使用する場合）

### 1. プロジェクトのクローン

```bash
git clone https://github.com/yourusername/85store.git
cd 85store
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成し、必要な情報を入力してください：

```bash
cp .env.example .env
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
| **Author** | セレクト | 著者名を選択肢から選ぶ | ✅ |
| **Category** | セレクト | カテゴリー（例：Fashion, Lifestyle） | ✅ |
| **Tags** | マルチセレクト | 複数のタグ（例：#新作 #トレンド） |  |
| **Status** | セレクト | 公開状態（**Published**で公開） | ✅ |

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

### プロパティタイプの設定方法

#### セレクトプロパティの作成
1. プロパティ名の右にある「⋮」をクリック
2. 「プロパティを編集」を選択
3. タイプを「セレクト」に変更
4. 選択肢を追加（例：Published, Draft）

#### マルチセレクトプロパティの作成
1. セレクトと同様の手順
2. タイプを「マルチセレクト」に変更
3. 複数選択可能なタグを追加

### NotionデータベースIDの取得方法

1. **データベースページを開く**
2. **URLをコピー**
   ```
   https://www.notion.so/[ワークスペース名]/[データベース名]-[データベースID]
   ```
3. **データベースIDを抽出**
   - URLの最後の32文字がデータベースID
   - 例：`a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

4. **.envファイルに設定**
   ```env
   NOTION_BLOG_DATABASE_ID=あなたのブログデータベースID
   NOTION_PRODUCTS_DATABASE_ID=あなたの商品データベースID
   ```

### Notion APIキーの取得方法

1. [Notion Developers](https://www.notion.so/my-integrations)にアクセス
2. 「New integration」をクリック
3. 名前を入力（例：85store）
4. 作成後、表示される「Internal Integration Token」をコピー
5. `.env`ファイルに設定：
   ```env
   NOTION_API_KEY=あなたのAPIキー
   ```
6. **重要**: データベースにIntegrationを接続
   - データベースページの右上「⋮」→「接続」
   - 作成したIntegration（85store）を選択

## 🔧 Notionの初期設定（初めての方向け）

### Notionアカウントの作成

1. [Notion公式サイト](https://www.notion.so/ja-jp)にアクセス
2. 「Notionを無料で使ってみる」をクリック
3. メールアドレスまたはGoogleアカウントで登録
4. 「個人で利用」を選択

### ワークスペースの作成

1. Notionにログイン後、左サイドバーの「+」ボタンをクリック
2. 「新しいページ」を選択
3. タイトルを「85store データベース」などに設定
4. このページ内にブログと商品のデータベースを作成します

## 🛍️ Shopifyの設定

### Shopifyストアの作成（初めての方向け）

1. [Shopify公式サイト](https://www.shopify.jp/)にアクセス
2. 「無料体験をはじめる」をクリック
3. メールアドレス、ストア名、その他の情報を入力
4. 14日間の無料トライアルが開始されます

### カスタムアプリの作成

1. **Shopify管理画面にログイン**
2. **左側メニューから「設定」をクリック**
3. **「アプリと販売チャネル」を選択**
4. **「アプリを開発」タブをクリック**
5. **「カスタムアプリの開発を許可する」を有効化**
6. **「アプリを作成」をクリック**
   - アプリ名：「85store Frontend」
   - アプリ開発者：あなたのメールアドレス

### Storefront API設定

1. **作成したアプリをクリック**
2. **「設定」タブを選択**
3. **「Storefront API」セクションで「設定」をクリック**
4. **以下のスコープ（権限）にチェック**：
   - `unauthenticated_read_product_listings`（商品一覧の読み取り）
   - `unauthenticated_read_product_inventory`（在庫の読み取り）
   - `unauthenticated_read_product_tags`（商品タグの読み取り）
   - `unauthenticated_write_checkouts`（チェックアウトの作成）
   - `unauthenticated_read_checkouts`（チェックアウトの読み取り）

5. **「保存」をクリック**

### アクセストークンの取得

1. **「APIクレデンシャル」タブに移動**
2. **「アクセストークンをインストール」をクリック**
3. **Storefront APIアクセストークンをコピー**
4. **.envファイルに設定**：
   ```env
   SHOPIFY_STORE_DOMAIN=あなたのストア.myshopify.com
   SHOPIFY_STOREFRONT_ACCESS_TOKEN=コピーしたトークン
   ```

### 商品の登録

1. **Shopify管理画面の「商品管理」をクリック**
2. **「商品を追加する」をクリック**
3. **商品情報を入力**：
   - タイトル：商品名
   - 説明：商品の詳細説明
   - 画像：商品画像をアップロード
   - 価格：販売価格を設定
   - 在庫：在庫数を設定

4. **商品ハンドルの確認**：
   - 商品編集画面の「検索エンジンのリスト」セクション
   - URLハンドルが自動生成されます（例：`awesome-t-shirt`）
   - このハンドルをNotionデータベースの`ShopifyHandle`に入力

### Shopifyとの連携確認

1. **Shopifyで商品を作成**
2. **NotionデータベースにShopifyHandleを含む商品情報を追加**
3. **開発サーバーを再起動**
4. **トップページで商品が表示されることを確認**

## 🖼️ バナー画像の設定

ホームページのヒーローセクションにバナー画像を表示する場合：

1. `public/images/`フォルダを作成
2. `hero-banner.jpg`という名前で画像を配置
3. 推奨サイズ：1920x1080px以上

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

## 📝 トラブルシューティング

### Notionからデータが取得できない場合

1. **APIキーが正しく設定されているか確認**
   - `.env`ファイルの`NOTION_API_KEY`を確認
   - キーの前後に余分なスペースがないか確認

2. **データベースIDが正しいか確認**
   - URLの最後の32文字（ハイフンを除く）を使用
   - 例：`https://notion.so/myworkspace/Database-a1b2c3d4...` → `a1b2c3d4...`

3. **IntegrationがデータベースにアクセスできるようになっているかNotionで確認**
   - データベースページ右上の「⋮」→「接続」→作成したIntegrationが表示されているか

4. **プロパティ名が完全に一致しているか確認**（大文字小文字も区別されます）
   - `Title`（○）vs `title`（×）
   - `ShopifyHandle`（○）vs `Shopify Handle`（×）

5. **ブラウザのコンソールでエラーを確認**
   - F12キーでデベロッパーツールを開く
   - Consoleタブでエラーメッセージを確認

### Shopifyからデータが取得できない場合

1. **ストアドメインが正しいか確認**
   - `your-store.myshopify.com`形式であること
   - `.myshopify.com`を含めること

2. **Storefront APIトークンが正しいか確認**
   - Admin APIトークンではなくStorefront APIトークンを使用

3. **APIスコープが正しく設定されているか確認**
   - 商品読み取り権限が有効になっているか

### よくある質問

**Q: 商品画像がNotionに表示されるが、サイトには表示されない**
A: Notionの画像URLは期限付きです。定期的に更新するか、Shopifyの商品画像を使用してください。

**Q: 「NOTION_API_KEY is not defined」エラーが出る**
A: 
1. `.env`ファイルが存在することを確認
2. `.env.example`ではなく`.env`にキーを設定
3. 開発サーバーを再起動

**Q: ShopifyとNotionの商品情報はどちらが優先される？**
A: 基本情報（名前、価格、説明）はNotionから、在庫情報や実際の購入処理はShopifyから取得されます。

### 開発時の注意点

- 環境変数を変更した場合は、開発サーバーを再起動してください
- Notionのデータは最初のアクセス時にキャッシュされる場合があります
- Shopifyの無料トライアル期間に注意してください（14日間）

## 📄 ライセンス

このプロジェクトはMITライセンスです。
# Auto Deploy Test
