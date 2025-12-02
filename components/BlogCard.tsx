'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Blog } from "@/types/microcms";

interface BlogCardProps {
  post: Blog;
}

export default function BlogCard({ post }: BlogCardProps) {
  const [imageError, setImageError] = useState(false);

  const displayImageUrl = (!imageError && post.eyecatch?.url)
    ? post.eyecatch.url
    : '/images/placeholder.svg';

  // description > excerpt > content から説明文を取得
  const displayDescription = post.description || post.excerpt || extractExcerpt(post.content);

  // カテゴリ（配列の最初の要素を使用）
  const primaryCategory = post.category?.[0] || null;

  return (
    <article className="card-acrylic group">
      <Link href={`/blog/${post.id}`}>
        <div className="relative h-48 sm:h-52 md:h-48 w-full overflow-hidden bg-gray-100 rounded-t-lg">
          <Image
            src={displayImageUrl}
            alt={post.title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 70vw"
            priority={false}
            quality={75}
          />
        </div>
        <div className="p-6 pb-2">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            {primaryCategory && (
              <span className="px-2 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-300">
                {primaryCategory}
              </span>
            )}
            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('ja-JP')}</span>
            {post.author && (
              <span className="text-gray-600">by {post.author}</span>
            )}
          </div>
          <h3 className="text-xl font-semibold text-secondary mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-600 line-clamp-2">{displayDescription}</p>
        </div>
      </Link>
      {post.tags && post.tags.length > 0 && (
        <div className="px-6 pb-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${encodeURIComponent(tag)}`}
              className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}

function extractExcerpt(html: string, maxLength: number = 100): string {
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
