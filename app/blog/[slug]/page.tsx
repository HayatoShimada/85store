import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBlogPost, getBlogPosts, getRelatedPosts } from "@/lib/microcms";
import { RelatedPosts } from "@/components/RelatedPosts";
import { TableOfContents } from "@/components/TableOfContents";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.id,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "記事が見つかりません - 85-Store",
    };
  }

  const description = post.description || post.excerpt || extractExcerpt(post.content);
  const coverImageUrl = post.eyecatch?.url;

  return {
    title: `${post.title} - 85-Store Blog`,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      images: coverImageUrl ? [coverImageUrl] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
      images: coverImageUrl ? [coverImageUrl] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // カテゴリ（配列の最初の要素を使用）
  const primaryCategory = post.category?.[0] || null;

  // 関連記事を取得
  const relatedPosts = await getRelatedPosts(post.id, primaryCategory, 3);

  const displayDescription = post.description || post.excerpt || extractExcerpt(post.content);
  const coverImage = post.eyecatch?.url;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Article Header */}
      <article className="bg-white">
        <div className="px-4 sm:px-6 lg:px-8 max-container py-8 md:py-16">
          {/* Breadcrumb */}
          <nav className="mb-6 md:mb-8">
            <Link href="/blog" className="text-primary hover:text-primary/80 transition-colors text-sm md:text-base">
              ← ブログ一覧に戻る
            </Link>
          </nav>

          {/* Article Meta */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500 mb-4">
              {primaryCategory && (
                <Link
                  href={`/blog/category/${encodeURIComponent(primaryCategory)}`}
                  className="px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium border bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 transition-colors"
                >
                  {primaryCategory}
                </Link>
              )}
              <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('ja-JP')}</span>
              {post.author && (
                <span>by {post.author}</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-4 md:mb-6">
              {post.title}
            </h1>

            <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-4 md:mb-6">
              {displayDescription}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${encodeURIComponent(tag)}`}
                    className="text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-gray-100 text-gray-600 hover:opacity-80 transition-opacity inline-block"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Cover Image */}
          {coverImage && (
            <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 w-full mb-8 md:mb-12 md:rounded-lg overflow-hidden -mx-4 sm:mx-0">
              <Image
                src={coverImage}
                alt={post.title}
                fill
                className="object-cover object-center"
                priority
              />
            </div>
          )}
        </div>
      </article>

      {/* Article Content */}
      <section className="py-8 md:py-16">
        <div className="md:section-padding md:max-container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white md:rounded-lg md:shadow-lg p-4 sm:p-6 md:p-12">
              {/* 目次 */}
              <TableOfContents html={post.content} />

              {/* MicroCMS HTML Content */}
              <div
                id="blog-content"
                className="prose prose-lg max-w-none
                  prose-headings:text-secondary prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
                  prose-h3:text-xl prose-h3:mt-12 prose-h3:mb-4
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
                  prose-img:rounded-lg prose-img:shadow-md prose-img:my-8
                  prose-ul:my-6 prose-ol:my-6
                  prose-li:text-gray-700
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:my-8
                  prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                  prose-pre:bg-gray-900 prose-pre:text-gray-100
                  prose-figure:my-8"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <RelatedPosts posts={relatedPosts} />
    </div>
  );
}

function extractExcerpt(html: string, maxLength: number = 160): string {
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
