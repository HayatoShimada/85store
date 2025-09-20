import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import { getBlogPostsByCategory, getAllCategories } from "@/lib/notion";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({
    category: category.toLowerCase().replace(' ', '-'),
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryName = category.replace('-', ' ');
  const capitalizedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  
  return {
    title: `${capitalizedCategory} - 85-Store Blog`,
    description: `85-Storeの${capitalizedCategory}に関する記事一覧`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryName = category.replace('-', ' ');
  const capitalizedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  
  // 有効なカテゴリかどうかを確認
  const allCategories = await getAllCategories();
  const isValidCategory = allCategories.includes(capitalizedCategory);
  
  if (!isValidCategory) {
    notFound();
  }
  
  const blogPosts = await getBlogPostsByCategory(capitalizedCategory);

  if (blogPosts.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="section-padding max-container">
          <div className="text-center">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Link href="/blog" className="hover:text-primary transition-colors">
                  ブログ
                </Link>
                <span>›</span>
                <span className="text-primary font-semibold">{capitalizedCategory}</span>
              </div>
            </nav>

            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              {capitalizedCategory}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {capitalizedCategory}に関する記事をまとめました。
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="section-padding max-container">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-secondary mb-2">
              {capitalizedCategory}の記事 ({blogPosts.length}件)
            </h2>
            <p className="text-gray-600">
              最新の{capitalizedCategory}に関する記事をお届けします。
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
      <section className="py-16 bg-white">
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
            {[
              { name: "Fashion", label: "ファッション", color: "bg-pink-100 text-pink-800" },
              { name: "Life Style", label: "ライフスタイル", color: "bg-blue-100 text-blue-800" },
              { name: "Shop Info", label: "店舗情報", color: "bg-green-100 text-green-800" },
              { name: "Products", label: "商品", color: "bg-purple-100 text-purple-800" },
              { name: "Event", label: "イベント", color: "bg-orange-100 text-orange-800" },
            ]
            .filter(cat => cat.name !== capitalizedCategory)
            .map((category) => (
              <Link
                key={category.name}
                href={`/blog/category/${category.name.toLowerCase().replace(' ', '-')}`}
                className={`p-4 rounded-lg text-center transition-colors hover:opacity-80 ${category.color}`}
              >
                <div className="font-semibold">{category.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
