import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

// CMS（cms/、85pi の Payload）が記事・バナーを R2 に書き出したあと、または商品を Shopify に送ったあとに呼び、
// キャッシュ（blogs / banners / shopify-products）を破棄する。
// 署名は x-cms-signature（本文の HMAC-SHA256、16進）。秘密は CMS と同じ CMS_WEBHOOK_SECRET。
const REVALIDATABLE_APIS = new Set(["blogs", "banners", "shopify-products"]);

export async function POST(request: Request) {
  const secret = process.env.CMS_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ message: "CMS_WEBHOOK_SECRET is not set" }, { status: 500 });
  }

  const body = await request.text();
  if (!isValidSignature(body, request.headers.get("x-cms-signature"), secret)) {
    return Response.json({ message: "Invalid signature" }, { status: 401 });
  }

  let api: unknown;
  try {
    api = JSON.parse(body).api;
  } catch {
    return Response.json({ message: "Invalid JSON" }, { status: 400 });
  }
  if (typeof api !== "string" || !REVALIDATABLE_APIS.has(api)) {
    return Response.json({ message: `Unknown api: ${String(api)}` }, { status: 400 });
  }

  // 公開・更新をすぐ反映したいので、古いキャッシュは返さず次のアクセスで取り直す
  revalidateTag(api, { expire: 0 });
  return Response.json({ revalidated: true, tag: api });
}

function isValidSignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
