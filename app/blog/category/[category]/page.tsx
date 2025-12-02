import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import { getBlogPostsByCategory, getAllCategories } from "@/lib/microcms";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({
    category: encodeURIComponent(category),
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryName = decodeURIComponent(category);

  return {
    title: `${categoryName} - 85-Store Blog`,
    description: `85-Storeの${categoryName}に関する記事一覧`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryName = decodeURIComponent(category);

  const blogPosts = await getBlogPostsByCategory(categoryName);
  const allCategories = await getAllCategories();

  if (blogPosts.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen section-bg-gradient">
      {/* Hero Section */}
      <section className="py-20">
        <div className="section-padding max-container">
          <div className="text-center">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Link href="/blog" className="hover:text-primary transition-colors">
                  ブログ
                </Link>
                <span>›</span>
                <span className="text-primary font-semibold">{categoryName}</span>
              </div>
            </nav>

            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              {categoryName}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {categoryName}に関する記事をまとめました。
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="section-padding max-container">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-secondary mb-2">
              {categoryName}の記事 ({blogPosts.length}件)
            </h2>
            <p className="text-gray-600">
              最新の{categoryName}に関する記事をお届けします。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Other Categories */}
      {allCategories.length > 1 && (
        <section className="py-16">
          <div className="section-padding max-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary mb-4">
                他のカテゴリ
              </h2>
              <p className="text-gray-600">
                他のカテゴリの記事もご覧ください
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {allCategories
                .filter(cat => cat !== categoryName)
                .map((cat) => (
                  <Link
                    key={cat}
                    href={`/blog/category/${encodeURIComponent(cat)}`}
                    className="category-card text-gray-700"
                  >
                    <div className="font-semibold relative z-10">{cat}</div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
