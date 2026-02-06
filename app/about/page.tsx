import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import AboutStore from '@/components/AboutStore';
import AboutTeam from '@/components/AboutTeam';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

export const metadata: Metadata = {
  title: "About Us | 富山県南砺市井波の古着・セレクトショップ 85-Store",
  description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」について。オーセンティックな古着とニューアイテムを提案するセレクトショップです。",
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
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: `${siteUrl}/about`,
    siteName: "85-Store（ハコストア）",
    title: "About Us | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」について。オーセンティックな古着とニューアイテムを提案するセレクトショップです。",
    images: [
      {
        url: `${siteUrl}/logo.svg`,
        width: 1200,
        height: 630,
        alt: "85-Store（ハコストア）",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」について。オーセンティックな古着とニューアイテムを提案するセレクトショップです。",
    images: [`${siteUrl}/logo.svg`],
  },
};

export default function About() {
  return (
    <div className="min-h-screen section-bg-gradient">
      <div className="section-padding max-container py-16">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-secondary mb-8 ">
            About Us
          </h1>

        </div>

        <div className="space-y-8">
          {/* ロゴとタイトル */}
          <div className="card-acrylic p-8">
            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-48 md:w-64 md:h-64">
                <Image
                  src="/logo.svg"
                  alt="85-Store"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-secondary">
                85-Store(ハコストア)
              </h2>
            </div>
          </div>

          {/* このお店について */}
          <div>
            <h3 className="text-3xl font-bold text-secondary mb-4 text-center">
              このお店について
            </h3>
            <div className="card-acrylic p-8 text-gray-700 leading-relaxed">
              <AboutStore />
            </div>
          </div>

          {/* 3人の店員について */}
          <div>
            <h3 className="text-3xl font-bold text-secondary mb-4 text-center">
              3人の店員について
            </h3>
            <div className="card-acrylic p-8 text-gray-700 leading-relaxed">
              <AboutTeam />
            </div>
          </div>

          {/* 店舗情報 */}
          <div>
            <h3 className="text-3xl font-bold text-secondary mb-4 text-center">
              店舗情報
            </h3>
            <div className="card-acrylic p-8 text-gray-700 leading-relaxed">
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-2">住所</p>
                  <p className="text-gray-700">
                    〒932-0217<br />
                    富山県南砺市本町４丁目１００<br />
                    85-Store
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">営業時間</p>
                  <p className="text-gray-700">
                    12:00 ~ 18:00（木曜定休）
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    事前予約で木曜と18:00～20:00延長営業可<br />
                    <Link href="/reserve" className="text-primary hover:text-primary-dark transition-colors underline">
                      事前予約はこちら
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 沿革 */}
          <div>
            <h3 className="text-3xl font-bold text-secondary mb-4 text-center">
              沿革
            </h3>
            <div className="card-acrylic p-8 text-gray-700 leading-relaxed">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-semibold">2025年9月9日</td>
                      <td className="py-3 px-4">富山県南砺市井波に物件を取得し、現在オープン準備中。</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-semibold">2025年11月15日</td>
                      <td className="py-3 px-4"><Link href="https://shop.85-store.com/" className="text-primary hover:text-primary-dark transition-colors">
                      オンラインストア</Link>をオープン。</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-semibold">2025年11月16日</td>
                      <td className="py-3 px-4"><Link href="https://85-store.com/blog/limitedstore" className="text-primary hover:text-primary-dark transition-colors">
                      週末限定のストア</Link>の予約開始。</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-semibold">2026年1月19日</td>
                      <td className="py-3 px-4"><Link href="/upstore" className="text-primary hover:text-primary-dark transition-colors">
                      2nd Floor構想</Link>の立ち上げ。</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
