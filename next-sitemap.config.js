// next-sitemap.config.js

/** @type {import('next-sitemap').IConfig} */
export default {
    siteUrl: 'https://85-store.com', // 必須
    generateRobotsTxt: true, // robots.txt も自動生成する場合 (推奨)
    // (オプション) 動的なパス（例: /blog/[slug]）を除外する場合
    exclude: ['/blog/*'], 
    // (オプション) robots.txt で特定のパスを Disallow する場合
    robotsTxtOptions: {
      policies: [
        {
          userAgent: '*',
          allow: '/',
          // /admin や /search をブロックする例 (前回のチャット内容より)
          disallow: [], 
        },
      ],
      // サイトマップの場所を robots.txt に自動で追記
      additionalSitemaps: [
        'https://85-store.com/sitemap.xml',
      ],
    },
  };