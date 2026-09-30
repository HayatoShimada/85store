import { cacheLife, cacheTag } from "next/cache";
import { STORE } from "@/lib/store-info";

// Shopify Storefront API（公開中の商品のみ取得できる）
export interface StorefrontProduct {
  handle: string;
  title: string;
  vendor: string;
  price: number;
  image: { url: string; width: number; height: number; altText: string | null } | null;
}

const LATEST_PRODUCTS_QUERY = `
  query LatestProducts($first: Int!) {
    products(first: $first, sortKey: CREATED_AT, reverse: true, query: "available_for_sale:true") {
      nodes {
        handle
        title
        vendor
        priceRange { minVariantPrice { amount } }
        featuredImage { url width height altText }
      }
    }
  }
`;

// 新着商品（在庫あり）を取得する。商品一覧は補助的なコンテンツなので、
// 失敗してもページを止めず、空配列を数分だけキャッシュして次の取得を早めに試す
export async function getLatestProducts(first: number = 8): Promise<StorefrontProduct[]> {
  "use cache";
  cacheTag("shopify-products");

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token) {
    cacheLife("hours");
    return [];
  }

  try {
    const response = await fetch(`https://${domain}/api/2025-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query: LATEST_PRODUCTS_QUERY, variables: { first } }),
    });
    const json = await response.json();
    if (!response.ok || json.errors) {
      throw new Error(`Shopify Storefront API error (${response.status}): ${JSON.stringify(json.errors ?? json)}`);
    }

    const products: StorefrontProduct[] = json.data.products.nodes.map((node: any) => ({
      handle: node.handle,
      title: node.title,
      vendor: node.vendor,
      price: Number(node.priceRange.minVariantPrice.amount),
      image: node.featuredImage,
    }));
    cacheLife("hours");
    return products;
  } catch (error) {
    console.error("Error fetching latest products:", error);
    cacheLife("minutes");
    return [];
  }
}

// オンラインストアの商品ページURL
export function getStorefrontProductUrl(handle: string): string {
  return `${STORE.onlineShopUrl}products/${encodeURIComponent(handle)}`;
}

// ショップのポリシー（配送・返品・利用規約・プライバシー）
export type ShopPolicyKey = "shippingPolicy" | "refundPolicy" | "termsOfService" | "privacyPolicy";

export interface ShopPolicy {
  title: string;
  handle: string;
  body: string; // HTML
}

// オンラインストアで管理しているポリシーをそのまま表示するために取得する
// 失敗してもページを止めず、null を数分だけキャッシュする
export async function getShopPolicy(key: ShopPolicyKey): Promise<ShopPolicy | null> {
  "use cache";
  cacheTag("shopify-policies");

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token) {
    cacheLife("hours");
    return null;
  }

  try {
    const response = await fetch(`https://${domain}/api/2025-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query: `{ shop { ${key} { title handle body } } }` }),
    });
    const json = await response.json();
    if (!response.ok || json.errors) {
      throw new Error(`Shopify Storefront API error (${response.status}): ${JSON.stringify(json.errors ?? json)}`);
    }
    cacheLife("days");
    return json.data.shop[key] ?? null;
  } catch (error) {
    console.error(`Error fetching shop policy (${key}):`, error);
    cacheLife("minutes");
    return null;
  }
}

// オンラインストアのポリシーページURL
export function getShopPolicyUrl(handle: string): string {
  return `${STORE.onlineShopUrl}policies/${handle}`;
}
