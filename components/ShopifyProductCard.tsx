"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/notion";
import { getProductUrl } from "@/lib/shopify";

interface ShopifyProductCardProps {
  product: Product;
  availableForSale?: boolean;
}

export default function ShopifyProductCard({
  product,
  availableForSale = true
}: ShopifyProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  const productUrl = getProductUrl(product.shopifyHandle);

  return (
    <Link
      href={productUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-64 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
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

        <div className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {product.category}
          </p>
          <h3 className="text-lg font-semibold text-secondary dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>
            <span className="text-sm text-primary group-hover:underline flex items-center gap-1">
              View Details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
