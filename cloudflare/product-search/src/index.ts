// 85-Store のオンラインストアの「AI 検索」。
//   GET  /v1/search?q=冬に着る暖かいアウター
//   POST /v1/image-search（本文は写真。image/jpeg・png・webp）
//   → { query, results: [{ handle, score }] }（合う確率の高い順。テーマが商品カードにする）
//   GET  /v1/admin/terms?days=30（お客さまが検索した言葉の集計。CMS が Bearer トークンで読む）
// 販売中の商品を、Workers AI の Clef（clef-flash）で検索語（写真）に合うかを判定して並べる。

import { type Attributes, fetchProducts, joinAttributes } from "./catalog.ts";
import { corsHeaders } from "./cors.ts";
import { type Kind, listTerms, logSearch, summarize } from "./log.ts";
import { type Ask, type ClefRequest, type SearchInput, normalizeQuery, rank } from "./rank.ts";

export interface Env {
  AI: Ai;
  ATTRIBUTES: KVNamespace;
  LIMITER: RateLimit;
  DB: D1Database;
  // CMS（cms.85-store.com）が検索の集計を読むためのトークン（wrangler secret put ADMIN_TOKEN）
  ADMIN_TOKEN?: string;
  STORE_DOMAIN: string;
  // CORS を許すオリジン（カンマ区切り）。テーマのプレビュー（*.shopifypreview.com）も許す
  ALLOWED_ORIGINS: string;
}

const AI_MODEL = "@cf/cloudflare/clef-flash";
const QUERY_LIMIT = 100;
// Clef に渡せる画像の大きさ（テーマは長い辺 768px の JPEG に縮めて送る）
const IMAGE_LIMIT = 4 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
// これより低い確率の商品は出さない
const MIN_SCORE = 0.3;
// 検索語が意味のあることば（写真に身につけるものが写っている）かの確率がこれ未満なら、何も返さない
const MIN_MEANINGFUL = 0.2;
const MAX_RESULTS = 48;
const CATALOG_TTL = 300;
const RESULT_TTL = 3600;
const CACHE_ORIGIN = "https://product-search.internal";
// 並べ方（質問・しきい値）を変えたら上げる（前の検索結果のキャッシュを使わない）
const RANKING_VERSION = 3;

type Result = { handle: string; score: number };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/v1/admin/terms") return adminTerms(request, env, url);

    const cors = corsHeaders(request.headers.get("Origin"), env.ALLOWED_ORIGINS);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    if (url.pathname === "/v1/search") {
      if (request.method !== "GET") return json({ error: "method not allowed" }, 405, cors);
      const query = normalizeQuery(url.searchParams.get("q") ?? "");
      if (!query) return json({ error: "q を入れてください" }, 400, cors);
      if (query.length > QUERY_LIMIT) return json({ error: "検索語が長すぎます" }, 400, cors);
      return search(request, env, ctx, cors, {
        input: { query },
        cacheId: `q=${encodeURIComponent(query)}`,
        kind: "text",
        query,
      });
    }

    if (url.pathname === "/v1/image-search") {
      if (request.method !== "POST") return json({ error: "method not allowed" }, 405, cors);
      const type = (request.headers.get("Content-Type") ?? "").split(";")[0].trim();
      if (!IMAGE_TYPES.includes(type)) return json({ error: "写真（JPEG・PNG・WebP）を送ってください" }, 415, cors);
      const body = await request.arrayBuffer();
      if (!body.byteLength) return json({ error: "写真を送ってください" }, 400, cors);
      if (body.byteLength > IMAGE_LIMIT) return json({ error: "写真が大きすぎます" }, 413, cors);
      // 同じ写真は同じ結果にする（キャッシュのキーは写真の SHA-256）
      const digest = hex(await crypto.subtle.digest("SHA-256", body));
      return search(request, env, ctx, cors, {
        input: { image: { content_type: type, base64: base64(body) } },
        cacheId: `image=${digest}`,
        kind: "image",
        query: "",
      });
    }

    return json({ error: "not found" }, 404, cors);
  },
} satisfies ExportedHandler<Env>;

async function search(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  cors: Record<string, string>,
  { input, cacheId, kind, query }: { input: SearchInput; cacheId: string; kind: Kind; query: string },
): Promise<Response> {
  // お客さまが検索した言葉を記録する（キャッシュに当たった検索も数える。失敗しても検索は続ける）
  const record = (results: Result[]) =>
    ctx.waitUntil(logSearch(env.DB, kind, query, results.length).catch((e) => console.error("log", e)));
  try {
    const { products, version } = await loadCatalog(env, ctx);
    const cache = caches.default;
    // キャッシュは GET でしか引けないので、写真の検索も GET のキーにする
    const key = new Request(`${CACHE_ORIGIN}/search?r=${RANKING_VERSION}&v=${version}&${cacheId}`);
    const hit = await cache.match(key);
    if (hit) {
      const { results } = (await hit.clone().json()) as { results: Result[] };
      record(results);
      return withHeaders(hit, cors);
    }

    // 同じ人からの連続した検索を抑える（キャッシュに当たったものは数えない）
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const { success } = await env.LIMITER.limit({ key: ip });
    if (!success) return json({ error: "少し時間をおいて検索してください" }, 429, cors);

    const started = Date.now();
    const { meaningful, ranked } = await rank(input, products, askWorkersAI(env.AI));
    const results = (meaningful >= MIN_MEANINGFUL ? ranked : [])
      .filter((r) => r.score >= MIN_SCORE)
      .slice(0, MAX_RESULTS)
      .map((r) => ({ handle: r.handle, score: Math.round(r.score * 1000) / 1000 }));
    const body = {
      query,
      results,
      meaningful: Math.round(meaningful * 1000) / 1000,
      searched: products.length,
      ms: Date.now() - started,
    };
    const res = json(body, 200, { "Cache-Control": `public, max-age=${RESULT_TTL}` });
    ctx.waitUntil(cache.put(key, res.clone()));
    record(results);
    return withHeaders(res, cors);
  } catch (e) {
    console.error(e);
    return json({ error: "検索できませんでした" }, 502, cors);
  }
}

// お客さまが検索した言葉の集計（CMS が読む）。?days=7|30|90、?zero=1 で商品を出せなかった言葉だけ
async function adminTerms(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method !== "GET") return json({ error: "method not allowed" }, 405);
  const token = (request.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!env.ADMIN_TOKEN || !(await sameText(token, env.ADMIN_TOKEN))) return json({ error: "unauthorized" }, 401);
  const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 30, 1), 365);
  const zero = url.searchParams.get("zero") === "1";
  const terms = await listTerms(env.DB, days, zero);
  return json({ days, zero, summary: summarize(terms), terms }, 200, { "Cache-Control": "no-store" });
}

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

// トークンを、かかる時間で中身が分からないように比べる
async function sameText(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  return crypto.subtle.timingSafeEqual(x, y);
}

function base64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
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
