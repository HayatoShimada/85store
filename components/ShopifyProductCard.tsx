"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/notion";

interface ShopifyProductCardProps {
  product: Product;
  availableForSale?: boolean;
  productUrl: string;
}

export default function ShopifyProductCard({
  product,
  availableForSale = true,
  productUrl
}: ShopifyProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  return (
    <article className="card-acrylic group">
      <Link href={productUrl} target="_blank" rel="noopener noreferrer">
        <div className="relative h-64 w-full overflow-hidden bg-gray-50">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Featured バッジ */}
          {product.featured && (
            <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              Featured
            </span>
          )}

          {/* 在庫状態バッジ */}
          {!availableForSale && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-lg">
                Out of Stock (sold out)
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            {product.category && (
              <span className="px-2 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700">
                {product.category}
              </span>
            )}
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-secondary mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-gray-600 line-clamp-2">{product.description}</p>
          )}
        </div>
      </Link>
    </article>
  );
}
