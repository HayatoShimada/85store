import { createClient } from "microcms-js-sdk";
import type { Blog, Product, Category, Banner } from "@/types/microcms";

// MicroCMSクライアントの作成
export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "",
  apiKey: process.env.MICROCMS_API_KEY || "",
});

// ブログ記事一覧を取得
export async function getBlogPosts(limit?: number): Promise<Blog[]> {
  try {
    const response = await client.getList<Blog>({
      endpoint: "blogs",
      queries: {
        limit: limit || 100,
        orders: "-publishedAt",
      },
    });

    return response.contents;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

// 単一のブログ記事を取得（idで取得）
export async function getBlogPost(id: string): Promise<Blog | null> {
  try {
    const blog = await client.get<Blog>({
      endpoint: "blogs",
      contentId: id,
    });

    return blog;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

// カテゴリ別のブログ記事を取得
export async function getBlogPostsByCategory(categoryName: string, limit?: number): Promise<Blog[]> {
  try {
    const response = await client.getList<Blog>({
      endpoint: "blogs",
      queries: {
        limit: limit || 100,
        orders: "-publishedAt",
        filters: `category[contains]${categoryName}`,
      },
    });

    return response.contents;
  } catch (error) {
    console.error("Error fetching blog posts by category:", error);
    return [];
  }
}

// タグ別のブログ記事を取得
export async function getBlogPostsByTag(tag: string, limit?: number): Promise<Blog[]> {
  try {
    const response = await client.getList<Blog>({
      endpoint: "blogs",
      queries: {
        limit: limit || 100,
        orders: "-publishedAt",
        filters: `tags[contains]${tag}`,
      },
    });

    return response.contents;
  } catch (error) {
    console.error("Error fetching blog posts by tag:", error);
    return [];
  }
}

// すべてのカテゴリを取得（ブログ記事から抽出）
export async function getAllCategories(): Promise<string[]> {
  try {
    const response = await client.getList<Blog>({
      endpoint: "blogs",
      queries: {
        limit: 100,
        fields: "category",
      },
    });

    // 全記事のカテゴリを収集してユニークな値を返す
    const categories = new Set<string>();
    response.contents.forEach((blog) => {
      blog.category?.forEach((cat) => categories.add(cat));
    });

    return Array.from(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// 関連記事を取得
export async function getRelatedPosts(currentPostId: string, category?: string | null, limit: number = 3): Promise<Blog[]> {
  try {
    const queries: Record<string, unknown> = {
      limit: limit + 1,
      orders: "-publishedAt",
    };

    if (category) {
      queries.filters = `category[contains]${category}`;
    }

    const response = await client.getList<Blog>({
      endpoint: "blogs",
      queries,
    });

    return response.contents
      .filter((blog) => blog.id !== currentPostId)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching related posts:", error);
    return [];
  }
}

// おすすめブログ記事を取得
export async function getFeaturedBlogPosts(limit?: number): Promise<Blog[]> {
  try {
    const response = await client.getList<Blog>({
      endpoint: "blogs",
      queries: {
        limit: limit || 100,
        orders: "-publishedAt",
        filters: "featured[equals]true",
      },
    });

    return response.contents;
  } catch (error) {
    console.error("Error fetching featured blog posts:", error);
    return [];
  }
}

// 商品一覧を取得
export async function getProducts(options?: { featured?: boolean; limit?: number }): Promise<Product[]> {
  try {
    const queries: Record<string, unknown> = {
      limit: options?.limit || 100,
      orders: "-createdAt",
    };

    if (options?.featured) {
      queries.filters = "featured[equals]true";
    }

    const response = await client.getList<Product>({
      endpoint: "products",
      queries,
    });

    return response.contents;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// おすすめ商品を取得
export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  return getProducts({ featured: true, limit });
}

// 最新商品を取得
export async function getLatestProducts(limit: number = 4): Promise<Product[]> {
  return getProducts({ limit });
}

// おすすめ商品のメタデータを取得（Shopify連携用）
export async function getFeaturedProductMeta(limit: number = 6): Promise<Product[]> {
  try {
    const response = await client.getList<Product>({
      endpoint: "products",
      queries: {
        limit,
        orders: "-createdAt",
        filters: "featured[equals]true",
      },
    });

    return response.contents;
  } catch (error) {
    console.error("Error fetching featured product meta:", error);
    return [];
  }
}

// バナー一覧を取得
export async function getBanners(): Promise<Banner[]> {
  try {
    const response = await client.getList<Banner>({
      endpoint: "banners",
      queries: {
        limit: 10,
        orders: "order",
      },
    });

    return response.contents;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}
