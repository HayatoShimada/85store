import { Metadata } from "next";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import BlogCard from "@/components/BlogCard";
import FeaturedProducts from "@/components/FeaturedProducts";
import FeaturedBlogPosts from "@/components/FeaturedBlogPosts";
import StructuredData from "@/components/StructuredData";
import { getBlogPosts, getFeaturedBlogPosts, getFeaturedProducts, getBanners } from "@/lib/microcms";
import type { Blog } from "@/types/microcms";

export const metadata: Metadata = {
  title: "富山県南砺市井波の古着・セレクトショップ | 85-Store（ハコストア）",
  description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」。オーセンティックな古着とニューアイテムを提案するセレクトショップです。週末限定ストアとオンラインストアでお買い物をお楽しみください。",
  keywords: [
    "富山",
    "南砺市",
    "井波",
    "古着",
    "セレクトショップ",
    "85-Store",
    "ハコストア",
    "富山県",
    "古着屋",
    "セレクトショップ 富山",
    "古着 井波",
    "南砺市 古着",
    "オーセンティック",
    "ヴィンテージ",
  ],
};

export default async function Home() {
  // MicroCMSからデータを取得
  const [blogPosts, featuredBlogPosts, featuredProducts, banners] = await Promise.all([
    getBlogPosts(3),
    getFeaturedBlogPosts(),
    getFeaturedProducts(6),
    getBanners(),
  ]);

  return (
    <div className="section-bg-gradient">
      <StructuredData type="WebSite" />
      <HeroSection banners={banners} />

      {/* Featuredブログ記事 */}
      <FeaturedBlogPosts posts={featuredBlogPosts} />

      {/* 最新のブログ記事 */}
      <section className="py-16">
        <div className="section-padding max-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4 font-inter">
              Latest Posts
            </h2>
            <p className="text-gray-600">富山県南砺市井波の古着・セレクトショップ「85-Store」からのスタイリング情報とトレンドをお届けします</p>
          </div>

          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post: Blog) => (
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
