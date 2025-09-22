'use client';

import React from 'react';
import Image from 'next/image';
import { useNotionImage } from '@/hooks/useNotionImage';

interface NotionImageProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  expiryTime?: string;
  blockId?: string;
}

export function NotionImage({ src, alt, caption, width, height, expiryTime, blockId }: NotionImageProps) {
  const [imageDimensions, setImageDimensions] = React.useState<{width: number, height: number} | null>(null);

  // SWRを使用して画像の期限切れ判定と再取得を行う
  const { 
    imageUrl, 
    isLoading: imageLoading, 
    hasError: imageError, 
    isRefreshing,
    handleImageLoad: swrHandleImageLoad, 
    handleImageError: swrHandleImageError 
  } = useNotionImage({
    url: src,
    expiryTime,
    blockId,
  });

  const handleError = () => {
    // 既にプレースホルダー画像の場合はログを出さない
    if (imageUrl !== '/images/placeholder.svg') {
      console.error('Image failed to load:', imageUrl);
    }
    swrHandleImageError();
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    swrHandleImageLoad();
  };


  // アスペクト比を計算（画像の実際のサイズまたは指定されたサイズから）
  const aspectRatio = imageDimensions 
    ? imageDimensions.width / imageDimensions.height 
    : (width && height) 
      ? width / height 
      : 16 / 9; // デフォルトは16:9

  // アスペクト比に基づいてクラスを決定
  const getAspectClass = () => {
    if (aspectRatio > 2) return 'aspect-[21/9]'; // 超ワイド
    if (aspectRatio > 1.5) return 'aspect-video'; // 16:9
    if (aspectRatio > 1.2) return 'aspect-[4/3]'; // 4:3
    if (aspectRatio > 0.8) return 'aspect-square'; // 1:1
    return 'aspect-[3/4]'; // 3:4 (縦長)
  };

  return (
    <div className="my-4 sm:my-6 md:my-8">
      <div className="relative w-full max-w-4xl mx-auto">
        <div className={`relative w-full ${getAspectClass()} md:rounded-lg overflow-hidden md:shadow-lg bg-gray-50`}>
          {/* ローディングスピナー */}
          {(imageLoading || isRefreshing) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}
          
          {/* 期限切れで再取得中の場合は薄いオーバーレイを表示 */}
          {isRefreshing && (
            <div className="absolute inset-0 bg-gray-50 bg-opacity-75 z-5"></div>
          )}
          
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className={`object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 70vw"
            onError={handleError}
            onLoad={handleLoad}
            priority={false}
          />
        </div>
        {caption && (
          <p className="text-xs sm:text-sm text-gray-500 text-center mt-2 sm:mt-3 px-2">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
