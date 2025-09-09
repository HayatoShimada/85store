import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import { getBlogPostsByTag, getAllTags } from "@/lib/notion";

interface TagPageProps {
  params: {
    tag: string;
  };
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({
    tag: tag.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tagName = params.tag.replace(/-/g, ' ');
  const capitalizedTag = tagName.charAt(0).toUpperCase() + tagName.slice(1);
  
  return {
    title: `#${capitalizedTag} - 85-Store Blog`,
    description: `85-Storeの${capitalizedTag}タグが付いた記事一覧`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tagName = params.tag.replace(/-/g, ' ');
  const capitalizedTag = tagName.charAt(0).toUpperCase() + tagName.slice(1);
  
  const blogPosts = await getBlogPostsByTag(capitalizedTag);

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
                <span className="text-primary font-semibold">#{capitalizedTag}</span>
              </div>
            </nav>

            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              #{capitalizedTag}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {capitalizedTag}タグが付いた記事をまとめました。
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="section-padding max-container">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-secondary mb-2">
              #{capitalizedTag}の記事 ({blogPosts.length}件)
            </h2>
            <p className="text-gray-600">
              {capitalizedTag}に関連する記事をお届けします。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tags */}
      <section className="py-16 bg-white">
        <div className="section-padding max-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              人気のタグ
            </h2>
            <p className="text-gray-600">
              他のタグの記事もご覧ください
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "新商品", "入荷", "おすすめ", "セール", "イベント", 
              "スタイリング", "トレンド", "コーディネート", "アクセサリー", "アウター"
            ]
            .filter(tag => tag !== capitalizedTag)
            .map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-primary hover:text-white transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
