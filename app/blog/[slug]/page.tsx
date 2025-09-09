import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBlogPost, getBlogPosts } from "@/lib/notion";
import { NotionRenderer } from "@/components/NotionRenderer";
import { NotionTableOfContents } from "@/components/NotionTableOfContents";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const result = await getBlogPost(params.slug);
  
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
  const result = await getBlogPost(params.slug);

  if (!result || !result.page) {
    notFound();
  }

  const { page, blocks } = result;

  const properties = (page as any).properties;
  const title = properties.Title?.title?.[0]?.text?.content || "";
  const excerpt = properties.Excerpt?.rich_text?.[0]?.text?.content || "";
  const date = properties.Date?.date?.start || "";
  const author = properties.Author?.select?.name || "";
  const category = properties.Category?.select?.name || "";
  const tags = properties.Tags?.multi_select?.map((tag: unknown) => (tag as any).name) || [];
  const coverImage = (page as any).cover?.file?.url || (page as any).cover?.external?.url || "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Article Header */}
      <article className="bg-white">
        <div className="section-padding max-container py-16">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link href="/blog" className="text-primary hover:text-primary/80 transition-colors">
              ← ブログ一覧に戻る
            </Link>
          </nav>

          {/* Article Meta */}
          <div className="mb-8">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span>{new Date(date).toLocaleDateString('ja-JP')}</span>
              <span className="text-primary font-semibold">{category}</span>
              <span>by {author}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              {title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-6">
              {excerpt}
            </p>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cover Image */}
          {coverImage && (
            <div className="relative h-64 md:h-96 w-full mb-12 rounded-lg overflow-hidden">
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
      <section className="py-16">
        <div className="section-padding max-container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
              {/* Table of Contents */}
              <NotionTableOfContents blocks={blocks} />
              
              {/* Article Content */}
              <NotionRenderer blocks={blocks} />
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-16 bg-white">
        <div className="section-padding max-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              関連記事
            </h2>
            <p className="text-gray-600">
              同じカテゴリの他の記事もご覧ください
            </p>
          </div>
          
          {/* ここに関連記事の表示を追加予定 */}
          <div className="text-center text-gray-500">
            <p>関連記事の表示機能は今後追加予定です</p>
          </div>
        </div>
      </section>
    </div>
  );
}
