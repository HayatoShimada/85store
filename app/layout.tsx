import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans_JP } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";

// 英字・数字: Archivo（幅の可変軸でロゴタイプを横に広げる）
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

// 和文・本文: IBM Plex Sans JP（和文は unicode-range で必要な分だけ読み込まれる）
const plexJP = IBM_Plex_Sans_JP({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-plex-jp",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

export const metadata: Metadata = {
  title: {
    default: "85-Store（ハコストア）| 富山県南砺市井波の古着・セレクトショップ",
    template: "%s | 85-Store（ハコストア）",
  },
  description: "もう一度洋服を好きになる場所。富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」。オーセンティックな古着とニューアイテムを提案するセレクトショップです。",
  keywords: [
    "富山",
    "南砺市",
    "井波",
    "古着",
    "セレクトショップ",
    "85-Store",
    "ハコストア",
    "富山県",
    "古着屋",
    "セレクトショップ 富山",
    "古着 井波",
    "南砺市 古着",
    "オーセンティック",
    "ヴィンテージ",
  ],
  authors: [{ name: "85-Store" }],
  creator: "85-Store",
  publisher: "85-Store",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "85-Store（ハコストア）",
    title: "85-Store（ハコストア）| 富山県南砺市井波の古着・セレクトショップ",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」。オーセンティックな古着とニューアイテムを提案するセレクトショップです。",
  },
  twitter: {
    card: "summary_large_image",
    title: "85-Store（ハコストア）| 富山県南砺市井波の古着・セレクトショップ",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」。オーセンティックな古着とニューアイテムを提案するセレクトショップです。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    // app/apple-icon.tsx が生成するPNG（/apple-icon.png は存在しない）
    apple: '/apple-icon',
  },
  manifest: '/manifest.json',
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
      'application/atom+xml': '/atom.xml',
    },
  },
  ...(process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION && {
    other: {
      'facebook-domain-verification': process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION,
    },
  }),
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  return (
    <html lang="ja" className={`${archivo.variable} ${plexJP.variable}`}>
      <head>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="antialiased">
        <StructuredData type="Organization" />
        <StructuredData type="LocalBusiness" />
        <StructuredData type="WebSite" />
        <Header />
        <main id="main" className="min-h-[60vh]">
          {children}
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
