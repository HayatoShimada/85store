import { Metadata } from 'next';
import Link from 'next/link';
import AboutStore from '@/components/AboutStore';
import AboutUs from '@/components/AboutUs';
import AboutTeam from '@/components/AboutTeam';
import StoreActions from '@/components/StoreActions';
import { STORE } from '@/lib/store-info';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

export const metadata: Metadata = {
  title: "About Us",
  alternates: { canonical: "/about" },
  description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」について。オーセンティックな古着とニューアイテムを提案するセレクトショップです。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: `${siteUrl}/about`,
    siteName: "85-Store（ハコストア）",
    title: "About Us | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」について。オーセンティックな古着とニューアイテムを提案するセレクトショップです。",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」について。オーセンティックな古着とニューアイテムを提案するセレクトショップです。",
  },
};

function SectionHeading({ en, ja }: { en: string; ja: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight">{en}</h2>
      <p className="mt-1 text-sm text-muted">{ja}</p>
    </div>
  );
}

// 見出し列 + 本文列の2カラムのセクション
function AboutSection({ en, ja, children }: { en: string; ja: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink py-[clamp(48px,7vw,96px)]">
      <div className="grid gap-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-16">
        <SectionHeading en={en} ja={ja} />
        <div>{children}</div>
      </div>
    </section>
  );
}

const linkClass = "underline decoration-1 underline-offset-4 hover:decoration-2";

const history = [
  { date: '2025.09.09', body: <>富山県南砺市井波に物件を取得。</> },
  {
    date: '2025.11.15',
    body: (
      <>
        <Link href="https://shop.85-store.com/" className={linkClass}>オンラインストア</Link>
        をオープン。
      </>
    ),
  },
  {
    date: '2025.11.16',
    body: (
      <>
        <Link href="https://85-store.com/blog/limitedstore" className={linkClass}>週末限定のストア</Link>
        の予約開始。
      </>
    ),
  },
  {
    date: '2026.01.19',
    body: (
      <>
        <Link href="/upstore" className={linkClass}>2nd Floor構想</Link>
        の立ち上げ。
      </>
    ),
  },
  { date: '2026.03.29', body: <>85-Store 実店舗オープン。</> },
];

export default function About() {
  return (
    <div className="wrap pt-12">
      <p className="wordmark mb-12 text-[clamp(3rem,1rem+9vw,9rem)] leading-[0.85]" aria-hidden="true">About</p>

      <AboutSection en="About Us" ja="わたしたちについて">
        <AboutUs />
      </AboutSection>

      <AboutSection en="Concept" ja="セレクト基準">
        <AboutStore />
      </AboutSection>

      <AboutSection en="Our Team" ja="スタッフ紹介">
        <AboutTeam />
      </AboutSection>

      <AboutSection en="Information" ja="店舗情報">
        <dl className="facts">
          <div><dt>店名</dt><dd>{STORE.name}</dd></div>
          <div><dt>住所</dt><dd>〒{STORE.address.postalCode}<br />{STORE.address.region}{STORE.address.locality}{STORE.address.street}</dd></div>
          <div>
            <dt>営業時間</dt>
            <dd>
              <span className="num">{STORE.hours.label}</span>（{STORE.hours.closedLabel}）
              <span className="block text-sm text-muted">
                {STORE.hours.note}
                <Link href="/reserve" className={`ml-1 ${linkClass}`}>事前予約はこちら</Link>
              </span>
            </dd>
          </div>
          <div><dt>オンラインストア</dt><dd><a href={STORE.onlineShopUrl} className={linkClass}>shop.85-store.com</a></dd></div>
        </dl>
        <div className="mt-6">
          <StoreActions showOnlineStore={false} />
        </div>
        <div className="mt-8 aspect-[4/3] max-h-[480px] w-full bg-surface md:aspect-[16/9]">
          <iframe
            src={STORE.mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="85-Store の地図"
          />
        </div>
      </AboutSection>

      <AboutSection en="History" ja="沿革">
        <ol className="relative space-y-10 border-l border-rule pl-8 md:pl-12">
          {history.map((item) => (
            <li key={item.date} className="relative">
              <span className="absolute top-2 left-[-37px] h-2 w-2 rounded-full bg-accent-2 md:left-[-53px]" />
              <time className="num block text-sm text-muted">{item.date}</time>
              <p className="mt-2">{item.body}</p>
            </li>
          ))}
        </ol>
      </AboutSection>
    </div>
  );
}
