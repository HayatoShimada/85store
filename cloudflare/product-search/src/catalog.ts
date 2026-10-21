// 検索の対象にする商品（販売中のもの）を集める。
// 商品は Storefront API（トークンなしで読める範囲）から、属性・ブランド・素材は KV から読む。
// 属性は rocm_opencv_server の scripts/shopify_product_attributes.py --export で書き出し、
// npm run upload-attributes で KV に入れる（メタフィールドはトークンなしでは読めないため）。

import type { Product } from "./rank.ts";

export const API_VERSION = "2026-01";
const PAGE_SIZE = 250;
const DESCRIPTION_LIMIT = 200;

const QUERY = `
query($after: String) {
  products(first: ${PAGE_SIZE}, after: $after, query: "available_for_sale:true") {
    pageInfo { hasNextPage endCursor }
    nodes { handle title productType description(truncateAt: ${DESCRIPTION_LIMIT}) }
  }
}`;

type Node = { handle: string; title: string; productType: string; description: string };

// KV の attributes（ハンドルごと）
export type Attributes = Record<
  string,
  { text?: string; brand?: string | null; material?: string | null }
>;

export async function fetchProducts(
  storeDomain: string,
  fetcher: typeof fetch = fetch,
): Promise<Node[]> {
  const nodes: Node[] = [];
  let after: string | null = null;
  for (;;) {
    const res = await fetcher(`https://${storeDomain}/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { after } }),
    });
    if (!res.ok) throw new Error(`Storefront API: ${res.status}`);
    const body = (await res.json()) as {
      data?: { products: { pageInfo: { hasNextPage: boolean; endCursor: string }; nodes: Node[] } };
      errors?: { message: string }[];
    };
    if (body.errors?.length || !body.data) {
      throw new Error(`Storefront API: ${body.errors?.map((e) => e.message).join(" / ")}`);
    }
    nodes.push(...body.data.products.nodes);
    if (!body.data.products.pageInfo.hasNextPage) return nodes;
    after = body.data.products.pageInfo.endCursor;
  }
}

export function joinAttributes(nodes: Node[], attributes: Attributes): Product[] {
  return nodes.map((n) => {
    const a = attributes[n.handle] ?? {};
    return {
      handle: n.handle,
      title: n.title,
      productType: n.productType,
      description: n.description ?? "",
      brand: a.brand ?? null,
      material: a.material ?? null,
      attributes: a.text ?? null,
    };
  });
}
