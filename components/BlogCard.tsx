import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";
import { formatDate } from "@/utils/date";
import { getBlogPostPath } from "@/utils/blog";
import type { Blog } from "@/types/cms";

import Phrase from "@/components/Phrase";
interface BlogCardProps {
  post: Blog;
}

// サーバーコンポーネント: 記事本文（content）をクライアントへ送らないため
// 画像は4:5の枠に比率を保ったまま収める（縦長は幅を狭めて中央に置く）
export default function BlogCard({ post }: BlogCardProps) {
  const primaryCategory = post.category?.[0];
  const publishedAt = post.publishedAt || post.createdAt;

  return (
    <li>
      <Link
        href={getBlogPostPath(post)}
        className="group grid gap-3 max-[560px]:grid-cols-[112px_minmax(0,1fr)] max-[560px]:items-start max-[560px]:gap-4"
      >
        <div className="media-frame aspect-[4/5]">
          <FallbackImage
            src={post.eyecatch?.url}
            alt=""
            fill
            sizes="(max-width: 560px) 112px, (max-width: 900px) 50vw, 33vw"
          />
        </div>
        <div>
          <p className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
            <time dateTime={publishedAt} className="num">{formatDate(publishedAt)}</time>
            {primaryCategory && <span className="chip">{primaryCategory}</span>}
          </p>
          <h3 className="text-lg leading-normal group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[5px] max-[560px]:text-base">
            <Phrase>{post.title}</Phrase>
          </h3>
        </div>
      </Link>
    </li>
  );
}

// カードを並べるグリッド（3列 → 2列 → スマホは横並びの1列）
export function BlogCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <ul className="grid grid-cols-3 gap-x-6 gap-y-12 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1 max-[560px]:gap-6">
      {children}
    </ul>
  );
}
