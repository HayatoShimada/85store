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
                85-Store<span className="block text-lg md:text-xl mt-1">ハコストア</span>
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

          {/* アクセス（マップ） */}
          <div>
            <h3 className="text-3xl font-bold text-secondary mb-4 text-center">
              アクセス
            </h3>
            <div className="card-acrylic h-96 overflow-hidden rounded-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3204.517088208854!2d136.96787667640913!3d36.56575518087919!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff82666c413bb03%3A0xc369092c6c56d4bf!2z44CSOTMyLTAyMTcg5a-M5bGx55yM5Y2X56C65biC5pys55S677yU5LiB55uu77yR77yQ77yQ!5e0!3m2!1sja!2sjp!4v1757503685113!5m2!1sja!2sjp"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="85-Store アクセス地図"
              />
            </div>
          </div>

          {/* 沿革 */}
          <div>
            <h3 className="text-3xl font-bold text-secondary mb-4 text-center">
              History
            </h3>
            <div className="card-acrylic p-8 text-gray-700 leading-relaxed">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:gap-6 border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <div className="font-bold text-secondary sm:w-40 flex-shrink-0">2025年9月9日</div>
                  <div className="mt-1 sm:mt-0">富山県南砺市井波に物件を取得し、現在オープン準備中。</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-6 border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <div className="font-bold text-secondary sm:w-40 flex-shrink-0">2025年11月15日</div>
                  <div className="mt-1 sm:mt-0">
                    <Link href="https://shop.85-store.com/" className="text-primary hover:text-primary-dark transition-colors font-medium underline underline-offset-2">オンラインストア</Link>をオープン。
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-6 border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <div className="font-bold text-secondary sm:w-40 flex-shrink-0">2025年11月16日</div>
                  <div className="mt-1 sm:mt-0">
                    <Link href="https://85-store.com/blog/limitedstore" className="text-primary hover:text-primary-dark transition-colors font-medium underline underline-offset-2">週末限定のストア</Link>の予約開始。
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-6 border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <div className="font-bold text-secondary sm:w-40 flex-shrink-0">2026年1月19日</div>
                  <div className="mt-1 sm:mt-0">
                    <Link href="/upstore" className="text-primary hover:text-primary-dark transition-colors font-medium underline underline-offset-2">2nd Floor構想</Link>の立ち上げ。
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-6 border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <div className="font-bold text-secondary sm:w-40 flex-shrink-0">2026年3月29日</div>
                  <div className="mt-1 sm:mt-0">85-Store 実店舗オープン。</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
