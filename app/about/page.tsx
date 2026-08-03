import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import AboutStore from '@/components/AboutStore';
import AboutUs from '@/components/AboutUs';
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

function SectionHeading({ en, ja }: { en: string; ja: string }) {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-secondary">
        {en}
      </h2>
      <p className="mt-2 text-xs tracking-[0.2em] text-gray-400">{ja}</p>
    </div>
  );
}

const history = [
  { date: '2025.09.09', body: <>富山県南砺市井波に物件を取得。</> },
  {
    date: '2025.11.15',
    body: (
      <>
        <Link href="https://shop.85-store.com/" className="underline underline-offset-4 decoration-gray-300 hover:text-primary hover:decoration-primary transition-colors">オンラインストア</Link>
        をオープン。
      </>
    ),
  },
  {
    date: '2025.11.16',
    body: (
      <>
        <Link href="https://85-store.com/blog/limitedstore" className="underline underline-offset-4 decoration-gray-300 hover:text-primary hover:decoration-primary transition-colors">週末限定のストア</Link>
        の予約開始。
      </>
    ),
  },
  {
    date: '2026.01.19',
    body: (
      <>
        <Link href="/upstore" className="underline underline-offset-4 decoration-gray-300 hover:text-primary hover:decoration-primary transition-colors">2nd Floor構想</Link>
        の立ち上げ。
      </>
    ),
  },
  { date: '2026.03.29', body: <>85-Store 実店舗オープン。</> },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヒーロー */}
      <section className="border-t border-gray-200">
        <div className="section-padding max-container py-20 md:py-28">
          <div className="grid md:grid-cols-[200px_1fr] gap-10 md:gap-16">
            <SectionHeading en="About Us" ja="わたしたちについて" />
            <AboutUs />
          </div>
        </div>
      </section>

      {/* コンセプト */}
      <section className="border-t border-gray-200">
        <div className="section-padding max-container py-20 md:py-28">
          <div className="grid md:grid-cols-[200px_1fr] gap-10 md:gap-16">
            <SectionHeading en="Concept" ja="セレクト基準" />
            <AboutStore />
          </div>
        </div>
      </section>

      {/* チーム */}
      <section className="border-t border-gray-200">
        <div className="section-padding max-container py-20 md:py-28">
          <div className="grid md:grid-cols-[200px_1fr] gap-10 md:gap-16">
            <SectionHeading en="Our Team" ja="私たちについて" />
            <AboutTeam />
          </div>
        </div>
      </section>

      {/* 店舗情報 */}
      <section className="border-t border-gray-200">
        <div className="section-padding max-container py-20 md:py-28">
          <div className="grid md:grid-cols-[200px_1fr] gap-10 md:gap-16">
            <SectionHeading en="Information" ja="店舗情報" />
            <div>
              <dl className="border-y border-gray-200 divide-y divide-gray-200">
                <div className="grid sm:grid-cols-[10rem_1fr] gap-1 sm:gap-8 py-6">
                  <dt className="text-sm text-gray-400">店名</dt>
                  <dd className="text-charcoal leading-relaxed">
                    85-Store（ハコストア）
                  </dd>
                </div>
                <div className="grid sm:grid-cols-[10rem_1fr] gap-1 sm:gap-8 py-6">
                  <dt className="text-sm text-gray-400">住所</dt>
                  <dd className="text-charcoal leading-relaxed">
                    〒932-0217
                    <br />
                    富山県南砺市本町４丁目１００
                  </dd>
                </div>
                <div className="grid sm:grid-cols-[10rem_1fr] gap-1 sm:gap-8 py-6">
                  <dt className="text-sm text-gray-400">営業時間</dt>
                  <dd className="text-charcoal leading-relaxed">
                    12:00 – 18:00（木曜定休）
                    <br />
                    <span className="text-sm text-gray-500">
                      事前予約で木曜と18:00–20:00の延長営業が可能です。
                      <Link href="/reserve" className="ml-1 underline underline-offset-4 decoration-gray-300 hover:text-primary hover:decoration-primary transition-colors">
                        事前予約はこちら
                      </Link>
                    </span>
                  </dd>
                </div>
                <div className="grid sm:grid-cols-[10rem_1fr] gap-1 sm:gap-8 py-6">
                  <dt className="text-sm text-gray-400">オンラインストア</dt>
                  <dd className="text-charcoal leading-relaxed">
                    <Link href="https://shop.85-store.com/" className="underline underline-offset-4 decoration-gray-300 hover:text-primary hover:decoration-primary transition-colors">
                      shop.85-store.com
                    </Link>
                  </dd>
                </div>
              </dl>

              <div className="mt-12 h-80 md:h-96 overflow-hidden rounded-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3204.517088208854!2d136.96787667640913!3d36.56575518087919!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff82666c413bb03%3A0xc369092c6c56d4bf!2z44CSOTMyLTAyMTcg5a-M5bGx55yM5Y2X56C65biC5pys55S677yU5LiB55uu77yR77yQ77yQ!5e0!3m2!1sja!2sjp!4v1757503685113!5m2!1sja!2sjp"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="85-Store アクセス地図"
                  className="grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 沿革 */}
      <section className="border-t border-gray-200">
        <div className="section-padding max-container py-20 md:py-28">
          <div className="grid md:grid-cols-[200px_1fr] gap-10 md:gap-16">
            <SectionHeading en="History" ja="沿革" />
            <ol className="relative border-l border-gray-200 pl-8 md:pl-12 space-y-12">
              {history.map((item) => (
                <li key={item.date} className="relative">
                  <span className="absolute -left-[37px] md:-left-[53px] top-2 w-2 h-2 rounded-full bg-primary" />
                  <time className="block text-sm tracking-[0.15em] text-gray-400">
                    {item.date}
                  </time>
                  <p className="mt-2 text-charcoal leading-relaxed">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
