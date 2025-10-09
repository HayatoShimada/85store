"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getProductUrl } from "@/lib/shopify";

interface ShopifyProductEmbedProps {
  productHandle: string;
}

interface ProductData {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  availableForSale: boolean;
}

export default function ShopifyProductEmbed({ productHandle }: ShopifyProductEmbedProps) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        // Shopify APIから商品情報を取得するエンドポイントを呼び出す
        const response = await fetch(`/api/shopify/product/${productHandle}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productHandle]);

  if (loading) {
    return (
      <div className="my-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="my-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400 text-center">
          商品情報を読み込めませんでした
        </p>
      </div>
    );
  }

  const productUrl = getProductUrl(productHandle);

  return (
    <div className="my-8 not-prose">
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col md:flex-row gap-6 p-6">
          {/* 商品画像 */}
          <div className="relative w-full md:w-48 h-48 flex-shrink-0">
            <Link href={productUrl} target="_blank" rel="noopener noreferrer">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  className="object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </Link>

            {/* 在庫状態バッジ */}
            {!product.availableForSale && (
              <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
                <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                  在庫なし
                </span>
              </div>
            )}
          </div>

          {/* 商品情報 */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                  {product.title}
                </h3>
                <span className="text-2xl font-bold text-primary whitespace-nowrap">
                  {product.price}
                </span>
              </div>

              {product.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                  {product.description}
                </p>
              )}
            </div>

            {/* CTAボタン */}
            <Link
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                product.availableForSale
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {product.availableForSale ? 'オンラインストアで見る' : '在庫なし'}
            </Link>
          </div>
        </div>

        {/* ストアバッジ */}
        <div className="bg-gray-100 dark:bg-gray-800/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            この商品は 85-Store オンラインショップで購入できます
          </p>
        </div>
      </div>
    </div>
  );
}
