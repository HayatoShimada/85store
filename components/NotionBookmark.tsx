'use client';

import React, { useState } from 'react';

interface NotionBookmarkProps {
  url: string;
  caption?: string;
}

export function NotionBookmark({ url, caption }: NotionBookmarkProps) {
  const [faviconError, setFaviconError] = useState(false);

  // URLからドメインを抽出
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  // URLからタイトルを生成（ドメイン名を使用）
  const getTitle = (url: string) => {
    const domain = getDomain(url);
    return domain.replace('www.', '');
  };

  // ファビコンURLを生成（Google Favicon APIを使用）
  const getFaviconUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  const faviconUrl = getFaviconUrl(url);

  return (
    <div className="my-6">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white"
      >
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* ファビコン */}
            <div className="flex-shrink-0">
              {!faviconError && faviconUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={faviconUrl}
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded"
                  onError={() => setFaviconError(true)}
                />
              ) : (
                <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* コンテンツ */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {getTitle(url)}
              </h3>
              <p className="text-xs text-gray-500 truncate mt-1">
                {url}
              </p>
              {caption && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {caption}
                </p>
              )}
            </div>
            
            {/* 外部リンクアイコン */}
            <div className="flex-shrink-0">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
