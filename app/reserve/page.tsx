import { Metadata } from "next";
import Image from "next/image";
import BlogCard, { BlogCardGrid } from "@/components/BlogCard";
import IrregularHolidayNote from "@/components/IrregularHolidayNote";
import SectionHeading from "@/components/SectionHeading";
import { STORE } from "@/lib/store-info";
import { getBlogPostsByCategory } from "@/lib/microcms";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

export const metadata: Metadata = {
  title: "Reserve（来店予約）",
  alternates: { canonical: "/reserve" },
  description: "85-Storeの予約ページ。Limited Store、1st Floor(85-Store)、2nd Floor(85-UpStore)の予約と空き状況をご確認いただけます。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: `${siteUrl}/reserve`,
    siteName: "85-Store（ハコストア）",
    title: "Reserve | 予約 | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "85-Storeの予約ページ。1st Floor(85-Store)、2nd Floor(85-UpStore)の予約と空き状況をご確認いただけます。",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reserve | 予約 | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "85-Storeの予約ページ。Limited Store、1st Floor(85-Store)、2nd Floor(85-UpStore)の予約と空き状況をご確認いただけます。",
  },
};

// 店舗情報の型定義
interface StoreInfo {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  hours: string;
  extendedHours?: string;
  aboutUrl: string;
  calendarUrl: string;
  calendarEmbedUrl: string;
  images: string[];
  note?: string;
  eventCategory?: string; // イベントカテゴリ（Event1st, Event2ndなど）
}

// 店舗情報
const stores: StoreInfo[] = [
  {
    id: "1st-floor",
    name: "1st Floor",
    nameEn: "85-Store",
    description: "オーセンティックな古着とニューアイテムを提案するセレクトショップ。",
    hours: `${STORE.hours.label}（${STORE.hours.closedLabel}）`,
    extendedHours: "事前予約で木曜と18:00～20:00延長営業可",
    aboutUrl: "/about",
    calendarUrl: "https://calendar.app.google/NC4YeDjkiWNVjLnw7",
    calendarEmbedUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3Z8bstlUPSWyt6ZrL_cB-aQSimveRJwfnuczdh5Zv1w23bNFljFC-HvtiVIV113oRHPZPsA_aN?gv=true",
    images: ["/images/shop.jpg"],
    eventCategory: "Event1st",
  },
  {
    id: "2nd-floor",
    name: "2nd Floor",
    nameEn: "85-UpStore",
    description: "2階のセレクトショップ。未オープン。",
    hours: `${STORE.hours.label}（${STORE.hours.closedLabel}）`,
    aboutUrl: "/upstore",
    calendarUrl: "https://calendar.app.google/uaU1rBEzcqVUTQkA6",
    calendarEmbedUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2JUkgse1YjUHHZxq77oo9ePtjpwItHH0OHtG5s-BODbPRxY8b74zfH4ofAaFwZi7PyU4FQ1u0J?gv=true",
    images: ["/images/upstore1.JPG"],
    eventCategory: "Event2nd",
  },
];

export default async function ReservePage() {
  // 各フロアのイベント記事
  const [event1stPosts, event2ndPosts] = await Promise.all([
    getBlogPostsByCategory("Event1st"),
    getBlogPostsByCategory("Event2nd"),
  ]);
  const eventsOf = (store: StoreInfo) =>
    store.eventCategory === "Event1st" ? event1stPosts : store.eventCategory === "Event2nd" ? event2ndPosts : [];

  return (
    <div className="wrap pt-12">
      <SectionHeading as="h1" title="Reserve" description="来店予約・空き状況の確認" />
      <p className="max-w-[40em] text-ink-2">
        各フロアの空き状況をご確認のうえ、ご予約ください。営業時間は{STORE.hours.label}（{STORE.hours.closedLabel}）です。{STORE.hours.note}
        <IrregularHolidayNote className="mt-1" />
      </p>
      <nav aria-label="フロア" className="mt-6 flex flex-wrap gap-2">
        {stores.map((store) => (
          <a key={store.id} href={`#${store.id}`} className="btn btn-secondary">{store.name}　{store.nameEn}</a>
        ))}
      </nav>

      {stores.map((store) => {
        const events = eventsOf(store).slice(0, 3);
        return (
          <section key={store.id} id={store.id} className="section scroll-mt-20" aria-labelledby={`${store.id}-heading`}>
            <SectionHeading
              id={`${store.id}-heading`}
              title={store.name}
              description={store.nameEn}
              link={{ href: store.aboutUrl, label: "詳しく見る" }}
            />
            <div className="grid-lines grid-cols-12">
              <figure className="relative col-span-5 min-h-72 bg-surface max-[900px]:col-span-12 max-[900px]:aspect-[3/2]">
                <Image src={store.images[0]} alt={`${store.nameEn} の様子`} fill sizes="(max-width: 900px) 100vw, 40vw" className="object-cover" />
              </figure>
              <div className="col-span-7 grid content-between gap-6 p-[clamp(20px,3vw,40px)] max-[900px]:col-span-12">
                <div>
                  <p className="mb-4 text-ink-2">{store.description}</p>
                  <dl className="facts">
                    <div><dt>営業時間</dt><dd>{store.hours}{store.extendedHours && <span className="block text-sm text-muted">{store.extendedHours}</span>}<IrregularHolidayNote className="text-muted" /></dd></div>
                  </dl>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={store.calendarUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">予約ページを開く</a>
                </div>
              </div>
            </div>

            <div className="mt-8 border border-rule">
              <iframe
                src={store.calendarEmbedUrl}
                style={{ border: 0 }}
                width="100%"
                height="600"
                loading="lazy"
                title={`${store.name} の予約カレンダー`}
              />
            </div>

            {events.length > 0 && (
              <div className="mt-12">
                <h3 className="mb-6 font-display text-xl font-bold">Events<span className="ml-2 font-sans text-sm font-normal text-muted">{store.name} のイベント</span></h3>
                <BlogCardGrid>
                  {events.map((post) => <BlogCard key={post.id} post={post} />)}
                </BlogCardGrid>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
