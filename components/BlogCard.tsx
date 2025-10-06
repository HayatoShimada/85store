'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { BlogPost } from "@/types/notion";
import { getCategoryStyleClasses, getTagStyleClasses } from "@/utils/notionColors";
import { useNotionImage } from "@/hooks/useNotionImage";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const [localImageLoading, setLocalImageLoading] = useState(true);

  // 画像が存在しない場合はuseNotionImageフックを使用しない
  const hasImage = Boolean(post.coverImage && post.coverImage.trim() !== '');
  
  // useNotionImageフックを使用して画像の期限切れ判定と再取得を行う
  const {
    imageUrl,
    isRefreshing,
    handleImageLoad: swrHandleImageLoad,
    handleImageError: swrHandleImageError
  } = useNotionImage({
    url: post.coverImage || '',
    expiryTime: post.coverImageExpiryTime,
    blockId: post.coverImageBlockId,
  }, {
    enabled: hasImage
  });

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // 既にプレースホルダー画像の場合はログを出さない
    if (imageUrl !== '/images/placeholder.svg') {
      console.error('Image failed to load:', imageUrl);
      console.log('Image details:', { src: post.coverImage, expiryTime: post.coverImageExpiryTime, blockId: post.coverImageBlockId });
      console.log('Error event:', e);
    }
    setLocalImageLoading(false);
    swrHandleImageError();
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setLocalImageLoading(false);
    swrHandleImageLoad();
  };

  // 画像URLが空または無効な場合はプレースホルダーを使用
  const displayImageUrl = (hasImage && imageUrl && imageUrl.trim() !== '') ? imageUrl : '/images/placeholder.svg';

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:shadow-xl hover:-translate-y-1 group">
      <Link href={`/blog/${post.slug}`}>
        <div className="relative h-48 w-full overflow-hidden bg-gray-50">
          {/* ローディングスピナー - 画像が存在する場合のみ表示 */}
          {hasImage && (localImageLoading || isRefreshing) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          <Image
            src={displayImageUrl}
            alt={post.title}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-200 ${localImageLoading ? 'opacity-0' : 'opacity-100'}`}
            onError={handleError}
            onLoad={handleLoad}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        </div>
        <div className="p-6 pb-2">
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
        </div>
      </Link>
      {post.tags.length > 0 && (
        <div className="px-6 pb-4 flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <Link
              key={tag}
              href={`/blog/tag/${encodeURIComponent(tag)}`}
              className={`text-xs px-2 py-1 rounded ${getTagStyleClasses([post.tagColors[index] || 'default'])} hover:opacity-80 transition-opacity`}
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
