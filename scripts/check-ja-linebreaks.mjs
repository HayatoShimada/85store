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

// 調べる要素: 見出し（120文字まで）と、短い本文（p・li など。80文字まで。長い段落は文字単位で折るので調べない）
const HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6", '[role="heading"]', ".announcement-bar__text"];
const SHORT_TEXT = ["p", "li", "dd", "dt", "figcaption", ".ja-phrase"];
const SELECTOR = [...HEADINGS, ...SHORT_TEXT].join(",");

const parser = loadDefaultJapaneseParser();
// 禁則に合わせた文節の境目のずらし（lib/phrase.ts の adjustBoundaries と同じ）
const OPENING = /[「『（(［[【〔〈《“‘｛{]/;
const CLOSING = /[」』）)］\]】〕〉》”’｝}、。，．・：；！？!?,.ー…]/;
const parseBoundaries = parser.parseBoundaries.bind(parser);
parser.parseBoundaries = (text) => {
  const out = [];
  for (let b of parseBoundaries(text)) {
    while (b > 0 && OPENING.test(text[b - 1])) b--;
    while (b < text.length && CLOSING.test(text[b])) b++;
    if (b > (out.at(-1) ?? 0) && b < text.length) out.push(b);
  }
  return out;
};
const JAPANESE = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;

// ページの中で、要素ごとの文字列と各行の始まりの位置（文字の番号）を集める
function collectLines({ selector, headingsSelector: HEADINGS_SELECTOR }) {
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
    // 文字が属する箱（ブロック・flex の子など）。箱の切れ目や <br> での行替えは折り返しではないので数えない
    const boxOf = (node) => {
      for (let e = node.parentElement; e && e !== el; e = e.parentElement) {
        if (getComputedStyle(e).display !== "inline") return e;
      }
      return el;
    };
    let prevBox = null;
    let prevNode = null;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const box = boxOf(node);
      // 前の文字列とのあいだに <br> があるか
      let hasBr = false;
      if (prevNode) {
        const range = document.createRange();
        range.setStartAfter(prevNode);
        range.setEndBefore(node);
        hasBr = !!range.cloneContents().querySelector?.("br");
      }
      if (prevBox && (box !== prevBox || hasBr)) lineBottom = null;
      prevBox = box;
      prevNode = node;
      // 読み上げ用に画面から隠した文字（sr-only・visually-hidden。1px に縮めてある）は数えない
      const parentRect = node.parentElement?.getBoundingClientRect();
      if (parentRect && (parentRect.width <= 1 || parentRect.height <= 1)) continue;
      for (let i = 0; i < node.data.length; i++) {
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        // 改行の直後の文字は、前の行の末尾にも幅0の矩形を持つことがあるので、幅のある最後の矩形を使う
        const charBox = [...range.getClientRects()].filter((r) => r.width > 0).at(-1);
        if (charBox && charBox.width > 0 && !/\s/.test(node.data[i])) {
          const middle = charBox.top + charBox.height / 2;
          if (lineBottom !== null && middle > lineBottom) starts.push(text.length);
          if (lineBottom === null || middle > lineBottom) lineBottom = charBox.bottom;
        }
        text += node.data[i];
      }
    }
    const heading = el.matches(HEADINGS_SELECTOR);
    results.push({ tag: el.tagName.toLowerCase(), heading, text, starts });
  }
  return results;
}

function analyze({ heading, text, starts }) {
  const problems = [];
  if (!JAPANESE.test(text) || text.length > (heading ? 120 : 80) || !starts.length) return problems;
  const boundaries = new Set();
  const phraseStarts = []; // 各文字が属する文節の始まり
  let offset = 0;
  for (const phrase of parser.parse(text)) {
    for (let i = 0; i < phrase.length; i++) phraseStarts.push(offset);
    boundaries.add((offset += phrase.length));
  }
  const lines = [];
  let prev = 0;
  let lastForced = false;
  for (const start of starts) {
    lines.push(text.slice(prev, start));
    // 空白・記号の前後での改行は問題にしない
    const before = text[start - 1];
    const after = text[start];
    // 行の頭から始まった文節が1行に収まらないときは、途中で折るしかない（はみ出さないための改行）
    const forced = phraseStarts[start] <= prev;
    lastForced = forced;
    if (!forced && !boundaries.has(start) && JAPANESE.test(before + after) && !/[\s、。・,.!?！？」』）)】〕〉》"”’]/.test(before)) {
      problems.push(`文節の途中で改行: ${text.slice(Math.max(0, start - 8), start)}｜${text.slice(start, start + 8)}`);
    }
    prev = start;
  }
  lines.push(text.slice(prev));
  const last = lines.at(-1).trim();
  if (lines.length > 1 && !lastForced && last.length <= 2 && JAPANESE.test(last)) problems.push(`最後の行が「${last}」だけ`);
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
      const elements = await page.evaluate(collectLines, { selector: SELECTOR, headingsSelector: HEADINGS.join(",") });
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
