import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBlogPostByPath, getAllBlogPosts, getRelatedPosts } from "@/lib/cms";
import BlogCard, { BlogCardGrid } from "@/components/BlogCard";
import ImageLightbox from "@/components/ImageLightbox";
import SectionHeading from "@/components/SectionHeading";
import StructuredData from "@/components/StructuredData";
import { TableOfContents } from "@/components/TableOfContents";
import { buildTableOfContents } from "@/lib/toc";
import { optimizeContentImages } from "@/lib/content-images";
import { largestFromSrcset } from "@/lib/cms-image";
import { formatDate } from "@/utils/date";
import { getBlogPostPath, getCategoryListPath } from "@/utils/blog";
import { nonEmptyParams } from "@/utils/static-params";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  // エンコードせずに返す（Next.jsが自動でエンコードする）
  return nonEmptyParams("slug", posts.map((post) => post.slug));
}

// URLのパラメータ（日本語はエンコードされて届く）から記事を取得
async function getPost(params: BlogPostPageProps["params"]) {
  const { slug } = await params;
  const path = decodeURIComponent(slug);
  return { path, post: await getBlogPostByPath(path) };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { post } = await getPost(params);

  if (!post) {
    return {
      title: "記事が見つかりません - 85-Store",
    };
  }

  const description = post.description || post.excerpt || extractExcerpt(post.content);
  const coverImageUrl = post.eyecatch?.url;
  const primaryCategory = post.category?.[0] || null;
  const publishedTime = post.publishedAt || post.createdAt;
  const modifiedTime = post.updatedAt || post.publishedAt || post.createdAt;

  return {
    title: post.title,
    description: description,
    alternates: {
      canonical: getBlogPostPath(post),
    },
    keywords: [
      "富山",
      "南砺市",
      "井波",
      "古着",
      "セレクトショップ",
      "85-Store",
      "ハコストア",
      "ブログ",
      ...(primaryCategory ? [primaryCategory] : []),
      ...(post.tags || []),
    ],
    authors: post.author ? [{ name: post.author }] : undefined,
    openGraph: {
      type: 'article',
      locale: "ja_JP",
      url: `${siteUrl}${getBlogPostPath(post)}`,
      siteName: "85-Store（ハコストア）",
      title: post.title,
      description: description,
      images: coverImageUrl ? [coverImageUrl] : undefined,
      publishedTime: publishedTime ? new Date(publishedTime).toISOString() : undefined,
      modifiedTime: modifiedTime ? new Date(modifiedTime).toISOString() : undefined,
      authors: post.author ? [post.author] : undefined,
      section: primaryCategory || undefined,
      tags: post.tags || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
      images: coverImageUrl ? [coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { path, post } = await getPost(params);

  if (!post) {
    notFound();
  }

  // 旧URL（コンテンツID）でアクセスされたら、スラッグのURLへ恒久リダイレクト
  if (post.slug && path !== post.slug) {
    permanentRedirect(getBlogPostPath(post));
  }

  const primaryCategory = post.category?.[0] || null;
  const relatedPosts = await getRelatedPosts(post.id, primaryCategory, 3);

  const eyecatch = post.eyecatch;
  const publishedAt = post.publishedAt || post.createdAt;
  const modifiedAt = post.updatedAt || publishedAt;
  const { html: contentHtml, headings } = buildTableOfContents(optimizeContentImages(post.content));
  const postUrl = `${siteUrl}${getBlogPostPath(post)}`;

  return (
    <>
      <StructuredData
        type="BlogPosting"
        data={{
          headline: post.title,
          description: post.description || post.excerpt || extractExcerpt(post.content),
          url: postUrl,
          mainEntityOfPage: postUrl,
          datePublished: new Date(publishedAt).toISOString(),
          dateModified: new Date(modifiedAt).toISOString(),
          ...(eyecatch && { image: eyecatch.url }),
          author: post.author
            ? { "@type": "Person", name: post.author }
            : { "@id": `${siteUrl}/#organization` },
        }}
      />
      <StructuredData
        type="BreadcrumbList"
        data={{
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "ブログ", item: `${siteUrl}/blog` },
            { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
          ],
        }}
      />

      <article className="wrap">
        {/* タイトルとアイキャッチ（アイキャッチは比率を保ったまま高さの上限まで縮める） */}
        <header className={`grid-lines mt-8 ${eyecatch ? "grid-cols-[minmax(0,7fr)_minmax(0,5fr)] max-[800px]:grid-cols-1" : ""}`}>
          <div className="grid content-between gap-12 p-[clamp(20px,3.5vw,48px)] max-[800px]:gap-6">
            <nav aria-label="パンくずリスト" className="text-sm text-muted">
              <Link href="/blog" className="text-ink underline underline-offset-4">ブログ</Link>
              {primaryCategory && (
                <>
                  <span aria-hidden="true">　／　</span>
                  <Link href={getCategoryListPath(primaryCategory)} className="underline underline-offset-4">
                    {primaryCategory}
                  </Link>
                </>
              )}
            </nav>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{post.title}</h1>
              <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
                <time dateTime={publishedAt} className="num">{formatDate(publishedAt)}</time>
                {post.author && <span>{post.author}</span>}
              </p>
              {post.tags && post.tags.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <li key={tag}>
                      <Link href={`/blog/tag/${encodeURIComponent(tag)}`} className="chip">#{tag}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {eyecatch && (
            <figure className="grid place-items-center bg-surface p-6 max-[800px]:order-first">
              <button
                type="button"
                className="image-zoom grid place-items-center"
                data-zoom-src={largestFromSrcset(eyecatch.webp) ?? eyecatch.url}
                aria-label="アイキャッチ画像を拡大表示"
              >
                <Image
                  src={eyecatch.url}
                  alt=""
                  width={eyecatch.width ?? 1200}
                  height={eyecatch.height ?? 1200}
                  sizes="(max-width: 800px) 100vw, 42vw"
                  priority
                  className="h-auto max-h-[60vh] w-auto max-w-full max-[800px]:max-h-[52vh]"
                />
              </button>
            </figure>
          )}
        </header>

        <div className="mt-16">
          <div className="mx-auto max-w-[40em]">
            <TableOfContents headings={headings} />
          </div>
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
        <ImageLightbox />
      </article>

      {relatedPosts.length > 0 && (
        <div className="wrap">
          <section className="section" aria-labelledby="related-heading">
            <SectionHeading
              id="related-heading"
              title="More Posts"
              description="こちらの記事もどうぞ"
              link={{ href: "/blog", label: "ブログ一覧へ" }}
            />
            <BlogCardGrid>
              {relatedPosts.map((related) => <BlogCard key={related.id} post={related} />)}
            </BlogCardGrid>
          </section>
        </div>
      )}
    </>
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
