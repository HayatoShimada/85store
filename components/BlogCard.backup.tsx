'use client';

import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/types/notion";
import { getCategoryStyleClasses, getTagStyleClasses } from "@/utils/notionColors";
import { useNotionImage } from "@/hooks/useNotionImage";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  // Cover Imageがない場合はプレースホルダーを使用
  const hasCoverImage = post.coverImage && post.coverImage.trim() !== '';
  const imageSrc: string = hasCoverImage && post.coverImage ? post.coverImage : '/images/placeholder.svg';

  // SWRを使用して画像の期限切れ判定と再取得を行う
  const {
    imageUrl,
    isLoading: imageLoading,
    isRefreshing,
    handleImageLoad: swrHandleImageLoad,
    handleImageError: swrHandleImageError
  } = useNotionImage({
    url: imageSrc,
    expiryTime: post.coverImageExpiryTime,
    blockId: post.coverImageBlockId,
  }, {
    enabled: !!hasCoverImage, // カバー画像がない場合はSWRを無効化
  });

  // カバー画像がない場合はローディングを表示しない
  const showLoading = hasCoverImage && (imageLoading || isRefreshing);

  const handleImageError = () => {
    // プレースホルダー画像でもエラーが発生した場合はログを出さない
    if (imageUrl !== '/images/placeholder.svg') {
      console.error('BlogCard - Image failed to load:', imageUrl);
      console.log('BlogCard - Post details:', {
        title: post.title,
        coverImage: post.coverImage,
        coverImageExpiryTime: post.coverImageExpiryTime,
        coverImageBlockId: post.coverImageBlockId
      });
    }
    swrHandleImageError();
  };

  const handleImageLoad = () => {
    swrHandleImageLoad();
  };

  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-48 w-full overflow-hidden bg-gray-50">
          {/* ローディングスピナー */}
          {showLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          <Image
            src={imageUrl}
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