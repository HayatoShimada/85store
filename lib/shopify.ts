// Shopifyが設定されているかチェック
export function isShopifyConfigured(): boolean {
  return !!(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ADMIN_ACCESS_TOKEN);
}

// Shopifyハンドルの形式が正しいかチェック
// Shopifyは日本語ハンドルもサポートしているため、基本的なチェックのみ
export function isValidShopifyHandle(handle: string): boolean {
  if (!handle || handle.trim() === "") {
    return false;
  }

  // 数値のみの場合はID（有効）
  if (/^\d+$/.test(handle)) {
    return true;
  }

  // 基本的には空でなければ有効とする
  return true;
}

// 無効なハンドルの理由を返す
export function getHandleValidationMessage(handle: string): string | null {
  if (!handle || handle.trim() === "") {
    return "ハンドルが空です";
  }

  // 数値のみの場合はID（有効）
  if (/^\d+$/.test(handle)) {
    return null; // 有効
  }

  // Shopifyは日本語ハンドルをサポートしているため、基本的には有効
  return null;
}

// Admin REST APIを使うためのヘルパー関数
async function fetchAdminAPI(endpoint: string) {
  if (!isShopifyConfigured()) {
    throw new Error("Shopify configuration is missing. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN environment variables.");
  }

  const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-10/${endpoint}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify Admin API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

export async function getProducts(first: number = 10) {
  const result = await fetchAdminAPI(`products.json?limit=${Math.min(first, 250)}`);

  return result.products.map((product: any) => ({
    id: `gid://shopify/Product/${product.id}`,
    title: product.title,
    description: product.body_html?.replace(/<[^>]*>/g, '') || '',
    handle: product.handle,
    priceRange: {
      minVariantPrice: {
        amount: product.variants[0]?.price || '0',
        currencyCode: 'JPY',
      },
    },
    images: {
      edges: product.images?.map((img: any) => ({
        node: {
          originalSrc: img.src,
          altText: img.alt || '',
        },
      })) || [],
    },
  }));
}

export async function getProduct(handleOrId: string) {
  // IDかハンドルかを判定（数字のみの場合はID）
  const isNumericId = /^\d+$/.test(handleOrId);

  let result;
  if (isNumericId) {
    // IDで検索
    result = await fetchAdminAPI(`products/${handleOrId}.json`);
  } else {
    // ハンドルで検索（全商品から検索）
    const allProducts = await fetchAdminAPI(`products.json?limit=250`);
    const product = allProducts.products.find((p: any) => p.handle === handleOrId);
    if (!product) {
      return null;
    }
    result = { product };
  }

  const product = result.product;

  return {
    id: `gid://shopify/Product/${product.id}`,
    title: product.title,
    description: product.body_html?.replace(/<[^>]*>/g, '') || '',
    handle: product.handle,
    priceRange: {
      minVariantPrice: {
        amount: product.variants[0]?.price || '0',
        currencyCode: 'JPY',
      },
    },
    images: {
      edges: product.images?.map((img: any) => ({
        node: {
          originalSrc: img.src,
          altText: img.alt || '',
        },
      })) || [],
    },
    variants: {
      edges: product.variants?.map((variant: any) => ({
        node: {
          id: `gid://shopify/ProductVariant/${variant.id}`,
          title: variant.title,
          priceV2: {
            amount: variant.price,
            currencyCode: 'JPY',
          },
          availableForSale: variant.inventory_quantity > 0,
        },
      })) || [],
    },
  };
}

export async function createCheckout(variantId: string, quantity: number = 1) {
  // Admin APIではチェックアウトを作成できないため、
  // オンラインストアのカートURLにリダイレクトする方法を使用
  const numericVariantId = variantId.replace('gid://shopify/ProductVariant/', '');

  const onlineStoreDomain = process.env.NEXT_PUBLIC_SHOPIFY_ONLINE_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN || "";
  const webUrl = `https://${onlineStoreDomain}/cart/${numericVariantId}:${quantity}`;

  return {
    id: `cart-${numericVariantId}`,
    webUrl,
  };
}

// オンラインストアのURLを生成
export function getProductUrl(handle: string): string {
  // カスタムドメインが設定されている場合はそれを使用、なければmyshopifyドメインを使用
  const onlineStoreDomain = process.env.NEXT_PUBLIC_SHOPIFY_ONLINE_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN || "";
  return `https://${onlineStoreDomain}/products/${encodeURIComponent(handle)}`;
}

// 商品の在庫状況を取得
export async function getProductAvailability(handle: string): Promise<{
  availableForSale: boolean;
  totalInventory: number;
}> {
  const product = await getProduct(handle);

  if (!product) {
    return { availableForSale: false, totalInventory: 0 };
  }

  // いずれかのバリアントが在庫ありかチェック
  const hasAvailableVariant = product.variants.edges.some(
    (edge: any) => edge.node.availableForSale
  );

  // 総在庫数を計算
  const totalInventory = product.variants.edges.reduce(
    (sum: number, edge: any) => sum + (edge.node.availableForSale ? 1 : 0),
    0
  );

  return {
    availableForSale: hasAvailableVariant,
    totalInventory,
  };
}

// 複数の商品ハンドル/IDから商品情報を取得
export async function getProductsByHandles(handleOrIds: string[]) {
  const products = await Promise.all(
    handleOrIds.map(async (handleOrId) => {
      // バリデーションチェック
      const validationError = getHandleValidationMessage(handleOrId);
      if (validationError) {
        return null;
      }

      try {
        const product = await getProduct(handleOrId);
        if (!product) {
          return null;
        }

        // 実際のハンドルを使用（IDで検索した場合も、返された商品からハンドルを取得）
        const actualHandle = product.handle || handleOrId;

        return {
          handle: actualHandle,
          handleOrId, // 元のhandleOrIdも返す（マッチング用）
          title: product.title,
          description: product.description || "",
          price: parseFloat(product.priceRange.minVariantPrice.amount),
          images: product.images.edges.map((edge: any) => edge.node.originalSrc),
          availableForSale: product.variants?.edges?.[0]?.node?.availableForSale ?? true,
        };
      } catch (error) {
        return null;
      }
    })
  );

  return products.filter((p) => p !== null);
}