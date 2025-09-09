import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import localFont from "next/font/local";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// Futuraの代替として、モダンでクリーンなMontserratを使用
// 実際のFuturaフォントファイルがある場合は、public/fontsに配置して下記のlocalFontを使用
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-futura",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "85-Store - Select Shop & Blog",
  description: "モダンでスタイリッシュなセレクトショップ",
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${montserrat.variable} ${notoSansJP.variable}`}>
      <body className="antialiased font-japanese">
        <Header />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
