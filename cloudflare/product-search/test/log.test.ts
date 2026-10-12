import assert from "node:assert/strict";
import { test } from "node:test";

import { summarize, tokyoDay } from "../src/log.ts";

test("tokyoDay は日本時間の日付にする", () => {
  assert.equal(tokyoDay(new Date("2026-10-11T14:59:59Z")), "2026-10-11");
  assert.equal(tokyoDay(new Date("2026-10-11T15:00:00Z")), "2026-10-12");
});

test("summarize は検索の回数・言葉の数・見つからなかった言葉・写真の検索を数える", () => {
  const at = "2026-10-12T00:00:00Z";
  const summary = summarize([
    { kind: "text", query: "冬", count: 5, results: 20, last_at: at },
    { kind: "text", query: "asdf", count: 2, results: 0, last_at: at },
    { kind: "image", query: "", count: 3, results: 12, last_at: at },
  ]);
  assert.deepEqual(summary, { searches: 10, terms: 2, zero: 1, images: 3 });
});
