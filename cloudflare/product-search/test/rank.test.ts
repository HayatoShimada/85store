import assert from "node:assert/strict";
import { test } from "node:test";

import { joinAttributes } from "../src/catalog.ts";
import { corsHeaders } from "../src/cors.ts";
import { type ClefRequest, CHUNK, buildRequest, describe, normalizeQuery, rank } from "../src/rank.ts";

const product = (handle: string) => ({
  handle,
  title: `Title ${handle}`,
  productType: "Shirts",
  description: "説明\n  です",
  brand: null,
  material: null,
  attributes: null,
});

test("describe は商品名・種類・属性・説明の頭を1行にする", () => {
  const p = { ...product("a"), brand: "Lee", attributes: "シャツ / 秋冬" };
  assert.equal(describe(p), "Title a（Shirts / Lee / シャツ / 秋冬）説明 です");
});

test("buildRequest は商品ごとに noul を1つ聞く", () => {
  const req = buildRequest("冬", [product("a"), product("b")]);
  assert.deepEqual(Object.keys(req.questions), ["p0", "p1"]);
  assert.equal(req.questions.p1.type, "noul");
  assert.match(req.questions.p1.instructions, /Title b/);
  assert.deepEqual((req.state as { query: string }).query, "冬");
});

test("rank は商品を分けて聞き、確率の高い順に並べる", async () => {
  const products = Array.from({ length: CHUNK + 5 }, (_, i) => product(`h${i}`));
  const requests: ClefRequest[] = [];
  const ranked = await rank("冬", products, async (req) => {
    requests.push(req);
    const offset = requests.length === 1 ? 0 : CHUNK;
    return Object.fromEntries(
      Object.keys(req.questions).map((id) => [id, { noul: (Number(id.slice(1)) + offset) / 100 }]),
    );
  });
  assert.equal(requests.length, 2);
  assert.equal(ranked.length, CHUNK + 5);
  assert.equal(ranked[0].handle, `h${CHUNK + 4}`);
  assert.equal(ranked.at(-1)?.handle, "h0");
});

test("joinAttributes は KV の属性をハンドルでつなぐ（無ければ null）", () => {
  const nodes = [
    { handle: "a", title: "A", productType: "Shirts", description: "" },
    { handle: "b", title: "B", productType: "Pants", description: "" },
  ];
  const [a, b] = joinAttributes(nodes, { a: { text: "シャツ", brand: "Lee", material: null } });
  assert.equal(a.attributes, "シャツ");
  assert.equal(a.brand, "Lee");
  assert.equal(b.attributes, null);
});

test("normalizeQuery は全角・空白・大文字をそろえる", () => {
  assert.equal(normalizeQuery("  ＬＥＥの　 シャツ "), "leeの シャツ");
});

test("corsHeaders はショップとプレビューだけに許す", () => {
  const allowed = "https://shop.85-store.com,https://ctixqe-p0.myshopify.com";
  assert.equal(
    corsHeaders("https://shop.85-store.com", allowed)["Access-Control-Allow-Origin"],
    "https://shop.85-store.com",
  );
  assert.ok(corsHeaders("https://abc.shopifypreview.com", allowed)["Access-Control-Allow-Origin"]);
  assert.equal(corsHeaders("https://evil.example", allowed)["Access-Control-Allow-Origin"], undefined);
  assert.equal(corsHeaders("https://shopifypreview.com.evil.example", allowed)["Access-Control-Allow-Origin"], undefined);
});
