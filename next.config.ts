import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "use cache" + cacheTag によるキャッシュと Partial Prerendering を有効化
  cacheComponents: true,
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
      {
        protocol: 'https',
        hostname: 'assets.st-note.com',
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
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
