import Link from "next/link";
import BlogCard, { BlogCardGrid } from "@/components/BlogCard";
import SectionHeading from "@/components/SectionHeading";
import type { Blog } from "@/types/cms";
import { BLOG_NAV } from "@/utils/blog";

import Phrase from "@/components/Phrase";
interface BlogListLayoutProps {
  title: string;
  description: string;
  posts: Blog[];
  currentPath?: string; // 絞り込みを出すときの今のページ（BLOG_NAV の href と比べる）
  pagination?: React.ReactNode;
  children?: React.ReactNode; // 一覧の後に続くセクション
}

// ブログ一覧・カテゴリ・タグ・ページ送りで共通のレイアウト
export default function BlogListLayout({
  title,
  description,
  posts,
  currentPath,
  pagination,
  children,
}: BlogListLayoutProps) {
  return (
    <div className="wrap">
      <section className="pt-12" aria-labelledby="list-heading">
        <SectionHeading as="h1" id="list-heading" title={title} description={description} />

        {currentPath !== undefined && (
          <nav aria-label="記事の種類" className="-mt-4 mb-8">
            <ul className="flex flex-wrap gap-2">
              {BLOG_NAV.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="chip" aria-current={href === currentPath ? "page" : undefined}>
                    {label}
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
          <p className="text-muted"><Phrase>{"まだ記事がありません。"}</Phrase></p>
        )}

        {pagination}
      </section>
      {children}
    </div>
  );
}
