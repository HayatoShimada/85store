import Link from "next/link";
import BlogCard, { BlogCardGrid } from "@/components/BlogCard";
import SectionHeading from "@/components/SectionHeading";
import type { Blog } from "@/types/cms";

interface BlogListLayoutProps {
  title: string;
  description: string;
  posts: Blog[];
  categories?: string[];
  currentCategory?: string;
  pagination?: React.ReactNode;
  children?: React.ReactNode; // 一覧の後に続くセクション
}

// ブログ一覧・カテゴリ・タグ・ページ送りで共通のレイアウト
export default function BlogListLayout({
  title,
  description,
  posts,
  categories,
  currentCategory,
  pagination,
  children,
}: BlogListLayoutProps) {
  return (
    <div className="wrap">
      <section className="pt-12" aria-labelledby="list-heading">
        <SectionHeading as="h1" id="list-heading" title={title} description={description} />

        {categories && categories.length > 0 && (
          <nav aria-label="カテゴリ" className="-mt-4 mb-8">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link href="/blog" className="chip" aria-current={currentCategory ? undefined : "page"}>すべて</Link>
              </li>
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    href={`/blog/category/${encodeURIComponent(category)}`}
                    className="chip"
                    aria-current={category === currentCategory ? "page" : undefined}
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {posts.length > 0 ? (
          <BlogCardGrid>
            {posts.map((post) => <BlogCard key={post.id} post={post} />)}
          </BlogCardGrid>
        ) : (
          <p className="text-muted">まだ記事がありません。</p>
        )}

        {pagination}
      </section>
      {children}
    </div>
  );
}
