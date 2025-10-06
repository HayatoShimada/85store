'use client';

import useSWR from 'swr';
import React, { useState, useMemo } from 'react';

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

  // 開発環境でのみデバッグ出力
  if (process.env.NODE_ENV === 'development') {
    console.log('Checking expiry:', {
      expiryTimeString: imageData.expiryTime,
      expiryTimeParsed: new Date(expiryTime).toISOString(),
      currentTime: new Date(now).toISOString(),
      isExpired: expiryTime - 5 * 60 * 1000 < now
    });
  }

  // 期限の5分前から期限切れとみなす（余裕を持たせる）
  return expiryTime - 5 * 60 * 1000 < now;
};

// ブロックIDをURLから抽出
const extractBlockIdFromUrl = (url: string): string | null => {
  // URLにブロックIDが含まれているかチェック
  // Notion URLの形式: /workspace-id/block-id/filename.jpg
  const uuidPattern = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/g;
  const matches = url.match(uuidPattern);

  // 通常、最初のUUIDがワークスペースID、2番目がブロックID
  // ただし、ブロックIDが提供されていない場合は、refreshを諦める
  if (matches && matches.length >= 2) {
    // 最後のUUIDがファイル名の場合があるので、最後から2番目を使用
    return matches[matches.length - 2];
  }

  // ブロックIDが見つからない場合はnullを返す
  return null;
};

// 期限切れURLから新しいURLを取得する関数
const fetchRefreshedImageUrl = async (url: string, blockId?: string): Promise<NotionImageData | null> => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Attempting to refresh expired image URL:', url, 'with blockId:', blockId);
    }

    // ブロックIDが提供されていない場合はURLから抽出を試みる
    const finalBlockId = blockId || extractBlockIdFromUrl(url);
    if (!finalBlockId) {
      console.error('Cannot determine block ID for URL:', url);
      return null;
    }

    // Notion APIから新しいURLを取得するため、ブロックIDを使用
    const response = await fetch(`/api/blocks/${finalBlockId}`);

    if (!response.ok) {
      console.warn('Failed to refresh image URL from API:', response.status);
      return null;
    }

    const block = await response.json();
    console.log('Refreshed block data:', block);

    if (block.Type === 'image' && block.Image) {
      const newUrl = block.Image.External
        ? block.Image.External.Url
        : block.Image.File?.Url;

      const newExpiryTime = block.Image.File?.ExpiryTime;

      if (newUrl) {
        console.log('Got new image URL:', newUrl);
        return {
          url: newUrl,
          expiryTime: newExpiryTime || undefined,
          blockId: blockId,
        };
      }
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
  const [imageLoading, setImageLoading] = useState(enabled);

  // 開発環境でのみ初期URLのログ
  if (process.env.NODE_ENV === 'development') {
    console.log('useNotionImage initialized with:', {
      url: initialImageData.url,
      expiryTime: initialImageData.expiryTime,
      blockId: initialImageData.blockId,
    });
  }

  // URLが変更された時にエラー状態をリセット
  React.useEffect(() => {
    setImageError(false);
    setImageLoading(enabled);
  }, [initialImageData.url, enabled]);


  // 期限切れ判定
  const isImageExpired = useMemo(() => {
    return enabled && isExpired(initialImageData);
  }, [initialImageData, enabled]);

  // SWRで画像URLを再取得
  // 注意: ブロックIDがない場合やAPIアクセス権限がない場合は無効化
  const shouldRefresh = isImageExpired && 
                       initialImageData.url && 
                       initialImageData.blockId;

  const { data: refreshedImageData, error: refreshError } = useSWR(
    shouldRefresh ? `refresh-image-${initialImageData.blockId}` : null,
    () => fetchRefreshedImageUrl(initialImageData.url, initialImageData.blockId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1分間は重複リクエストを避ける
      errorRetryCount: 1, // 最大1回までリトライ
      errorRetryInterval: 2000, // リトライ間隔を2秒に設定
      onError: (error) => {
        console.warn('Image refresh failed:', error);
      }
    }
  );

  // 最終的な画像URLを決定
  const finalImageUrl = useMemo(() => {
    // エラーが発生した場合、またはリフレッシュが失敗した場合はフォールバックを使用
    if (imageError || (isImageExpired && refreshError && !refreshedImageData)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Using fallback due to error or refresh failure:', fallbackUrl);
      }
      return fallbackUrl;
    }

    // 期限切れで新しいURLが取得できた場合はそれを使用
    if (isImageExpired && refreshedImageData?.url) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Using refreshed image URL:', refreshedImageData.url);
      }
      // 新しいURLもプロキシ経由で使用
      const refreshedUrl = refreshedImageData.url;
      if (refreshedUrl.includes('prod-files-secure.s3.us-west-2.amazonaws.com') ||
          refreshedUrl.includes('s3.us-west-2.amazonaws.com') ||
          refreshedUrl.includes('s3.amazonaws.com')) {
        return `/api/image-proxy?url=${encodeURIComponent(refreshedUrl)}`;
      }
      return refreshedUrl;
    }

    // 元のURLを処理（NotionのS3 URLはimage-proxy経由で読み込む）
    const originalUrl = initialImageData.url;

    // プレースホルダーの場合はそのまま返す
    if (originalUrl === '/images/placeholder.svg') {
      if (process.env.NODE_ENV === 'development') {
        console.log('Using placeholder directly:', originalUrl);
      }
      return originalUrl;
    }

    // ローカル画像パスの場合はそのまま使用
    if (originalUrl.startsWith('/notion-images/') || originalUrl.startsWith('/images/')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Using local image path:', originalUrl);
      }
      return originalUrl;
    }

    // NotionのS3 URLはimage-proxy API経由で読み込む
    if (originalUrl.includes('prod-files-secure.s3.us-west-2.amazonaws.com') ||
        originalUrl.includes('s3.us-west-2.amazonaws.com') ||
        originalUrl.includes('s3.amazonaws.com')) {
      // URLを適切にエンコード
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
      if (process.env.NODE_ENV === 'development') {
        console.log('Using proxy for S3 URL:', proxyUrl);
      }
      return proxyUrl;
    }

    // その他の外部URLは直接使用
    if (process.env.NODE_ENV === 'development') {
      console.log('Using external URL directly:', originalUrl);
    }
    return originalUrl;
  }, [initialImageData.url, isImageExpired, refreshedImageData, imageError, fallbackUrl, refreshError]);

  // 画像の読み込み状態
  const handleImageLoad = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Image loaded successfully:', finalImageUrl);
    }
    setImageLoading(false);
    setImageError(false); // エラー状態をリセット
  };

  const handleImageError = () => {
    console.error('Image load error:', finalImageUrl);
    setImageError(true);
    setImageLoading(false);
  };

  // リフレッシュ状態を更新：期限切れでリフレッシュ中の場合のみ
  const isRefreshing = isImageExpired && 
                      !refreshedImageData && 
                      !refreshError;

  return {
    imageUrl: finalImageUrl,
    isLoading: imageLoading,
    hasError: imageError,
    isRefreshing,
    handleImageLoad,
    handleImageError,
  };
}
