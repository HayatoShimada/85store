'use client';

import useSWR from 'swr';
import { useState, useMemo } from 'react';

interface NotionImageData {
  url: string;
  expiryTime?: string;
  blockId?: string;
}

interface UseNotionImageOptions {
  fallbackUrl?: string;
  enabled?: boolean;
}

// 期限切れ判定関数
const isExpired = (imageData: NotionImageData): boolean => {
  if (!imageData.expiryTime) return false;
  
  const now = Date.now();
  const expiryTime = Date.parse(imageData.expiryTime);
  
  // 期限の5分前から期限切れとみなす（余裕を持たせる）
  return expiryTime - 5 * 60 * 1000 < now;
};

// ブロックIDをURLから抽出
const extractBlockIdFromUrl = (url: string): string | null => {
  const uuidPattern = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/g;
  const matches = url.match(uuidPattern);
  
  if (matches && matches.length >= 2) {
    return matches[1]; // 2番目のUUID（ブロックID）
  } else if (matches && matches.length === 1) {
    return matches[0]; // 1つしかない場合はそれを使用
  }
  
  return null;
};

// 期限切れURLから新しいURLを取得する関数
const fetchRefreshedImageUrl = async (url: string): Promise<NotionImageData | null> => {
  try {
    const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}&refresh=true`);
    
    if (!response.ok) {
      console.warn('Failed to refresh image URL:', response.status);
      return null;
    }
    
    // レスポンスヘッダーから新しいURLと期限情報を取得
    const newUrl = response.headers.get('x-refreshed-url');
    const expiryTime = response.headers.get('x-expiry-time');
    const blockId = response.headers.get('x-block-id');
    
    if (newUrl) {
      // 新しいURLもimage-proxy経由で返す
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(newUrl)}`;
      return {
        url: proxyUrl,
        expiryTime: expiryTime || undefined,
        blockId: blockId || undefined,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error refreshing image URL:', error);
    return null;
  }
};

export function useNotionImage(
  initialImageData: NotionImageData,
  options: UseNotionImageOptions = {}
) {
  const { fallbackUrl = '/images/placeholder.svg', enabled = true } = options;
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // 期限切れ判定
  const isImageExpired = useMemo(() => {
    return enabled && isExpired(initialImageData);
  }, [initialImageData, enabled]);

  // SWRで画像URLを再取得
  const { data: refreshedImageData, error: refreshError } = useSWR(
    isImageExpired && initialImageData.url ? `refresh-image-${initialImageData.url}` : null,
    () => fetchRefreshedImageUrl(initialImageData.url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1分間は重複リクエストを避ける
      errorRetryCount: 2,
      errorRetryInterval: 1000,
    }
  );

  // 最終的な画像URLを決定
  const finalImageUrl = useMemo(() => {
    if (imageError) return fallbackUrl;
    
    // 期限切れで新しいURLが取得できた場合はそれを使用
    if (isImageExpired && refreshedImageData?.url) {
      return refreshedImageData.url;
    }
    
    // 元のURLを処理（NotionのS3 URLはimage-proxy経由で読み込む）
    const originalUrl = initialImageData.url;
    
    // ローカル画像パスの場合はそのまま使用
    if (originalUrl.startsWith('/notion-images/') || originalUrl.startsWith('/images/')) {
      return originalUrl;
    }
    
    // NotionのS3 URLはimage-proxy API経由で読み込む
    if (originalUrl.includes('prod-files-secure.s3.us-west-2.amazonaws.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
    }
    
    // その他の外部URLは直接使用
    return originalUrl;
  }, [initialImageData.url, isImageExpired, refreshedImageData, imageError, fallbackUrl]);

  // 画像の読み込み状態
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  return {
    imageUrl: finalImageUrl,
    isLoading: imageLoading,
    hasError: imageError,
    isRefreshing: isImageExpired && !refreshedImageData && !refreshError,
    handleImageLoad,
    handleImageError,
  };
}
