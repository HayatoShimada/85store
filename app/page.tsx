import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import BlogCard from "@/components/BlogCard";
import ProductCard from "@/components/ProductCard";
import { getBlogPosts, getFeaturedProducts, getLatestProducts } from "@/lib/notion";

export default async function Home() {
  // Notionからデータを取得（商品データは一時的に無効化）
  const blogPosts = await getBlogPosts(3);
  const featuredProducts: any[] = [];
  const latestProducts: any[] = [];

  return (
    <>
      <HeroSection />

      {/* 最新のブログ記事 */}
      <section className="py-16 bg-gray-50">
        <div className="section-padding max-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Latest Posts
            </h2>
            <p className="text-gray-600">Trend and Styling Information</p>
          </div>
          
          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No blog posts yet</p>
          )}

          <div className="text-center mt-8">
            <Link href="/blog" className="btn-outline">
              See All Posts
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="section-padding max-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Featured Products
              </h2>
              <p className="text-gray-600">Staff-selected recommended items</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 新着商品 */}
      <section className="py-16 bg-gray-50">
        <div className="section-padding max-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              New Products
            </h2>
            <p className="text-gray-600">Check out the latest items</p>
          </div>
          
          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No products yet</p>
          )}

          <div className="text-center mt-8">
            <Link href="/products" className="btn-primary">
              See All Products
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
