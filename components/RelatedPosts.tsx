'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Blog } from '@/types/microcms';

interface RelatedPostsProps {
  posts: Blog[];
  title?: string;
}

export function RelatedPosts({ posts, title = "Related Posts" }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="section-padding max-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary mb-4 font-inter">
            {title}
          </h2>
          <p className="text-gray-600">
            You might also be interested in these articles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <RelatedPostCard key={post.id} post={post} />
          ))}
        </div>

      </div>
    </section>
  );
}

// 個別の投稿カードコンポーネント
function RelatedPostCard({ post }: { post: Blog }) {
  const [imageError, setImageError] = useState(false);

  const displayUrl = (!imageError && post.eyecatch?.url)
    ? post.eyecatch.url
    : '/images/placeholder.svg';

  const displayDescription = post.description || post.excerpt || extractExcerpt(post.content);

  // カテゴリ（配列の最初の要素を使用）
  const primaryCategory = post.category?.[0] || null;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.id}`}>
        <div className="relative h-48 w-full overflow-hidden bg-gray-50">
          <Image
            src={displayUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-200"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {primaryCategory && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {primaryCategory}
              </span>
            )}
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
            {post.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {displayDescription}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</span>
            {post.author && (
              <span>by {post.author}</span>
            )}
          </div>
        </div>
      </Link>
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
