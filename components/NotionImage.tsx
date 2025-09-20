'use client';

import React from 'react';
import Image from 'next/image';
import { isNotionS3Url } from '@/utils/imageHelper';

interface NotionImageProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export function NotionImage({ src, alt, caption, width, height }: NotionImageProps) {
  const [imageLoading, setImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);
  const [imageDimensions, setImageDimensions] = React.useState<{width: number, height: number} | null>(null);

  // Process the image URL consistently
  const processedImageUrl = React.useMemo(() => {
    if (!src || src === '/images/placeholder.svg' || imageError) {
      return '/images/placeholder.svg';
    }
    if (src.startsWith('/notion-images/')) {
      return src;
    }
    // NotionのS3 URLは直接使用する（Next.jsのremotePatternsで許可済み）
    // APIプロキシは使わない
    return src;
  }, [src, imageError]);

  const handleError = () => {
    // 既にプレースホルダー画像の場合はログを出さない
    if (!imageError && processedImageUrl !== '/images/placeholder.svg') {
      console.error('Image failed to load:', processedImageUrl);
      setImageError(true);
    }
    setImageLoading(false);
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    setImageLoading(false);
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
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}
          
          <Image
            src={processedImageUrl}
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
