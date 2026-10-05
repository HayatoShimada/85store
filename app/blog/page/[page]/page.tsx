import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import BlogListLayout from "@/components/BlogListLayout";
import Pagination, { getBlogPagePath } from "@/components/Pagination";
import { getBlogPostsPage } from "@/lib/cms";
import { pageAlternates } from "@/lib/metadata";

interface BlogPageProps {
  params: Promise<{
    page: string;
  }>;
}

// 2ページ目以降を事前生成する（1ページ目は /blog）
export async function generateStaticParams() {
  // 1ページしかない場合も "2" を返す（空配列はビルドエラー。存在しないページはnotFoundになる）
  const { totalPages } = await getBlogPostsPage(1);
  return Array.from({ length: Math.max(1, totalPages - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

function parsePage(value: string): number | null {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : null;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const page = parsePage((await params).page);
  if (!page) return {};

  return {
    title: `Blog（${page}ページ目）`,
    description: `富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」のブログ記事一覧（${page}ページ目）。`,
    alternates: pageAlternates(getBlogPagePath(page)),
  };
}

export default async function BlogPaginatedPage({ params }: BlogPageProps) {
  const page = parsePage((await params).page);
  if (!page) notFound();
  if (page === 1) permanentRedirect("/blog");

  const { posts, totalPages } = await getBlogPostsPage(page);
  if (posts.length === 0) notFound();

  return (
    <BlogListLayout
      title="Blog"
      description={`${page}ページ目`}
      posts={posts}
      currentPath="/blog"
      pagination={<Pagination currentPage={page} totalPages={totalPages} />}
    />
  );
}
