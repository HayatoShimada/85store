import { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import Pagination, { getBlogPagePath } from "@/components/Pagination";
import { getBlogPostsPage } from "@/lib/microcms";

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
    alternates: {
      canonical: getBlogPagePath(page),
    },
  };
}

export default async function BlogPaginatedPage({ params }: BlogPageProps) {
  const page = parsePage((await params).page);
  if (!page) notFound();
  if (page === 1) permanentRedirect("/blog");

  const { posts, totalPages } = await getBlogPostsPage(page);
  if (posts.length === 0) notFound();

  return (
    <div className="min-h-screen section-bg-gradient">
      <section className="py-16">
        <div className="section-padding max-container">
          <div className="text-center mb-8">
            <nav className="mb-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Link href="/blog" className="hover:text-primary transition-colors">
                  ブログ
                </Link>
                <span>›</span>
                <span className="text-primary font-semibold">{page}ページ目</span>
              </div>
            </nav>
            <h1 className="text-3xl font-bold text-secondary mb-4">Blog</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </section>
    </div>
  );
}
