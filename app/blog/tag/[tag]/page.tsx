import { Metadata } from "next";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import { getBlogPostsByTag } from "@/lib/microcms";

interface TagPageProps {
  params: Promise<{
    tag: string;
  }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return {
    title: `#${decodedTag} - 85-Store Blog`,
    description: `85-Storeの${decodedTag}タグが付いた記事一覧`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const blogPosts = await getBlogPostsByTag(decodedTag);

  return (
    <div className="min-h-screen section-bg-gradient">
      {/* Page Header */}
      <div className="section-padding max-container py-8 md:py-16">
        <div className="mb-8 md:mb-12">
          <nav className="mb-4 md:mb-6">
            <Link href="/blog" className="text-primary hover:text-primary/80 transition-colors text-sm md:text-base">
              ← ブログ一覧に戻る
            </Link>
          </nav>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary mb-4">
            #{decodedTag}
          </h1>

          <p className="text-gray-600">
            {blogPosts.length}件の記事が見つかりました
          </p>
        </div>

        {/* Posts Grid */}
        {blogPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {blogPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">このタグの記事はまだありません。</p>
          </div>
        )}
      </div>
    </div>
  );
}
