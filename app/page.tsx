import Link from "next/link";
import fs from "fs";
import path from "path";
import HeroSection from "@/components/HeroSection";
import BlogCard from "@/components/BlogCard";
import FeaturedProducts from "@/components/FeaturedProducts";
import FeaturedBlogPosts from "@/components/FeaturedBlogPosts";
import { getBlogPosts, getFeaturedProductMeta } from "@/lib/notion";
import { getProductsByHandles, isShopifyConfigured } from "@/lib/shopify";
import { BlogPost, Product } from "@/types/notion";

// ビルド時にheroフォルダ内の画像を動的に取得
function getHeroImages(): string[] {
  const heroDir = path.join(process.cwd(), "public", "hero");
  
  try {
    const files = fs.readdirSync(heroDir);
    // 画像ファイルのみをフィルタリング（jpg, jpeg, png, gif, webp）
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
    // /hero/ファイル名 の形式で返す
    return imageFiles.map(file => `/hero/${file}`).sort();
  } catch (error) {
    console.error("Error reading hero images:", error);
    return [];
  }
}

export default async function Home() {
  // Notionからデータを取得
  const blogPosts = await getBlogPosts(3);
  
  // Featuredブログ投稿を取得（Tagsに"Featured"または"⭐ Featured"が含まれるもの）
  const allBlogPosts = await getBlogPosts(100);
  const featuredBlogPosts = allBlogPosts.filter((post) =>
    post.featured === true
  );

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
  

  // Hero画像を取得
  const heroImages = getHeroImages();

  return (
    <div className="section-bg-gradient">
      <HeroSection images={heroImages} />

      {/* Featuredブログ記事 */}
      <FeaturedBlogPosts posts={featuredBlogPosts} />

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
