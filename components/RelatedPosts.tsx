'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types/notion';
import { getCategoryStyleClasses } from '@/utils/notionColors';
import { useNotionImage } from '@/hooks/useNotionImage';

interface RelatedPostsProps {
  posts: BlogPost[];
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
          <h2 className="text-3xl font-bold text-secondary mb-4">
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
function RelatedPostCard({ post }: { post: BlogPost }) {
  // Cover Imageがない場合はプレースホルダーを使用
  const hasCoverImage = post.coverImage && post.coverImage.trim() !== '';
  const imageSrc = hasCoverImage ? post.coverImage : '/images/placeholder.svg';

  // SWRを使用して画像の期限切れ判定と再取得を行う
  const { 
    imageUrl, 
    isLoading: imageLoading, 
    isRefreshing,
    handleImageLoad: swrHandleImageLoad, 
    handleImageError: swrHandleImageError 
  } = useNotionImage({
    url: imageSrc || '/images/placeholder.svg',
    expiryTime: post.coverImageExpiryTime,
    blockId: post.coverImageBlockId,
  }, {
    enabled: !!hasCoverImage, // カバー画像がない場合はSWRを無効化
  });

  const handleImageError = () => {
    // プレースホルダー画像でもエラーが発生した場合はログを出さない
    if (imageUrl !== '/images/placeholder.svg') {
      console.error('RelatedPosts - Image failed to load:', imageUrl);
    }
    swrHandleImageError();
  };

  const handleImageLoad = () => {
    swrHandleImageLoad();
  };

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.slug}`}>
        <div className="relative h-48 w-full overflow-hidden bg-gray-50">
          {/* ローディングスピナー */}
          {(imageLoading || isRefreshing) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {/* 期限切れで再取得中の場合は薄いオーバーレイを表示 */}
          {isRefreshing && (
            <div className="absolute inset-0 bg-gray-50 bg-opacity-75 z-5"></div>
          )}
          
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            className={`object-cover transition-transform duration-200 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {post.categoryColors && post.categoryColors.length > 0 && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryStyleClasses(post.categoryColors)}`}>
                {post.category}
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
            {post.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{new Date(post.date).toLocaleDateString('en-US', { 
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
