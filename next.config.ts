import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'images.microcms-assets.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
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
      {
        pathname: '/hero/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // OG画像APIのキャッシュ設定
  async headers() {
    return [
      {
        source: '/api/og-image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, max-age=86400, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
