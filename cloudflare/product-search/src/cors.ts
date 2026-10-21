// テーマ（ショップ）とテーマのプレビューからの呼び出しだけに CORS を許す

export function corsHeaders(origin: string | null, allowed: string): Record<string, string> {
  const headers: Record<string, string> = { Vary: "Origin" };
  if (!origin) return headers;
  const list = allowed.split(",").map((s) => s.trim());
  let host = "";
  try {
    host = new URL(origin).hostname;
  } catch {
    return headers;
  }
  if (list.includes(origin) || host.endsWith(".shopifypreview.com")) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    // 写真の検索（POST）で Content-Type: image/jpeg を送るため
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}
