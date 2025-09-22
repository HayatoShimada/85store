'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

interface NotionImageData {
  url: string;
  expiryTime?: string;
  blockId?: string;
}

// 期限切れ判定（シンプル版）
const isExpired = (data: NotionImageData): boolean => {
  if (!data.expiryTime || !data.blockId) return false;
  return Date.parse(data.expiryTime) < Date.now();
};

// ブロック情報を取得
const fetchBlock = async (blockId: string): Promise<NotionImageData | null> => {
  try {
    const response = await fetch(`/api/blocks/${blockId}`);
    if (!response.ok) return null;

    const block = await response.json();

    if (block.Type === 'image' && block.Image) {
      const newUrl = block.Image.External?.Url || block.Image.File?.Url;
      const newExpiryTime = block.Image.File?.ExpiryTime;

      if (newUrl) {
        return {
          url: newUrl,
          expiryTime: newExpiryTime,
          blockId: blockId,
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch block:', error);
    return null;
  }
};

export function useNotionImage2(initialData: NotionImageData) {
  // 期限切れの場合のみ、ブロックIDを使って再取得
  const { data } = useSWR(
    isExpired(initialData) ? initialData.blockId : null,
    fetchBlock,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // 最終的な画像URL（プロキシ経由）
  const imageUrl = useMemo(() => {
    const currentData = data || initialData;
    const url = currentData.url;

    // プレースホルダーやローカル画像はそのまま
    if (url.startsWith('/')) {
      return url;
    }

    // S3 URLはプロキシ経由
    if (url.includes('amazonaws.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }

    // その他の外部URLはそのまま
    return url;
  }, [data, initialData]);

  return imageUrl;
}