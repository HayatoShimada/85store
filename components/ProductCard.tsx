'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Product } from "@/types/notion";
import { useNotionImage } from "@/hooks/useNotionImage";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [localImageLoading, setLocalImageLoading] = useState(true);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  // 画像が存在しない場合はuseNotionImageフックを使用しない
  const hasImage = Boolean(product.images[0] && product.images[0].trim() !== '');

  // useNotionImageフックを使用して画像の期限切れ判定と再取得を行う
  const {
    imageUrl,
    handleImageLoad: swrHandleImageLoad,
    handleImageError: swrHandleImageError
  } = useNotionImage({
    url: product.images[0] || '',
    expiryTime: product.imageExpiryTime,
    blockId: product.imageBlockId,
  }, {
    enabled: hasImage
  });

  const handleError = () => {
    // 既にプレースホルダー画像の場合はログを出さない
    if (imageUrl !== '/images/placeholder.svg') {
      console.error('Image failed to load:', imageUrl);
      console.log('Image details:', { src: product.images[0], expiryTime: product.imageExpiryTime, blockId: product.imageBlockId });
    }
    setLocalImageLoading(false);
    swrHandleImageError();
  };

  const handleLoad = () => {
    setLocalImageLoading(false);
    swrHandleImageLoad();
  };

  // 画像URLが空または無効な場合はプレースホルダーを使用
  const displayImageUrl = (hasImage && imageUrl && imageUrl.trim() !== '') ? imageUrl : '/images/placeholder.svg';

  return (
    <Link href={`/products/${product.shopifyHandle}`} className="group">
      <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-64 w-full overflow-hidden bg-gray-100">
          {/* ローディングスピナー - 画像が存在し、かつローディング中またはリフレッシュ中の場合のみ表示 */}
          {hasImage && localImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {hasImage ? (
            <Image
              src={displayImageUrl}
              alt={product.name}
              fill
              className={`object-cover group-hover:scale-105 transition-transform duration-200 ${localImageLoading ? 'opacity-0' : 'opacity-100'}`}
              onError={handleError}
              onLoad={handleLoad}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {product.featured && (
            <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
              FEATURED
            </span>
          )}
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-1">{product.category}</p>
          <h3 className="text-lg font-semibold text-secondary mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>
        </div>
      </article>
    </Link>
  );
}