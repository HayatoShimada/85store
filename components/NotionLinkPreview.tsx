'use client';

import React, { useState, useEffect } from 'react';

interface NotionLinkPreviewProps {
  url: string;
}

interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export function NotionLinkPreview({ url }: NotionLinkPreviewProps) {
  const [faviconError, setFaviconError] = useState(false);
  const [metadata, setMetadata] = useState<LinkMetadata>({});
  const [imageError, setImageError] = useState(false);

  // URLからドメインを抽出
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  // GitHubのリポジトリ情報を取得
  const fetchGitHubInfo = async (url: string) => {
    try {
      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (match) {
        const [, owner, repo] = match;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          return {
            title: data.full_name,
            description: data.description || 'No description provided',
            siteName: 'GitHub',
            image: data.owner.avatar_url
          };
        }
      }
    } catch (error) {
      console.error('Error fetching GitHub info:', error);
    }
    return null;
  };

  useEffect(() => {
    // GitHubの場合は、API経由で情報を取得
    if (url.includes('github.com')) {
      fetchGitHubInfo(url).then(info => {
        if (info) {
          setMetadata(info);
        }
      });
    } else {
      // その他のサイトの場合は基本情報のみ
      setMetadata({
        title: getDomain(url).replace('www.', ''),
        description: url,
        siteName: getDomain(url)
      });
    }
  }, [url]);

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
        <div className="flex">
          {/* 左側: コンテンツ */}
          <div className="flex-1 p-4">
            <div className="flex items-start space-x-3">
              {/* ファビコン */}
              <div className="flex-shrink-0">
                {!faviconError && faviconUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={faviconUrl}
                    alt=""
                    width={20}
                    height={20}
                    className="w-5 h-5 rounded"
                    onError={() => setFaviconError(true)}
                  />
                ) : (
                  <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                )}
              </div>

              {/* テキストコンテンツ */}
              <div className="flex-1 min-w-0">
                {metadata.siteName && (
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {metadata.siteName}
                  </p>
                )}
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                  {metadata.title || getDomain(url).replace('www.', '')}
                </h3>
                {metadata.description && metadata.description !== url && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {metadata.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {url}
                </p>
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

          {/* 右側: プレビュー画像（もしあれば） */}
          {metadata.image && !imageError && (
            <div className="flex-shrink-0 w-32 h-24 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={metadata.image}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}
        </div>
      </a>
    </div>
  );
}