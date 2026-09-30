import { createClient, type MicroCMSQueries } from "microcms-js-sdk";
import { cacheLife, cacheTag } from "next/cache";
import type { Blog, Product, Banner } from "@/types/microcms";

// MicroCMSクライアントの作成
const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN || "";
const apiKey = process.env.MICROCMS_API_KEY || "";

export const client = serviceDomain && apiKey ? createClient({
  serviceDomain,
  apiKey,
}) : null;

// ブログ一覧の1ページあたりの件数
export const BLOG_PER_PAGE = 12;

type Endpoint = "blogs" | "products" | "banners";

// ---------------------------------------------------------------------------
// キャッシュ層
// 取得結果は "use cache" でキャッシュし、microCMSのWebhook（app/api/revalidate）から
// エンドポイント名のタグ（blogs / products / banners）単位で再検証する。
// cacheLife("days") はWebhookが届かなかった場合の保険。
// エラーは投げたままにしてキャッシュさせず、下の公開関数でフォールバックする。
// ---------------------------------------------------------------------------

async function cachedGetList<T>(endpoint: Endpoint, queries: MicroCMSQueries) {
  "use cache";
  cacheTag(endpoint);
  cacheLife("days");

  if (!client) return { contents: [] as T[], totalCount: 0 };
  const { contents, totalCount } = await client.getList<T>({ endpoint, queries });
  return { contents, totalCount };
}

async function cachedGet<T>(endpoint: Endpoint, contentId: string): Promise<T | null> {
  "use cache";
  cacheTag(endpoint);
  cacheLife("days");

  if (!client) return null;
  try {
    return await client.get<T>({ endpoint, contentId });
  } catch (error) {
    // 存在しないIDは正常系（スラッグでの再検索やnotFoundにつなげる）
    if (error instanceof Error && error.message.includes("response status: 404")) return null;
    throw error;
  }
}

async function getListOrEmpty<T>(endpoint: Endpoint, queries: MicroCMSQueries, label: string) {
  if (!client) {
    console.warn("MicroCMS client is not initialized");
    return { contents: [] as T[], totalCount: 0 };
  }
  try {
    return await cachedGetList<T>(endpoint, queries);
  } catch (error) {
    console.error(`Error fetching ${label}:`, error);
    return { contents: [] as T[], totalCount: 0 };
  }
}

// ---------------------------------------------------------------------------
// ブログ
// ---------------------------------------------------------------------------

// ブログ記事一覧を取得
export async function getBlogPosts(limit?: number): Promise<Blog[]> {
  const { contents } = await getListOrEmpty<Blog>("blogs", {
    limit: limit || 100,
    orders: "-publishedAt",
  }, "blog posts");
  return contents;
}

// ブログ記事一覧をページ単位で取得（1始まり）
export async function getBlogPostsPage(page: number): Promise<{ posts: Blog[]; totalPages: number }> {
  const { contents, totalCount } = await getListOrEmpty<Blog>("blogs", {
    limit: BLOG_PER_PAGE,
    offset: (page - 1) * BLOG_PER_PAGE,
    orders: "-publishedAt",
  }, "blog posts page");
  return { posts: contents, totalPages: Math.max(1, Math.ceil(totalCount / BLOG_PER_PAGE)) };
}

// すべてのブログ記事を取得（ページネーション対応、SSG用）
// fieldsを指定すると取得する項目を絞れる（例: "id,updatedAt"）
export async function getAllBlogPosts(fields?: string): Promise<Blog[]> {
  const allPosts: Blog[] = [];
  const limit = 100;
  let offset = 0;
  let totalCount = Infinity;

  while (offset < totalCount) {
    const response = await getListOrEmpty<Blog>("blogs", {
      limit,
      offset,
      orders: "-publishedAt",
      ...(fields && { fields }),
    }, "all blog posts");
    if (response.contents.length === 0) break;

    allPosts.push(...response.contents);
    totalCount = response.totalCount;
    offset += limit;
  }

  return allPosts;
}

// URLのパス（スラッグまたはコンテンツID）から記事を取得
// 旧URL（コンテンツID）でもたどり着けるよう、IDで見つからなければスラッグで探す
export async function getBlogPostByPath(path: string): Promise<Blog | null> {
  if (!client) {
    console.warn("MicroCMS client is not initialized");
    return null;
  }
  try {
    const byId = await cachedGet<Blog>("blogs", path);
    if (byId) return byId;

    const { contents } = await cachedGetList<Blog>("blogs", {
      limit: 1,
      filters: `slug[equals]${path}`,
    });
    return contents[0] ?? null;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

// カテゴリ別のブログ記事を取得
export async function getBlogPostsByCategory(categoryName: string, limit?: number): Promise<Blog[]> {
  const { contents } = await getListOrEmpty<Blog>("blogs", {
    limit: limit || 100,
    orders: "-publishedAt",
    filters: `category[contains]${categoryName}`,
  }, "blog posts by category");
  return contents;
}

// タグ別のブログ記事を取得
export async function getBlogPostsByTag(tag: string, limit?: number): Promise<Blog[]> {
  const { contents } = await getListOrEmpty<Blog>("blogs", {
    limit: limit || 100,
    orders: "-publishedAt",
    filters: `tags[contains]${tag}`,
  }, "blog posts by tag");
  return contents;
}

// すべてのカテゴリを取得（ブログ記事から抽出）
export async function getAllCategories(): Promise<string[]> {
  const posts = await getAllBlogPosts("category");
  return Array.from(new Set(posts.flatMap((post) => post.category ?? [])));
}

// すべてのタグを取得（ブログ記事から抽出）
export async function getAllTags(): Promise<string[]> {
  const posts = await getAllBlogPosts("tags");
  return Array.from(new Set(posts.flatMap((post) => post.tags ?? [])));
}

// 関連記事を取得
export async function getRelatedPosts(currentPostId: string, category?: string | null, limit: number = 3): Promise<Blog[]> {
  const { contents } = await getListOrEmpty<Blog>("blogs", {
    limit: limit + 1,
    orders: "-publishedAt",
    ...(category && { filters: `category[contains]${category}` }),
  }, "related posts");
  return contents.filter((blog) => blog.id !== currentPostId).slice(0, limit);
}

// おすすめブログ記事を取得
export async function getFeaturedBlogPosts(limit?: number): Promise<Blog[]> {
  const { contents } = await getListOrEmpty<Blog>("blogs", {
    limit: limit || 100,
    orders: "-publishedAt",
    filters: "featured[equals]true",
  }, "featured blog posts");
  return contents;
}

// ---------------------------------------------------------------------------
// 商品・バナー
// ---------------------------------------------------------------------------

// おすすめ商品を取得
export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  const { contents } = await getListOrEmpty<Product>("products", {
    limit,
    orders: "-createdAt",
    filters: "featured[equals]true",
  }, "featured products");
  return contents;
}

// バナー一覧を取得
export async function getBanners(): Promise<Banner[]> {
  const { contents } = await getListOrEmpty<Banner>("banners", {
    limit: 10,
    orders: "order",
  }, "banners");
  return contents;
}
