import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import BlogCard from "@/components/BlogCard";
import { getBlogPosts } from "@/lib/notion";
import { BlogPost } from "@/types/notion";

export default async function Home() {
  // Notionからデータを取得（商品データは一時的に無効化）
  const blogPosts = await getBlogPosts(3);
  

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
              {blogPosts.map((post: BlogPost) => (
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

      {/* Products section temporarily disabled */}
      <section className="py-16 bg-gray-50">
        <div className="section-padding max-container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Products
            </h2>
            <p className="text-gray-600">商品機能は今後追加予定です</p>
          </div>
        </div>
      </section>
    </>
  );
}
