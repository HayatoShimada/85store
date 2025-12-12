# Cookie共有ガイド: shop.85-store.com と 85-store.com

## 質問
**shop.85-store.com（Shopify）のログイン情報（cookie）は85-store.comで利用できるか？**

## 回答：デフォルトでは**利用できません**

### 理由

1. **異なるドメイン間ではCookieは共有されない**
   - `shop.85-store.com` と `85-store.com` は異なるドメイン（サブドメイン）です
   - ブラウザのセキュリティポリシーにより、異なるドメイン間ではCookieは自動的に共有されません

2. **ShopifyのCookieはShopify側で管理**
   - ShopifyのログインCookieは`shop.85-store.com`ドメインに設定されます
   - これらのCookieは`85-store.com`からはアクセスできません

## Cookieを共有する方法

### 方法1: ドメイン属性を設定（Shopify側の制限あり）

Cookieの`domain`属性を`.85-store.com`に設定すれば、サブドメイン間で共有できます：

```javascript
// 例（理論上）
document.cookie = "session=xxx; domain=.85-store.com; path=/";
```

**しかし、ShopifyのCookieはShopify側で管理されているため、この方法は使用できません。**

### 方法2: OAuth認証連携（推奨）

Shopifyの認証情報を85-store.comで利用するには、OAuth認証を実装する必要があります：

#### 実装手順

1. **Shopify OAuthアプリの作成**
   - Shopify管理画面でカスタムアプリを作成
   - OAuthスコープを設定（例: `read_customers`, `read_orders`）

2. **認証フローの実装**
   ```typescript
   // app/api/auth/shopify/route.ts
   export async function GET(request: NextRequest) {
     const shop = 'shop.85-store.com';
     const redirectUri = 'https://85-store.com/api/auth/shopify/callback';
     const clientId = process.env.SHOPIFY_CLIENT_ID;
     
     const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=read_customers&redirect_uri=${redirectUri}`;
     
     return NextResponse.redirect(authUrl);
   }
   ```

3. **コールバック処理**
   ```typescript
   // app/api/auth/shopify/callback/route.ts
   export async function GET(request: NextRequest) {
     const { searchParams } = new URL(request.url);
     const code = searchParams.get('code');
     
     // Shopify APIでアクセストークンを取得
     // トークンを85-store.comのセッションに保存
     
     return NextResponse.redirect('/');
   }
   ```

4. **セッション管理**
   - 取得したShopifyのアクセストークンを85-store.comのセッション（Cookie）に保存
   - 以降のリクエストでこのトークンを使用してShopify APIを呼び出す

### 方法3: Shopify Customer Account API（Shopify Plus限定）

Shopify Plusを使用している場合、Customer Account APIを使用できます：

- 顧客がShopifyでログイン
- 85-store.comで顧客情報を取得
- シングルサインオン（SSO）を実装

**注意**: Shopify Plusプランが必要です。

### 方法4: プロキシ経由の認証（非推奨）

85-store.comでプロキシサーバーを経由してShopifyのCookieを読み取る方法もありますが、セキュリティ上のリスクがあるため推奨されません。

## 現在の実装状況

現在のコードベースを確認した結果：

- ✅ Shopify API連携（商品情報の取得）
- ✅ Shopifyオンラインストアへのリンク
- ❌ 認証情報の共有（未実装）
- ❌ OAuth認証（未実装）

## 推奨される実装

### シナリオ1: ログイン状態を共有する必要がない場合

**現状のまま**で問題ありません：
- 85-store.comで商品情報を表示
- 購入時は`shop.85-store.com`にリダイレクト
- Shopify側でログイン・決済を完結

### シナリオ2: ログイン状態を共有したい場合

**OAuth認証を実装**：
1. Shopify OAuthアプリを作成
2. 認証フローを実装
3. アクセストークンをセッションに保存
4. Shopify Customer APIで顧客情報を取得

### シナリオ3: シングルサインオン（SSO）を実装したい場合

**Shopify Plusが必要**：
- Customer Account APIを使用
- 85-store.comとshop.85-store.comで同一のログイン状態を維持

## 実装例（OAuth認証）

### 1. 環境変数の設定

```bash
# .env.local
SHOPIFY_CLIENT_ID=your_client_id
SHOPIFY_CLIENT_SECRET=your_client_secret
SHOPIFY_STORE_DOMAIN=shop.85-store.com
NEXT_PUBLIC_SITE_URL=https://85-store.com
```

### 2. 認証エンドポイントの作成

```typescript
// app/api/auth/shopify/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const shop = process.env.SHOPIFY_STORE_DOMAIN;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/shopify/callback`;
  
  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=read_customers&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  return NextResponse.redirect(authUrl);
}
```

### 3. コールバック処理

```typescript
// app/api/auth/shopify/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect('/?error=auth_failed');
  }
  
  // Shopify APIでアクセストークンを取得
  const shop = process.env.SHOPIFY_STORE_DOMAIN;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  
  const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });
  
  const { access_token } = await tokenResponse.json();
  
  // セッションに保存（例: JWTトークンとして）
  const cookieStore = cookies();
  cookieStore.set('shopify_token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7日間
  });
  
  return NextResponse.redirect('/');
}
```

## まとめ

- **デフォルトではCookieは共有されません**
- **OAuth認証を実装すれば、認証情報を共有できます**
- **現在の実装では認証情報の共有は行われていません**
- **購入フローは`shop.85-store.com`にリダイレクトする現状の方法で問題ありません**

認証情報の共有が必要な場合は、OAuth認証の実装を検討してください。

