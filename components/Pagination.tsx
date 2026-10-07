import Link from "next/link";

import Phrase from "@/components/Phrase";
interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

// ブログ一覧のページ番号（1ページ目は /blog、2ページ目以降は /blog/page/[n]）
export function getBlogPagePath(page: number): string {
  return page <= 1 ? "/blog" : `/blog/page/${page}`;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label="ブログのページ送り" className="mt-12 flex items-center justify-between gap-4 border-t border-rule pt-6">
      {hasPrev ? (
        <Link href={getBlogPagePath(currentPage - 1)} rel="prev" className="btn btn-secondary"><Phrase>{"前のページ"}</Phrase></Link>
      ) : (
        <span className="btn btn-secondary" aria-disabled="true"><Phrase>{"前のページ"}</Phrase></span>
      )}

      <ol className="flex gap-1">
        {pages.map((page) => (
          // スマホでは現在のページの前後だけを表示する
          <li key={page} className={Math.abs(page - currentPage) > 1 ? "max-[560px]:hidden" : undefined}>
            {page === currentPage ? (
              <span aria-current="page" className="num inline-grid h-11 min-w-11 place-items-center bg-ink text-bg">
                {page}
              </span>
            ) : (
              <Link href={getBlogPagePath(page)} className="num inline-grid h-11 min-w-11 place-items-center border border-transparent hover:border-ink">
                {page}
              </Link>
            )}
          </li>
        ))}
      </ol>

      {hasNext ? (
        <Link href={getBlogPagePath(currentPage + 1)} rel="next" className="btn btn-secondary"><Phrase>{"次のページ"}</Phrase></Link>
      ) : (
        <span className="btn btn-secondary" aria-disabled="true"><Phrase>{"次のページ"}</Phrase></span>
      )}
    </nav>
  );
}
