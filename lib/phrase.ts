import { loadDefaultJapaneseParser } from "budoux";

// 日本語を文節（BudouX）で区切り、改行してよい位置に <wbr> を入れる（サーバー側で実行し、JS を増やさない）。
// word-break: keep-all（.ja-phrase）と組み合わせると、文節の途中で改行されない。
// Chrome は CSS の word-break: auto-phrase でも同じになるが、Safari は対応していないため。
// 文節で区切るのは見出し・短い文だけ（本文は文字単位の方が行末が揃う）。

const parser = loadDefaultJapaneseParser();
const JAPANESE = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;

export const hasJapanese = (text: string) => JAPANESE.test(text);

export function phrases(text: string): string[] {
  if (!JAPANESE.test(text)) return [text];
  return parser.parse(text);
}

// HTML の見出し（h2〜h4）と写真の説明（figcaption）の中の文字だけに <wbr> を入れる。段落はそのまま
export function phraseHeadingsHtml(html: string): string {
  return html.replace(
    /<(h[234]|figcaption)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi,
    (match, tag: string, attrs: string | undefined, inner: string) => {
      // 全体が1つの文節でも、日本語なら keep-all で包む（語の途中で折れず、空白でだけ折れる）
      if (!JAPANESE.test(inner)) return match;
      return `<${tag}${attrs ?? ""}><span class="ja-phrase">${phraseInnerHtml(inner)}</span></${tag}>`;
    },
  );
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
      return out;
    })
    .join("")
    .replace(/[-]/g, (c) => entities[c.charCodeAt(0) - 0xe000] ?? c);
}
