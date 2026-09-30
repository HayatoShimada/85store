// note.com RSSフィードから記事を取得
import { cacheLife, cacheTag } from "next/cache";

export interface NoteArticle {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  thumbnail?: string;
  excerpt?: string;
}

// RSSフィードをパースして記事を取得（1時間キャッシュ）
// noteは補助的なコンテンツなので、取得に失敗してもビルドやページを止めず、
// 空配列を数分だけキャッシュして次の取得を早めに試す
export async function getNoteArticles(): Promise<NoteArticle[]> {
  "use cache";
  cacheTag("note");

  try {
    const response = await fetch("https://note.com/85_store/rss");
    if (!response.ok) {
      throw new Error(`Failed to fetch note RSS feed: ${response.status}`);
    }
    const articles = parseRssFeed(await response.text());
    cacheLife("hours");
    return articles;
  } catch (error) {
    console.error("Error fetching note articles:", error);
    cacheLife("minutes");
    return [];
  }
}

// XMLをパースして記事情報を抽出
function parseRssFeed(xml: string): NoteArticle[] {
  const articles: NoteArticle[] = [];

  // <item>タグを抽出
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];

    // 各フィールドを抽出
    const title = extractTag(itemContent, "title");
    const link = extractTag(itemContent, "link");
    const pubDate = extractTag(itemContent, "pubDate");
    const description = extractTag(itemContent, "description");

    // media:thumbnailまたはenclosureからサムネイルを取得
    const thumbnail = extractMediaThumbnail(itemContent) || extractEnclosureUrl(itemContent);

    if (title && link) {
      // URLからIDを生成
      const id = link.split("/").pop() || link;

      articles.push({
        id: `note-${id}`,
        title: decodeHtmlEntities(title),
        url: link,
        publishedAt: toIsoDate(pubDate),
        thumbnail,
        excerpt: description ? cleanDescription(description) : undefined,
      });
    }
  }

  return articles;
}

// RSSの日付（RFC 822形式）をISO形式に変換する（パースできなければ現在時刻）
function toIsoDate(pubDate: string | undefined): string {
  const date = pubDate ? new Date(pubDate) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

// XMLタグの内容を抽出
function extractTag(content: string, tagName: string): string | undefined {
  // CDATAセクションを含むパターン
  const cdataRegex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`, "i");
  const cdataMatch = content.match(cdataRegex);
  if (cdataMatch) {
    return cdataMatch[1].trim();
  }

  // 通常のタグパターン
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = content.match(regex);
  return match ? match[1].trim() : undefined;
}

// media:thumbnailの内容またはURL属性を抽出
function extractMediaThumbnail(content: string): string | undefined {
  // まず閉じタグがある形式を試す: <media:thumbnail>URL</media:thumbnail>
  const contentRegex = /<media:thumbnail[^>]*>([^<]+)<\/media:thumbnail>/i;
  const contentMatch = content.match(contentRegex);
  if (contentMatch) {
    return contentMatch[1].trim();
  }

  // URL属性形式も試す: <media:thumbnail url="..."/>
  const attrRegex = /<media:thumbnail[^>]*url=["']([^"']+)["'][^>]*\/?>/i;
  const attrMatch = content.match(attrRegex);
  return attrMatch ? attrMatch[1] : undefined;
}

// enclosureのURL属性を抽出
function extractEnclosureUrl(content: string): string | undefined {
  const regex = /<enclosure[^>]*url=["']([^"']+)["'][^>]*\/?>/i;
  const match = content.match(regex);
  return match ? match[1] : undefined;
}

// HTMLエンティティをデコード
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

// descriptionをクリーンアップ
function cleanDescription(description: string): string {
  // HTMLタグを削除
  let text = description.replace(/<[^>]*>/g, "");
  // HTMLエンティティをデコード
  text = decodeHtmlEntities(text);
  // 空白を正規化
  text = text.replace(/\s+/g, " ").trim();
  // 長すぎる場合は切り詰め
  if (text.length > 150) {
    text = text.substring(0, 150) + "...";
  }
  return text;
}
