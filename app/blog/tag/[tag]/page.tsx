import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import { getAllTags, getBlogPostsByTag } from "@/lib/microcms";
import { nonEmptyParams } from "@/utils/static-params";

interface TagPageProps {
  params: Promise<{
    tag: string;
  }>;
}

export async function generateStaticParams() {
  // エンコードせずに返す（Next.jsが自動でエンコードする）
  return nonEmptyParams("tag", await getAllTags());
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

  return {
    title: `#${decodedTag} - 85-Store Blog`,
    description: `85-Storeの${decodedTag}タグが付いた記事一覧`,
    keywords: [
      "富山",
      "南砺市",
      "井波",
      "古着",
      "セレクトショップ",
      "85-Store",
      "ハコストア",
      "ブログ",
      decodedTag,
    ],
    openGraph: {
      type: "website",
      locale: "ja_JP",
      url: `${siteUrl}/blog/tag/${encodeURIComponent(decodedTag)}`,
      siteName: "85-Store（ハコストア）",
      title: `#${decodedTag} - 85-Store Blog`,
      description: `85-Storeの${decodedTag}タグが付いた記事一覧`,
      images: [
        {
          url: `${siteUrl}/logo.svg`,
          width: 1200,
          height: 630,
          alt: "85-Store（ハコストア）",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `#${decodedTag} - 85-Store Blog`,
      description: `85-Storeの${decodedTag}タグが付いた記事一覧`,
      images: [`${siteUrl}/logo.svg`],
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const blogPosts = await getBlogPostsByTag(decodedTag);

  if (blogPosts.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen section-bg-gradient">
      {/* Blog Section */}
      <section className="py-16">
        <div className="section-padding max-container">
          {/* Header */}
          <div className="text-center mb-8">
            <nav className="mb-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Link href="/blog" className="hover:text-primary transition-colors">
                  ブログ
                </Link>
                <span>›</span>
                <span className="text-primary font-semibold">#{decodedTag}</span>
              </div>
            </nav>

            <h1 className="text-3xl font-bold text-secondary mb-4">
              #{decodedTag}
            </h1>

            <p className="text-sm text-gray-600">
              {blogPosts.length}件の記事が見つかりました
            </p>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
