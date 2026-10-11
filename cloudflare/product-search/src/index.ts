// 85-Store のオンラインストアの「AI 検索」。
//   GET /v1/search?q=冬に着る暖かいアウター
//   → { query, results: [{ handle, score }] }（合う確率の高い順。テーマが商品カードにする）
// 販売中の商品を、Workers AI の Clef（clef-flash）で検索語に合うかを判定して並べる。

import { type Attributes, fetchProducts, joinAttributes } from "./catalog.ts";
import { corsHeaders } from "./cors.ts";
import { type Ask, type ClefRequest, normalizeQuery, rank } from "./rank.ts";

export interface Env {
  AI: Ai;
  ATTRIBUTES: KVNamespace;
  LIMITER: RateLimit;
  STORE_DOMAIN: string;
  // CORS を許すオリジン（カンマ区切り）。テーマのプレビュー（*.shopifypreview.com）も許す
  ALLOWED_ORIGINS: string;
}

const AI_MODEL = "@cf/cloudflare/clef-flash";
const QUERY_LIMIT = 100;
// これより低い確率の商品は出さない
const MIN_SCORE = 0.3;
const MAX_RESULTS = 48;
const CATALOG_TTL = 300;
const RESULT_TTL = 3600;
const CACHE_ORIGIN = "https://product-search.internal";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const cors = corsHeaders(request.headers.get("Origin"), env.ALLOWED_ORIGINS);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (url.pathname !== "/v1/search") return json({ error: "not found" }, 404, cors);
    if (request.method !== "GET") return json({ error: "method not allowed" }, 405, cors);

    const query = normalizeQuery(url.searchParams.get("q") ?? "");
    if (!query) return json({ error: "q を入れてください" }, 400, cors);
    if (query.length > QUERY_LIMIT) return json({ error: "検索語が長すぎます" }, 400, cors);

    try {
      const { products, version } = await loadCatalog(env, ctx);
      const cache = caches.default;
      const key = new Request(`${CACHE_ORIGIN}/search?v=${version}&q=${encodeURIComponent(query)}`);
      const hit = await cache.match(key);
      if (hit) return withHeaders(hit, cors);

      // 同じ人からの連続した検索を抑える（キャッシュに当たったものは数えない）
      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      const { success } = await env.LIMITER.limit({ key: ip });
      if (!success) return json({ error: "少し時間をおいて検索してください" }, 429, cors);

      const started = Date.now();
      const ranked = await rank(query, products, askWorkersAI(env.AI));
      const results = ranked
        .filter((r) => r.score >= MIN_SCORE)
        .slice(0, MAX_RESULTS)
        .map((r) => ({ handle: r.handle, score: Math.round(r.score * 1000) / 1000 }));
      const body = { query, results, searched: products.length, ms: Date.now() - started };
      const res = json(body, 200, { "Cache-Control": `public, max-age=${RESULT_TTL}` });
      ctx.waitUntil(cache.put(key, res.clone()));
      return withHeaders(res, cors);
    } catch (e) {
      console.error(e);
      return json({ error: "検索できませんでした" }, 502, cors);
    }
  },
} satisfies ExportedHandler<Env>;

// 販売中の商品と属性。5分キャッシュする（売れた商品がすぐ消えるように短め）
async function loadCatalog(env: Env, ctx: ExecutionContext) {
  const cache = caches.default;
  const key = new Request(`${CACHE_ORIGIN}/catalog`);
  const hit = await cache.match(key);
  let nodes: Awaited<ReturnType<typeof fetchProducts>>;
  if (hit) {
    nodes = await hit.json();
  } else {
    nodes = await fetchProducts(env.STORE_DOMAIN);
    const res = json(nodes, 200, { "Cache-Control": `public, max-age=${CATALOG_TTL}` });
    ctx.waitUntil(cache.put(key, res));
  }
  const attributes = (await env.ATTRIBUTES.get<Attributes>("attributes", {
    type: "json",
    cacheTtl: CATALOG_TTL,
  })) ?? {};
  const products = joinAttributes(nodes, attributes);
  // 商品・属性が変わったら、検索結果のキャッシュも使わない
  const version = hash(JSON.stringify(products.map((p) => [p.handle, p.attributes])));
  return { products, version };
}

function askWorkersAI(ai: Ai): Ask {
  return async (request: ClefRequest) => {
    // Clef は Workers AI の型にまだ無い
    const out = (await (ai as unknown as { run: (m: string, i: unknown) => Promise<unknown> }).run(
      AI_MODEL,
      request,
    )) as { answers?: Record<string, { noul: number }>; result?: { answers: Record<string, { noul: number }> } };
    const answers = out.answers ?? out.result?.answers;
    if (!answers) throw new Error(`Clef: 答えがありません ${JSON.stringify(out).slice(0, 200)}`);
    return answers;
  };
}

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

function withHeaders(res: Response, headers: Record<string, string>): Response {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(headers)) out.headers.set(k, v);
  return out;
}

// FNV-1a（キャッシュのキーに使うだけ）
function hash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}
