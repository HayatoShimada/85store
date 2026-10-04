import { cacheLife, cacheTag } from "next/cache";
import type { Banner, Blog, BlogPost } from "@/types/cms";

// 記事・バナーは CMS（85pi の Payload、cms/）が公開のたびに R2 へ書き出した JSON を読む。
//   posts/index.json   記事の一覧（本文なし・公開日の新しい順）
//   posts/<slug>.json  記事（本文の HTML 込み）
//   banners.json       バナー（並び順どおり）
// 85pi には一切アクセスしないので、85pi が止まっていてもビルドと表示は影響を受けない。
const CONTENT_URL = (process.env.CMS_CONTENT_URL || "https://media.85-store.com/content").replace(/\/$/, "");

// ブログ一覧の1ページあたりの件数
export const BLOG_PER_PAGE = 12;

// ---------------------------------------------------------------------------
// キャッシュ層
// 取得結果は "use cache" でキャッシュし、CMS からの通知（app/api/revalidate）で
// タグ（blogs / banners）単位で再検証する。cacheLife("days") は通知が届かなかった場合の保険。
//
// 取得エラーはあえて握りつぶさない。空の結果や404をキャッシュしてしまうより、
// ビルド失敗（直前のデプロイが残る）や再生成失敗（古いページが配信され続ける）の方が安全なため。
// ---------------------------------------------------------------------------

async function fetchJson<T>(path: string): Promise<T | null> {
  const res = await fetch(`${CONTENT_URL}/${path}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`CMS の ${path} を取得できません: ${res.status}`);
  return (await res.json()) as T;
}

async function loadIndex(): Promise<Blog[]> {
  "use cache";
  cacheTag("blogs");
  cacheLife("days");

  const data = await fetchJson<{ posts: Blog[] }>("posts/index.json");
  if (!data) throw new Error("CMS の posts/index.json がありません");
  return data.posts;
}

async function loadPost(slug: string): Promise<BlogPost | null> {
  "use cache";
  cacheTag("blogs");
  cacheLife("days");

  return fetchJson<BlogPost>(`posts/${encodeURIComponent(slug)}.json`);
}

async function loadBanners(): Promise<Banner[]> {
  "use cache";
  cacheTag("banners");
  cacheLife("days");

  const data = await fetchJson<{ banners: Banner[] }>("banners.json");
  if (!data) throw new Error("CMS の banners.json がありません");
  return data.banners;
}

// ---------------------------------------------------------------------------
// ブログ
// ---------------------------------------------------------------------------

// ブログ記事一覧（公開日の新しい順）
export async function getBlogPosts(limit?: number): Promise<Blog[]> {
  const posts = await loadIndex();
  return limit ? posts.slice(0, limit) : posts;
}

// ブログ記事一覧をページ単位で取得（1始まり）
export async function getBlogPostsPage(page: number): Promise<{ posts: Blog[]; totalPages: number }> {
  const all = await loadIndex();
  const start = (page - 1) * BLOG_PER_PAGE;
  return { posts: all.slice(start, start + BLOG_PER_PAGE), totalPages: Math.max(1, Math.ceil(all.length / BLOG_PER_PAGE)) };
}

// すべてのブログ記事（SSG・サイトマップ用）
export async function getAllBlogPosts(): Promise<Blog[]> {
  return loadIndex();
}

// URLのパス（スラッグ、または microCMS 時代のコンテンツID）から記事を取得
export async function getBlogPostByPath(path: string): Promise<BlogPost | null> {
  if (!/^[A-Za-z0-9_-]+$/.test(path)) return null;
  const posts = await loadIndex();
  const summary = posts.find((post) => post.slug === path) ?? posts.find((post) => post.id === path);
  return summary ? loadPost(summary.slug) : null;
}

// カテゴリ別のブログ記事
export async function getBlogPostsByCategory(categoryName: string, limit?: number): Promise<Blog[]> {
  const posts = (await loadIndex()).filter((post) => post.category.includes(categoryName));
  return limit ? posts.slice(0, limit) : posts;
}

// いずれかのカテゴリに入るブログ記事（ブログの区分のページ用）
export async function getBlogPostsByCategories(categoryNames: readonly string[]): Promise<Blog[]> {
  return (await loadIndex()).filter((post) => post.category.some((c) => categoryNames.includes(c)));
}

// タグ別のブログ記事
export async function getBlogPostsByTag(tag: string, limit?: number): Promise<Blog[]> {
  const posts = (await loadIndex()).filter((post) => post.tags.includes(tag));
  return limit ? posts.slice(0, limit) : posts;
}

// すべてのカテゴリ（記事から抽出）
export async function getAllCategories(): Promise<string[]> {
  return Array.from(new Set((await loadIndex()).flatMap((post) => post.category)));
}

// すべてのタグ（記事から抽出）
export async function getAllTags(): Promise<string[]> {
  return Array.from(new Set((await loadIndex()).flatMap((post) => post.tags)));
}

// 関連記事（同じカテゴリの新しい記事）
export async function getRelatedPosts(currentPostId: string, category?: string | null, limit: number = 3): Promise<Blog[]> {
  const posts = category ? await getBlogPostsByCategory(category) : await loadIndex();
  return posts.filter((post) => post.id !== currentPostId).slice(0, limit);
}

// ---------------------------------------------------------------------------
// バナー
// ---------------------------------------------------------------------------

export async function getBanners(): Promise<Banner[]> {
  return loadBanners();
}
