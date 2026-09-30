import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-[var(--section)]">
      <p className="wordmark text-display text-rule" aria-hidden="true">404</p>
      <h1 className="mt-6 font-display text-2xl font-bold">Page Not Found</h1>
      <p className="mt-2 text-ink-2">お探しのページは見つかりませんでした。移動または削除された可能性があります。</p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/" className="btn btn-primary">トップへ戻る</Link>
        <Link href="/blog" className="btn btn-secondary">ブログを見る</Link>
      </div>
    </div>
  );
}
