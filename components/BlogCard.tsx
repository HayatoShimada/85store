'use client';

import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/types/notion";
import { useState, useMemo } from "react";
import { getCategoryStyleClasses, getTagStyleClasses } from "@/utils/notionColors";
import { isNotionS3Url } from "@/utils/imageHelper";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Cover Imageがない場合やエラーの場合はプレースホルダーを使用
  const hasCoverImage = post.coverImage && post.coverImage.trim() !== '';
  const imageSrc = hasCoverImage && !imageError ? post.coverImage : '/images/placeholder.svg';

  // Process the image URL consistently
  const processedImageUrl = useMemo(() => {
    if (!imageSrc || imageSrc === '/images/placeholder.svg') {
      return '/images/placeholder.svg';
    }
    // ローカル画像パスの場合はそのまま使用
    if (imageSrc.startsWith('/notion-images/')) {
      return imageSrc;
    }
    // NotionのS3 URLは直接使用する（Next.jsのremotePatternsで許可済み）
    // APIプロキシは使わない
    return imageSrc;
  }, [imageSrc]);

  const handleImageError = () => {
    console.error('BlogCard - Image failed to load:', processedImageUrl);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-48 w-full overflow-hidden bg-gray-50">
          {/* ローディングスピナー */}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          <Image
            src={processedImageUrl}
            alt={post.title}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-200 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
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