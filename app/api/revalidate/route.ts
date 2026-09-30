import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

// microCMSのWebhookから呼ばれ、更新されたAPI（blogs / products / banners）のキャッシュを破棄する
// microCMS管理画面 > API設定 > Webhook > カスタム通知 で
//   URL: https://85-store.com/api/revalidate
//   シークレット: 環境変数 MICROCMS_WEBHOOK_SECRET と同じ値
// を設定する。
const REVALIDATABLE_APIS = new Set(["blogs", "products", "banners"]);

export async function POST(request: Request) {
  const secret = process.env.MICROCMS_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ message: "MICROCMS_WEBHOOK_SECRET is not set" }, { status: 500 });
  }

  const body = await request.text();
  if (!isValidSignature(body, request.headers.get("x-microcms-signature"), secret)) {
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
