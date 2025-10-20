import { Metadata } from "next";
import BlogCard from "@/components/BlogCard";
import { CategorySection } from "@/components/CategorySection";
import { getBlogPosts, getAllCategories } from "@/lib/notion";

export const metadata: Metadata = {
  title: "Blog - 85-Store",
  description: "85-Storeのブログ記事一覧",
};

export default async function BlogPage() {
  const [blogPosts, categories] = await Promise.all([
    getBlogPosts(),
    getAllCategories()
  ]);

  return (
    <div className="min-h-screen section-bg-gradient">
      {/* Hero Section */}
      <section className="py-20">
        <div className="section-padding max-container">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              Blog
            </h1>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="section-padding max-container">
          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                まだ記事がありません
              </h3>
              <p className="text-gray-500">
                新しい記事をお待ちください。
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <CategorySection categories={categories} />
    </div>
  );
}
