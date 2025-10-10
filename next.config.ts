import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'www.notion.so',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 's3.us-west-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/image-proxy**',
      },
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
        pathname: '/notion-images/**',
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
