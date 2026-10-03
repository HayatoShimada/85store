import type { NextConfig } from "next";

// ローカルで CMS（85store-cms、http://localhost:3001）と組み合わせて確かめるときだけ、その画像を許可する
const localCms = process.env.CMS_CONTENT_URL?.startsWith('http://localhost:3001');

const nextConfig: NextConfig = {
  // "use cache" + cacheTag によるキャッシュと Partial Prerendering を有効化
  cacheComponents: true,
  // next dev が CLAUDE.md / AGENTS.md に英語の案内を書き足さないようにする（同じ内容は CLAUDE.md に日本語で書いた）
  agentRules: false,
  images: {
    qualities: [75, 90, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        // CMS の画像（R2）
        protocol: 'https',
        hostname: 'media.85-store.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.st-note.com',
      },
      ...(localCms ? [{ protocol: 'http' as const, hostname: 'localhost', port: '3001' }] : []),
    ],
    localPatterns: [
      {
        pathname: '/logo.svg',
      },
      {
        pathname: '/headersnoo.png',
      },
      {
        pathname: '/headersnoo2.png',
      },
      {
        pathname: '/images/**',
      },
    ],
    ...(localCms && { dangerouslyAllowLocalIP: true }),
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
