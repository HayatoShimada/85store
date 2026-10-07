import { Metadata } from 'next';
import Link from 'next/link';
import AboutStore from '@/components/AboutStore';
import AboutUs from '@/components/AboutUs';
import AboutTeam from '@/components/AboutTeam';
import BusinessCalendar from '@/components/BusinessCalendar';
import IrregularHolidayNote from '@/components/IrregularHolidayNote';
import ParkingNote from '@/components/ParkingNote';
import StoreActions from '@/components/StoreActions';
import UpcomingSpecialDays from '@/components/UpcomingSpecialDays';
import { STORE } from '@/lib/store-info';
import { WORKS, isExternalWork } from '@/lib/works';
import { pageAlternates } from "@/lib/metadata";

import Phrase from "@/components/Phrase";
import { SHORT_TEXT_LENGTH } from "@/lib/phrase";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

export const metadata: Metadata = {
  title: "About Us",
  alternates: pageAlternates("/about"),
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
      <p className="mt-1 text-sm text-muted"><Phrase>{ja}</Phrase></p>
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
        <Link href="https://shop.85-store.com/" className={linkClass}><Phrase>{"オンラインストア"}</Phrase></Link>
        をオープン。
      </>
    ),
  },
  {
    date: '2025.11.16',
    body: (
      <>
        <Link href="https://85-store.com/blog/limitedstore" className={linkClass}><Phrase>{"週末限定のストア"}</Phrase></Link>
        の予約開始。
      </>
    ),
  },
  {
    date: '2026.01.19',
    body: (
      <>
        <Link href="/upstore" className={linkClass}><Phrase>{"2nd Floor構想"}</Phrase></Link>
        の立ち上げ。
      </>
    ),
  },
  { date: '2026.03.29', body: <>85-Store 実店舗オープン。</> },
];

export default function About() {
  return (
    <div className="wrap pt-12">
      <h1 className="wordmark mb-12 text-[clamp(3rem,1rem+9vw,9rem)] leading-[0.85]">About</h1>

      <AboutSection en="About Us" ja="わたしたちについて">
        <AboutUs />
      </AboutSection>

      <AboutSection en="Concept" ja="セレクト基準">
        <AboutStore />
      </AboutSection>

      <AboutSection en="Our Team" ja="スタッフ紹介">
        <AboutTeam />
      </AboutSection>

      <AboutSection en="Works" ja="つくったもの">
        <p className="leading-loose text-ink-2"><Phrase>{"洋服のほかに、ゲームや道具もつくっています。"}</Phrase></p>
        <dl className="facts mt-6">
          {WORKS.map((work) => (
            <div key={work.slug}>
              <dt><Phrase>{work.kind}</Phrase></dt>
              <dd>
                {isExternalWork(work) ? (
                  <a href={work.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {work.name}<span className="sr-only"><Phrase>{"（別のサイトで開きます）"}</Phrase></span>
                  </a>
                ) : (
                  <Link href={work.href} className={linkClass}>{work.name}</Link>
                )}
                <span className="block text-sm text-muted"><Phrase max={SHORT_TEXT_LENGTH}>{work.description}</Phrase></span>
              </dd>
            </div>
          ))}
        </dl>
        <Link href="/works" className="btn btn-secondary mt-6"><Phrase>{"Works を見る"}</Phrase></Link>
      </AboutSection>

      <AboutSection en="Information" ja="店舗情報">
        <dl className="facts">
          <div><dt><Phrase>{"店名"}</Phrase></dt><dd>{STORE.name}</dd></div>
          <div><dt><Phrase>{"住所"}</Phrase></dt><dd>〒{STORE.address.postalCode}<br />{STORE.address.region}{STORE.address.locality}{STORE.address.street}</dd></div>
          <div>
            <dt><Phrase>{"営業時間"}</Phrase></dt>
            <dd>
              <span className="num">{STORE.hours.label}</span>（{STORE.hours.closedLabel}）
              <IrregularHolidayNote className="text-muted" />
              <span className="block text-sm text-muted">
                <Phrase max={SHORT_TEXT_LENGTH}>{STORE.hours.note}</Phrase>
                <Link href="/reserve" className={`ml-1 ${linkClass}`}><Phrase>{"事前予約はこちら"}</Phrase></Link>
              </span>
              <UpcomingSpecialDays className="mt-3" />
            </dd>
          </div>
          <div><dt><Phrase>{"電話"}</Phrase></dt><dd><a href={`tel:${STORE.telephone.replaceAll("-", "")}`} className="num underline underline-offset-4">{STORE.telephone}</a></dd></div>
          <div><dt><Phrase>{"駐車場"}</Phrase></dt><dd><ParkingNote /></dd></div>
          <div><dt><Phrase>{"オンラインストア"}</Phrase></dt><dd><a href={STORE.onlineShopUrl} className={linkClass}>shop.85-store.com</a></dd></div>
        </dl>
        <div className="mt-6">
          <StoreActions showOnlineStore={false} />
        </div>
        <div className="mt-10">
          <h3 className="mb-4 font-display text-lg font-bold">
            Calendar<span className="ml-2 font-sans text-sm font-normal text-muted"><Phrase>{"営業日カレンダー"}</Phrase></span>
          </h3>
          <BusinessCalendar />
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
              <p className="mt-2"><Phrase max={SHORT_TEXT_LENGTH}>{item.body}</Phrase></p>
            </li>
          ))}
        </ol>
      </AboutSection>
    </div>
  );
}
