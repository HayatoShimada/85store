// 日本語の見出し・短い文が、文節（BudouX）の途中で改行されていないか、1〜2文字だけの行ができていないかを調べる。
// サイト（85-store.com）とショップ（shop.85-store.com）の両方に使う。CLAUDE.md「日本語の改行と文字組み」
//
//   npm run check:linebreaks                       既定のページ（サイトとショップの主なページ）
//   npm run check:linebreaks -- <URL> [<URL>...]   指定したページ
//   BROWSERS=webkit WIDTHS=375,412 npm run check:linebreaks
//
// WebKit（Safari と同じエンジン）が要る: npx playwright-core install webkit
// （Linux では sudo apt-get install libevent-2.1-7t64 libmanette-0.2-0 も）
import { chromium, webkit } from "playwright-core";
import { loadDefaultJapaneseParser } from "budoux";

const DEFAULT_URLS = [
  "https://85-store.com/",
  "https://85-store.com/blog",
  "https://85-store.com/reserve",
  "https://shop.85-store.com/",
  "https://shop.85-store.com/collections/all",
];
const urls = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_URLS;
const browsers = (process.env.BROWSERS ?? "chromium,webkit").split(",");
const widths = (process.env.WIDTHS ?? "375,412,1280").split(",").map(Number);

// 調べる要素（見出し・短い文）
const SELECTOR = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  '[role="heading"]',
  ".ja-phrase",
  ".announcement-bar__text",
  ".sec-head p",
].join(",");

const parser = loadDefaultJapaneseParser();
const JAPANESE = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;

// ページの中で、要素ごとの文字列と各行の始まりの位置（文字の番号）を集める
function collectLines(selector) {
  const seen = new Set();
  const results = [];
  for (const el of document.querySelectorAll(selector)) {
    // 入れ子（h3 の中の .ja-phrase など）は外側だけ調べる
    if ([...seen].some((s) => s.contains(el))) continue;
    const rect = el.getBoundingClientRect();
    // 画面に出ないもの（読み上げ用の visually-hidden は幅が 1px）は除く
    if (rect.width < 20 || !rect.height || getComputedStyle(el).visibility === "hidden") continue;
    seen.add(el);
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let text = "";
    const starts = [];
    let lineBottom = null;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      // 読み上げ用に画面から隠した文字（sr-only・visually-hidden。1px に縮めてある）は数えない
      const parentRect = node.parentElement?.getBoundingClientRect();
      if (parentRect && (parentRect.width <= 1 || parentRect.height <= 1)) continue;
      for (let i = 0; i < node.data.length; i++) {
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const box = range.getClientRects()[0];
        if (box && box.width > 0 && !/\s/.test(node.data[i])) {
          const middle = box.top + box.height / 2;
          if (lineBottom !== null && middle > lineBottom) starts.push(text.length);
          if (lineBottom === null || middle > lineBottom) lineBottom = box.bottom;
        }
        text += node.data[i];
      }
    }
    results.push({ tag: el.tagName.toLowerCase(), text, starts });
  }
  return results;
}

function analyze({ text, starts }) {
  const problems = [];
  if (!JAPANESE.test(text) || text.length > 120 || !starts.length) return problems;
  const boundaries = new Set();
  let offset = 0;
  for (const phrase of parser.parse(text)) boundaries.add((offset += phrase.length));
  const lines = [];
  let prev = 0;
  for (const start of starts) {
    lines.push(text.slice(prev, start));
    // 空白・記号の前後での改行は問題にしない
    const before = text[start - 1];
    const after = text[start];
    if (!boundaries.has(start) && JAPANESE.test(before + after) && !/[\s、。・,.!?！？]/.test(before)) {
      problems.push(`文節の途中で改行: ${text.slice(Math.max(0, start - 8), start)}｜${text.slice(start, start + 8)}`);
    }
    prev = start;
  }
  lines.push(text.slice(prev));
  const last = lines.at(-1).trim();
  if (lines.length > 1 && last.length <= 2 && JAPANESE.test(last)) problems.push(`最後の行が「${last}」だけ`);
  return problems;
}

let total = 0;
for (const name of browsers) {
  const type = name === "webkit" ? webkit : chromium;
  const browser = await type.launch(name === "chromium" ? { channel: "chrome" } : {});
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    for (const url of urls) {
      await page.goto(url, { waitUntil: "load", timeout: 120_000 });
      await page.waitForTimeout(2500); // 後から入る見出し（記事欄など）と、Safari 向けの文節の処理を待つ
      const elements = await page.evaluate(collectLines, SELECTOR);
      const found = elements.flatMap((element) => analyze(element).map((p) => `  <${element.tag}> ${p}`));
      total += found.length;
      console.log(`${found.length ? "NG" : "OK"} ${name} ${width}px ${url}（${elements.length} 要素）`);
      for (const line of [...new Set(found)]) console.log(line);
    }
    await context.close();
  }
  await browser.close();
}
console.log(total ? `\n${total} 件の改行の問題` : "\n問題なし");
process.exitCode = total ? 1 : 0;
