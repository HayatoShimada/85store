import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBlogPost, getBlogPosts, getRelatedPosts } from "@/lib/notion";
import { NotionRenderer } from "@/components/NotionRenderer";
import { NotionTableOfContents } from "@/components/NotionTableOfContents";
import { RelatedPosts } from "@/components/RelatedPosts";
import { getCategoryStyleClasses, getTagStyleClasses } from "@/utils/notionColors";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBlogPost(slug);
  
  if (!result || !result.page) {
    return {
      title: "記事が見つかりません - 85-Store",
    };
  }

  const { page } = result;
  const properties = (page as any).properties;
  const title = properties.Title?.title?.[0]?.text?.content || "";
  const excerpt = properties.Excerpt?.rich_text?.[0]?.text?.content || "";
  const coverImage = (page as any).cover?.file?.url || (page as any).cover?.external?.url || "";

  return {
    title: `${title} - 85-Store Blog`,
    description: excerpt,
    openGraph: {
      title,
      description: excerpt,
      images: coverImage ? [coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const result = await getBlogPost(slug);

  if (!result || !result.page) {
    notFound();
  }

  const { page, blocks } = result;
  
  // 関連記事を取得
  const relatedPosts = await getRelatedPosts(page.id, 3);

  const properties = (page as any).properties;
  const title = properties.Title?.title?.[0]?.text?.content || "";
  const excerpt = properties.Excerpt?.rich_text?.[0]?.text?.content || "";
  const date = properties.Date?.date?.start || "";
  const author = properties.Author?.multi_select?.map((author: unknown) => (author as any).name).join(', ') || "";
  const category = properties.Category?.multi_select?.map((category: unknown) => (category as any).name).join(', ') || "";
  const categoryColors = properties.Category?.multi_select?.map((category: unknown) => (category as any).color) || [];
  const tags = properties.Tags?.multi_select?.map((tag: unknown) => (tag as any).name) || [];
  const tagColors = properties.Tags?.multi_select?.map((tag: unknown) => (tag as any).color) || [];
  const coverImage = (page as any).cover?.file?.url || (page as any).cover?.external?.url || "";

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
              {category && (
                <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium border ${getCategoryStyleClasses(categoryColors)}`}>
                  {category}
                </span>
              )}
              <span>{new Date(date).toLocaleDateString('ja-JP')}</span>
              {author && (
                <span>by {author}</span>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-4 md:mb-6">
              {title}
            </h1>
            
            <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-4 md:mb-6">
              {excerpt}
            </p>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {tags.map((tag: string, index: number) => (
                  <span
                    key={tag}
                    className={`text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full ${getTagStyleClasses([tagColors[index] || 'default'])}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cover Image */}
          {coverImage && (
            <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 w-full mb-8 md:mb-12 md:rounded-lg overflow-hidden -mx-4 sm:mx-0">
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover"
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
              {/* Table of Contents */}
              <NotionTableOfContents blocks={blocks} />
              
              {/* Article Content */}
              <NotionRenderer blocks={blocks} />
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <RelatedPosts posts={relatedPosts} />
    </div>
  );
}
