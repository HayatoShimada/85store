'use client';

import React from 'react';
import Image from 'next/image';

interface NotionImageProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export function NotionImage({ src, alt, caption, width, height }: NotionImageProps) {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);
  const [imageSrc, setImageSrc] = React.useState(src);
  const [imageDimensions, setImageDimensions] = React.useState<{width: number, height: number} | null>(null);

  const handleError = () => {
    console.error('Image failed to load:', imageSrc);
    setImageError(true);
    setImageLoading(false);
    setImageSrc('/images/placeholder.svg');
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    setImageLoading(false);
  };

  // Notionの画像URLをプロキシ経由で処理
  const isNotionImage = imageSrc.includes('prod-files-secure.s3.us-west-2.amazonaws.com') || 
                       imageSrc.includes('s3.us-west-2.amazonaws.com') ||
                       imageSrc.includes('s3.amazonaws.com');
  
  const processedImageUrl = isNotionImage ? `/api/image-proxy?url=${encodeURIComponent(imageSrc)}` : imageSrc;

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
    <div className="my-8">
      <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`relative w-full ${getAspectClass()} rounded-lg overflow-hidden shadow-lg bg-gray-50`}>
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
          <p className="text-sm text-gray-500 text-center mt-3 px-2">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
