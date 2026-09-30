"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="wrap py-[var(--section)]">
      <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-ink-2">ページを表示できませんでした。時間をおいて、もう一度お試しください。</p>
      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" onClick={reset} className="btn btn-primary">もう一度読み込む</button>
        <Link href="/" className="btn btn-secondary">トップへ戻る</Link>
      </div>
    </div>
  );
}
