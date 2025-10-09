# Shopify商品統合ガイド

このドキュメントでは、85-StoreにおけるShopify商品の表示機能の使用方法を説明します。

## 概要

このシステムでは、以下の2つの方法でShopify商品を表示できます：

1. **ホームページのおすすめ商品セクション** - Notionで「Featured」にチェックした商品を最大6個表示
2. **Blog記事内の商品埋め込み** - 記事内の任意の場所に個別の商品を表示

## 機能

- ✅ Shopifyオンラインストア（shop.85-store.com）へのリンク
- ✅ 在庫状態の自動表示（在庫なしの場合は「在庫なし」バッジを表示）
- ✅ レスポンシブデザイン（モバイル・タブレット・デスクトップ対応）
- ✅ ダークモード対応
- ✅ Blog記事内に複数商品を任意の場所に埋め込み可能

---

## 1. ホームページのおすすめ商品セクション

### 設定方法

#### ステップ1: Notion商品データベースの設定

Notionの商品データベースで、おすすめとして表示したい商品の **Featured** チェックボックスにチェックを入れます。

必要なプロパティ：
- `Name` (タイトル) - 商品名
- `ShopifyHandle` (テキスト) - Shopifyの商品ハンドル（例：`mens-cotton-shirt`）
- `Category` (セレクト) - 商品カテゴリー
- `Price` (数値) - 価格（円）
- `Images` (ファイル) - 商品画像
- `Description` (テキスト) - 商品説明
- `Featured` (チェックボックス) - ✅ チェックを入れるとホームページに表示
- `Status` (セレクト) - "Active" にする

#### ステップ2: Shopify商品ハンドルの確認

Shopifyの商品ハンドルは、商品のURLから取得できます。

例：
- 商品URL: `https://shop.85-store.com/products/mens-cotton-shirt`
- ハンドル: `mens-cotton-shirt`

#### ステップ3: 自動表示

ホームページにアクセスすると、Featured商品が自動的に「おすすめ商品」セクションに表示されます。

- 最大6商品まで表示
- 最新順に表示
- 在庫状態を自動チェック

---

## 2. Blog記事内での商品埋め込み

### 使用方法

Blog記事内で商品を紹介したい場合、Notionのcalloutブロックを使用します。

#### ステップ1: Calloutブロックの作成

1. Notion記事内で `/callout` と入力してcalloutブロックを作成
2. アイコンを 🛍️（ショッピングバッグ）または 🛒（ショッピングカート）に変更
3. テキスト部分にShopify商品ハンドルを入力

#### 例

```
🛍️ mens-cotton-shirt
```

または

```
🛒 ladies-summer-dress
```

#### ステップ2: 記事を公開

記事をPublishedにすると、calloutブロックが美しい商品カードとして表示されます。

### 表示される情報

- 商品画像
- 商品名
- 価格（自動フォーマット）
- 商品説明
- 在庫状態（在庫なしの場合は自動表示）
- 「オンラインストアで見る」ボタン（shop.85-store.comへのリンク）

### 複数商品の埋め込み

1つの記事内に複数の商品を埋め込むことができます。

```markdown
## スタイリング例

今回のコーディネートで使用したアイテムをご紹介します。

🛍️ mens-cotton-shirt

このシャツは通気性が良く、夏にぴったりです。

🛍️ mens-denim-pants

シャツと合わせやすいデニムパンツです。

🛍️ leather-sneakers

足元はレザースニーカーでカジュアルに。
```

---

## 技術仕様

### コンポーネント構成

1. **ShopifyProductCard** (`/components/ShopifyProductCard.tsx`)
   - ホームページのおすすめ商品カード
   - Notionの商品データを表示
   - shop.85-store.comへのリンク

2. **FeaturedProducts** (`/components/FeaturedProducts.tsx`)
   - ホームページのおすすめ商品セクション
   - Featured商品を最大6個表示

3. **ShopifyProductEmbed** (`/components/ShopifyProductEmbed.tsx`)
   - Blog記事内の商品埋め込みコンポーネント
   - Shopify APIから商品情報を取得
   - リアルタイムで在庫状態を確認

### API エンドポイント

**GET** `/api/shopify/product/[handle]`

商品ハンドルから商品情報を取得します。

レスポンス例：
```json
{
  "title": "メンズコットンシャツ",
  "description": "高品質なコットン100%のシャツ",
  "price": "¥4,980",
  "imageUrl": "https://cdn.shopify.com/...",
  "availableForSale": true
}
```

キャッシュ: 5分間（300秒）

### Shopify API 関数

#### `getProductUrl(handle: string): string`
商品ハンドルからオンラインストアのURLを生成します。

```typescript
const url = getProductUrl("mens-cotton-shirt");
// => "https://shop.85-store.com/products/mens-cotton-shirt"
```

#### `getProductAvailability(handle: string): Promise<{...}>`
商品の在庫状態を取得します。

```typescript
const availability = await getProductAvailability("mens-cotton-shirt");
// => { availableForSale: true, totalInventory: 10 }
```

---

## トラブルシューティング

### 商品が表示されない

1. **Notion側の確認**
   - `Status` が "Active" になっているか
   - `Featured` にチェックが入っているか（ホームページの場合）
   - `ShopifyHandle` が正しく入力されているか

2. **Shopify側の確認**
   - 商品がShopifyで公開されているか
   - 商品ハンドルが正しいか（大文字小文字、ハイフンに注意）

3. **環境変数の確認**
   - `NOTION_PRODUCTS_DATABASE_ID` が設定されているか
   - `SHOPIFY_STORE_DOMAIN` が設定されているか
   - `SHOPIFY_STOREFRONT_ACCESS_TOKEN` が設定されているか

### 画像が表示されない

1. Shopify商品に画像が設定されているか確認
2. `next.config.ts` で `cdn.shopify.com` がremotePatternsに含まれているか確認

### 在庫状態が更新されない

- APIレスポンスは5分間キャッシュされます
- 即座に更新が必要な場合は、ブラウザのキャッシュをクリアしてください

---

## ベストプラクティス

### おすすめ商品の選定

1. **最大6商品まで** - 多すぎると選択肢が多くなりすぎます
2. **季節やトレンドに合わせて定期的に更新** - 新鮮さを保つ
3. **カテゴリーのバランス** - 特定のカテゴリーに偏らないようにする

### Blog記事での商品紹介

1. **文脈に合った商品を紹介** - 記事の内容と関連する商品を選ぶ
2. **説明を追加** - 商品の前後に説明文を追加して、なぜその商品をおすすめするのか伝える
3. **過度な埋め込みを避ける** - 1記事あたり3-5商品程度に抑える

### パフォーマンス

- 商品データはAPIでキャッシュされるため、同じ商品を複数回埋め込んでもパフォーマンスに影響しません
- ホームページのFeatured商品はビルド時に取得されるため、高速に表示されます

---

## まとめ

この機能により、以下が実現できます：

✅ ホームページで最大6個のおすすめ商品を自動表示
✅ Blog記事内で商品を自由に紹介
✅ 在庫状態の自動表示
✅ Shopifyオンラインストアへのシームレスな誘導

質問や問題がある場合は、開発チームにお問い合わせください。
