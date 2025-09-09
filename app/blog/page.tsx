import { Metadata } from "next";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="section-padding max-container">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              Blog
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              85-Storeの最新情報、ファッション、ライフスタイルに関する記事をお届けします。
            </p>
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
      <section className="py-16 bg-white">
        <div className="section-padding max-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              カテゴリ
            </h2>
            <p className="text-gray-600">
              興味のあるカテゴリから記事を探してみてください
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category: string) => {
              const categoryConfigs: Record<string, { label: string; color: string }> = {
                "Fashion": { label: "ファッション", color: "bg-pink-100 text-pink-800" },
                "Life Style": { label: "ライフスタイル", color: "bg-blue-100 text-blue-800" },
                "Shop Info": { label: "店舗情報", color: "bg-green-100 text-green-800" },
                "Products": { label: "商品", color: "bg-purple-100 text-purple-800" },
                "Event": { label: "イベント", color: "bg-orange-100 text-orange-800" },
              };
              const categoryConfig = categoryConfigs[category] || { label: category, color: "bg-gray-100 text-gray-800" };

              return (
                <Link
                  key={category}
                  href={`/blog/category/${category.toLowerCase().replace(' ', '-')}`}
                  className={`p-4 rounded-lg text-center transition-colors hover:opacity-80 ${categoryConfig.color}`}
                >
                  <div className="font-semibold">{categoryConfig.label}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
