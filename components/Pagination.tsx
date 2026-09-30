import Link from "next/link";

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
  const linkClass = "min-w-10 h-10 px-3 inline-flex items-center justify-center rounded border text-sm transition-colors";

  return (
    <nav aria-label="ページ送り" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link href={getBlogPagePath(currentPage - 1)} rel="prev" className={`${linkClass} border-gray-300 hover:border-secondary`}>
          前へ
        </Link>
      )}
      {pages.map((page) =>
        page === currentPage ? (
          <span key={page} aria-current="page" className={`${linkClass} border-secondary bg-secondary text-white`}>
            {page}
          </span>
        ) : (
          <Link key={page} href={getBlogPagePath(page)} className={`${linkClass} border-gray-300 hover:border-secondary`}>
            {page}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link href={getBlogPagePath(currentPage + 1)} rel="next" className={`${linkClass} border-gray-300 hover:border-secondary`}>
          次へ
        </Link>
      )}
    </nav>
  );
}
