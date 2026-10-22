import { loadDefaultJapaneseParser } from "budoux";

// 日本語を文節（BudouX）で区切り、改行してよい位置に <wbr> を入れる（サーバー側で実行し、JS を増やさない）。
// word-break: keep-all（.ja-phrase）と組み合わせると、文節の途中で改行されない。
// Chrome は CSS の word-break: auto-phrase でも同じになるが、Safari は対応していないため。
// 文節で区切るのは見出し・短い文だけ（本文は文字単位の方が行末が揃う）。

const parser = loadDefaultJapaneseParser();
const JAPANESE = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;

// 禁則に合わせて文節の境目をずらす。BudouX は「火気使用（｜カセット」のように開きかっこの後ろで区切ることがあり、
// Safari は <wbr> を禁則より優先して行末に「（」を残すため。開きかっこの後ろ → 前へ、閉じかっこ・句読点の前 → 後ろへ。
// ショップのテーマ（assets/site-ja-linebreak.js）と scripts/check-ja-linebreaks.mjs も同じ
const OPENING = /[「『（(［[【〔〈《“‘｛{]/;
const CLOSING = /[」』）)］\]】〕〉》”’｝}、。，．・：；！？!?,.ー…]/;
export function adjustBoundaries(text: string, boundaries: number[]): number[] {
  const out: number[] = [];
  for (let b of boundaries) {
    while (b > 0 && OPENING.test(text[b - 1])) b--;
    while (b < text.length && CLOSING.test(text[b])) b++;
    if (b > (out.at(-1) ?? 0) && b < text.length) out.push(b);
  }
  return out;
}
const parseBoundaries = parser.parseBoundaries.bind(parser);
parser.parseBoundaries = (text: string) => adjustBoundaries(text, parseBoundaries(text));

// Safari は keep-all のとき、開きかっこの後ろでも改行してしまう（行末に「（」が残る）。
// 開きかっこと次の1文字を、改行しない組（.ja-nobr）にする
export const OPENING_PAIR = /([「『（(［[【〔〈《“‘｛{]+)([^\s「『（(［[【〔〈《“‘｛{<])/g;

export const hasJapanese = (text: string) => JAPANESE.test(text);

export function phrases(text: string): string[] {
  if (!JAPANESE.test(text)) return [text];
  return parser.parse(text);
}

// 文節で改行する短い文の長さ（これより長い段落は文字単位のまま。行末が揃う）
export const SHORT_TEXT_LENGTH = 80;

// HTML の見出し（h2〜h4）・写真の説明（figcaption）と、短い段落・箇条書き（p・li）の文字に <wbr> を入れる。
// 段落は <br> で区切った1行ずつが SHORT_TEXT_LENGTH 以下のときだけ（長い段落は文字単位のまま）
export function phraseShortTextHtml(html: string): string {
  return html.replace(
    /<(h[234]|figcaption|p|li)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi,
    (match, tag: string, attrs: string | undefined, inner: string) => {
      if (!JAPANESE.test(inner)) return match;
      if (/^(p|li)$/i.test(tag) && !isShortHtml(inner)) return match;
      // 全体が1つの文節でも、日本語なら keep-all で包む（語の途中で折れず、空白でだけ折れる）
      return `<${tag}${attrs ?? ""}><span class="ja-phrase">${phraseInnerHtml(inner)}</span></${tag}>`;
    },
  );
}

// ブロックを含まず、<br> で区切った1行ずつが短い
function isShortHtml(inner: string): boolean {
  if (/<(p|ul|ol|li|div|figure|table|h\d)\b/i.test(inner)) return false;
  return inner
    .split(/<br\s*\/?>/i)
    .every((line) => line.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, "x").trim().length <= SHORT_TEXT_LENGTH);
}

// タグを除いた文字全体で文節に分け（文節の境目がタグの境目と重なっても拾う）、その位置に <wbr> を入れる。
// タグ・文字参照（&amp; など）の中には入れない。<code> の中は触らない
export function phraseInnerHtml(html: string): string {
  if (!JAPANESE.test(html)) return html;
  // 文字参照は1文字（私用領域）に置き換えて数える
  const entities: string[] = [];
  const parts = html.split(/(<[^>]*>)/).map((part) =>
    part.startsWith("<")
      ? part
      : part.replace(/&(?:#\d+|#x[\da-f]+|[a-z][\da-z]*);/gi, (entity) => {
          entities.push(entity);
          return String.fromCharCode(0xe000 + entities.length - 1);
        }),
  );
  const text = parts.filter((part) => !part.startsWith("<")).join("");
  const boundaries = new Set<number>();
  let offset = 0;
  for (const phrase of parser.parse(text).slice(0, -1)) boundaries.add((offset += phrase.length));

  let position = 0;
  let inCode = 0;
  return parts
    .map((part) => {
      if (part.startsWith("<")) {
        if (/^<code\b/i.test(part)) inCode++;
        else if (/^<\/code>/i.test(part)) inCode = Math.max(0, inCode - 1);
        return part;
      }
      let out = "";
      for (const char of part) {
        if (position > 0 && boundaries.has(position) && !inCode) out += "<wbr>";
        out += char;
        position += char.length;
      }
      return inCode ? out : out.replace(OPENING_PAIR, '<span class="ja-nobr">$1$2</span>');
    })
    .join("")
    .replace(/[-]/g, (c) => entities[c.charCodeAt(0) - 0xe000] ?? c);
}
