export interface TocItem {
  id: string;
  text: string;
  level: number;
}

// 記事HTMLのh2/h3にIDを付与し、目次データを抽出する（サーバー側で実行してCLSを防ぐ）
export function buildTableOfContents(html: string): { html: string; headings: TocItem[] } {
  const headings: TocItem[] = [];
  let counter = 0;

  const processed = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, level: string, attrs: string, inner: string) => {
      const text = decodeEntities(inner.replace(/<[^>]*>/g, "")).trim();
      if (!text) return match;

      const existingId = attrs.match(/\sid=["']([^"']+)["']/i)?.[1];
      const id = existingId || `blog-heading-${counter++}`;
      headings.push({ id, text, level: Number(level) });

      return existingId ? match : `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    }
  );

  return { html: processed, headings };
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}
