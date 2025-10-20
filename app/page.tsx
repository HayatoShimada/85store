import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import BlogCard from "@/components/BlogCard";
import FeaturedProducts from "@/components/FeaturedProducts";
import { getBlogPosts, getFeaturedProductMeta } from "@/lib/notion";
import { getProductsByHandles, isShopifyConfigured } from "@/lib/shopify";
import { BlogPost, Product } from "@/types/notion";

export default async function Home() {
  // Notionからデータを取得
  const blogPosts = await getBlogPosts(3);

  // Featured商品の取得: NotionからメタデータとShopifyから商品情報を統合
  let featuredProducts: Product[] = [];

  // Shopifyが設定されている場合のみ商品情報を取得
  if (isShopifyConfigured()) {
    try {
      const productMeta = await getFeaturedProductMeta(6);
      const handles = productMeta.map(meta => meta.shopifyHandle).filter(Boolean);

      if (handles.length > 0) {
        const shopifyProducts = await getProductsByHandles(handles);

        // NotionとShopifyのデータをマージ
        featuredProducts = productMeta
          .map(meta => {
            // handleOrId でマッチング（IDまたはハンドルで検索されたものを探す）
            const shopifyProduct = shopifyProducts.find(p => p.handleOrId === meta.shopifyHandle);
            if (!shopifyProduct) {
              return null;
            }

            return {
              id: meta.id,
              name: shopifyProduct.title,
              shopifyHandle: shopifyProduct.handle, // 実際のハンドルを使用
              category: meta.category,
              price: shopifyProduct.price,
              images: shopifyProduct.images,
              description: shopifyProduct.description,
              featured: meta.featured,
              status: "Active",
              createdAt: new Date().toISOString(),
            } as Product;
          })
          .filter((p): p is Product => p !== null);
      }
    } catch (error) {
      // エラーは静かに処理
    }
  }
  

  return (
    <div className="section-bg-gradient">
      <HeroSection />

      {/* 最新のブログ記事 */}
      <section className="py-16">
        <div className="section-padding max-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Latest Posts
            </h2>
            <p className="text-gray-600">Trend and Styling Information</p>
          </div>
          
          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post: BlogPost) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No blog posts yet</p>
          )}

          <div className="text-center mt-8">
            <Link href="/blog" className="btn-primary">
              See All Posts
            </Link>
          </div>
        </div>
      </section>

      {/* おすすめ商品セクション */}
      <FeaturedProducts products={featuredProducts} />
    </div>
  );
}
