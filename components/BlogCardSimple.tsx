'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { BlogPost } from "@/types/notion";
import { getCategoryStyleClasses, getTagStyleClasses } from "@/utils/notionColors";
import { useNotionImage2 } from "@/hooks/useNotionImage2";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCardSimple({ post }: BlogCardProps) {
  const [imageError, setImageError] = useState(false);

  // シンプルな画像URL取得
  const imageUrl = useNotionImage2({
    url: post.coverImage || '/images/placeholder.svg',
    expiryTime: post.coverImageExpiryTime,
    blockId: post.coverImageBlockId,
  });

  // エラー時はプレースホルダーを使用
  const displayUrl = imageError ? '/images/placeholder.svg' : imageUrl;

  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-48 w-full overflow-hidden bg-gray-50">
          <Image
            src={displayUrl}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            {post.category && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryStyleClasses(post.categoryColors)}`}>
                {post.category}
              </span>
            )}
            <span>{new Date(post.date).toLocaleDateString('ja-JP')}</span>
            {post.author && (
              <span className="text-gray-600">by {post.author}</span>
            )}
            {post.views !== undefined && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {post.views}
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold text-secondary mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={tag}
                  className={`text-xs px-2 py-1 rounded ${getTagStyleClasses([post.tagColors[index] || 'default'])}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}