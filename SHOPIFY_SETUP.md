# Shopify 設定ガイド

このドキュメントは、85-StoreでShopifyの商品を表示するために必要な設定を説明します。

## 重要：ドメインの設定

### 問題の症状
- Featured Productsが表示されない
- コンソールに `Product not found for handle/ID` エラーが表示される
- Storefront APIから商品が取得できない

### 原因
`.env.local`の`SHOPIFY_STORE_DOMAIN`に**カスタムドメイン**（例: `shop.85-store.com`）が設定されている場合、Shopify APIは接続できません。

### 解決方法

#### 1. myshopify.comドメインを確認

Shopify管理画面で以下を確認してください：

1. **設定** → **ドメイン**
2. 「**Shopifyが管理するドメイン**」セクションで`*.myshopify.com`ドメインを確認
   - 例: `85-store.myshopify.com`、`your-store-name.myshopify.com`

#### 2. .env.localを更新

`.env.local`ファイルを開いて、以下のように設定してください：

```bash
# ❌ 間違い（カスタムドメイン）
SHOPIFY_STORE_DOMAIN=shop.85-store.com

# ✅ 正しい（myshopifyドメイン）
SHOPIFY_STORE_DOMAIN=85-store.myshopify.com

# オンラインストアのカスタムドメイン（商品URLの生成に使用）
NEXT_PUBLIC_SHOPIFY_ONLINE_STORE_DOMAIN=shop.85-store.com
```

**重要ポイント：**
- `SHOPIFY_STORE_DOMAIN` = **API接続用**（必ず`.myshopify.com`ドメイン）
- `NEXT_PUBLIC_SHOPIFY_ONLINE_STORE_DOMAIN` = **商品URL生成用**（カスタムドメイン可）

#### 3. Storefront APIの権限を確認

商品が取得できない場合、APIトークンの権限も確認してください：

1. Shopify管理画面 → **設定** → **アプリと販売チャネル**
2. **「アプリを開発する」** → カスタムアプリを開く
3. **「設定」** → **「Storefront API」** タブ
4. 以下の権限が有効か確認：
   - ✅ `unauthenticated_read_product_listings` **（必須）**
   - ✅ `unauthenticated_read_product_inventory` （推奨）

権限を変更した場合、新しいアクセストークンが生成されることがあります。その場合は`.env.local`の`SHOPIFY_STOREFRONT_ACCESS_TOKEN`も更新してください。

#### 4. 商品の公開設定を確認

商品がStorefront APIで取得できるようにするには、商品が「オンラインストア」チャネルで公開されている必要があります：

1. Shopify管理画面 → **商品管理**
2. 該当商品を開く
3. 右側の「**販売チャネルとアプリ**」セクション
4. **「オンラインストア」にチェックが入っているか確認**

#### 5. 開発サーバーを再起動

`.env.local`を変更した後は、開発サーバーを再起動してください：

```bash
# 現在のサーバーを停止（Ctrl+C）
# 再起動
npm run dev
```

## テスト方法

設定が正しいか確認するため、テストスクリプトを実行できます：

```bash
DOTENV_CONFIG_PATH=.env.local node test-shopify-handle.js
```

正しく設定されていれば、商品リストが表示されます。

## NotionのShopifyHandle設定

NotionのProductsデータベースで、ShopifyHandleフィールドに以下のいずれかを設定できます：

1. **商品ハンドル**（推奨）
   - 例: `a1ジャケット`、`mens-winter-jacket`
   - Shopify商品ページのURLから取得: `https://shop.85-store.com/products/[ここの部分]`

2. **商品ID**（数値のみ）
   - 例: `8102510624883`
   - Shopify Admin画面のURLから取得: `https://admin.shopify.com/store/xxx/products/[ここの数値]`

**注意：** 日本語ハンドル（例: `a1ジャケット`）もサポートされています。

## トラブルシューティング

### 商品が1つも取得できない

1. `.env.local`の`SHOPIFY_STORE_DOMAIN`が`.myshopify.com`形式か確認
2. Storefront APIトークンの権限を確認
3. 商品が「オンラインストア」で公開されているか確認
4. 開発サーバーを再起動

### 特定の商品だけ取得できない

1. NotionのShopifyHandleが正しいか確認
2. Shopifyで商品が存在するか確認
3. 商品が「オンラインストア」で公開されているか確認

### カスタムドメインで商品URLが生成されない

`.env.local`に`NEXT_PUBLIC_SHOPIFY_ONLINE_STORE_DOMAIN`を追加してください：

```bash
NEXT_PUBLIC_SHOPIFY_ONLINE_STORE_DOMAIN=shop.85-store.com
```

## 参考リンク

- [Shopify Storefront API Documentation](https://shopify.dev/docs/api/storefront)
- [Shopify Admin: Apps and Sales Channels](https://admin.shopify.com/settings/apps)
- [Shopify Admin: Domains](https://admin.shopify.com/settings/domains)
