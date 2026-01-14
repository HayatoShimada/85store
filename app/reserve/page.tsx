import { Metadata } from "next";
import Link from "next/link";
import ImageSlider from "@/components/ImageSlider";
import BlogCard from "@/components/BlogCard";
import { getBlogPostsByCategory } from "@/lib/microcms";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

export const metadata: Metadata = {
  title: "Reserve | 予約 | 富山県南砺市井波の古着・セレクトショップ 85-Store",
  description: "85-Storeの予約ページ。Limited Store、1st Floor(85-Store)、2nd Floor(85-UpStore)の予約と空き状況をご確認いただけます。",
  keywords: [
    "富山",
    "南砺市",
    "井波",
    "古着",
    "セレクトショップ",
    "85-Store",
    "ハコストア",
    "予約",
    "店舗予約",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: `${siteUrl}/reserve`,
    siteName: "85-Store（ハコストア）",
    title: "Reserve | 予約 | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "85-Storeの予約ページ。Limited Store、1st Floor(85-Store)、2nd Floor(85-UpStore)の予約と空き状況をご確認いただけます。",
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
    title: "Reserve | 予約 | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "85-Storeの予約ページ。Limited Store、1st Floor(85-Store)、2nd Floor(85-UpStore)の予約と空き状況をご確認いただけます。",
    images: [`${siteUrl}/logo.svg`],
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
    id: "limited-store",
    name: "Limited Store",
    nameEn: "Limited Store",
    description: "3/1までの仮店舗。週末限定でオープンしています。",
    hours: "土日: 12:00 ~ 18:00",
    aboutUrl: "https://85-store.com/blog/ms-m904jli",
    calendarUrl: "https://calendar.app.google/oFsPPYZUiPXDtZSB7",
    calendarEmbedUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ05-VrhHdbdc_WLtoZiijEV-yVeaXDpfYCQVKXn4DTkjMG_D0eKowifeNSTWFlZbtDQ1J6MDjmO?gv=true",
    images: ["/logo.svg"], // 実際の画像パスに置き換えてください
    note: "※3/1までの仮店舗です",
  },
  {
    id: "1st-floor",
    name: "1st Floor",
    nameEn: "85-Store",
    description: "オーセンティックな古着とニューアイテムを提案するセレクトショップ。",
    hours: "12:00 ~ 18:00（木曜定休）",
    extendedHours: "事前予約で木曜と18:00～20:00延長営業可",
    aboutUrl: "https://85-store.com/about",
    calendarUrl: "https://calendar.app.google/MJkz1WnXuv7JoN6B9",
    calendarEmbedUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2JUkgse1YjUHHZxq77oo9ePtjpwItHH0OHtG5s-BODbPRxY8b74zfH4ofAaFwZi7PyU4FQ1u0J?gv=true",
    images: ["/logo.svg"], // 実際の画像パスに置き換えてください
    eventCategory: "Event1st",
  },
  {
    id: "2nd-floor",
    name: "2nd Floor",
    nameEn: "85-UpStore",
    description: "2階のセレクトショップ。",
    hours: "12:00 ~ 18:00（木曜定休）",
    aboutUrl: "https://85-store.com/upstore",
    calendarUrl: "https://calendar.app.google/uaU1rBEzcqVUTQkA6",
    calendarEmbedUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2JUkgse1YjUHHZxq77oo9ePtjpwItHH0OHtG5s-BODbPRxY8b74zfH4ofAaFwZi7PyU4FQ1u0J?gv=true",
    images: ["/logo.svg"], // 実際の画像パスに置き換えてください
    eventCategory: "Event2nd",
  },
];

export default async function ReservePage() {
  // イベント情報を取得
  const [event1stPosts, event2ndPosts] = await Promise.all([
    getBlogPostsByCategory("Event1st"),
    getBlogPostsByCategory("Event2nd"),
  ]);

  return (
    <div className="min-h-screen section-bg-gradient">
      {/* Hero Section */}
      <section className="py-20">
        <div className="section-padding max-container">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6 font-inter">
              Reserve
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              85-Storeの予約ページ。各店舗の空き状況をご確認いただき、ご予約ください。
            </p>
            <p className="text-gray-500 text-sm mt-4">
              営業時間: 12:00 ~ 18:00（店舗により異なります）
            </p>
          </div>
        </div>
      </section>

      {/* 店舗一覧ナビゲーション */}
      <section className="py-8 bg-white/30">
        <div className="section-padding max-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-secondary mb-6 text-center font-inter">
              店舗一覧
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stores.map((store) => (
                <a
                  key={store.id}
                  href={`#${store.id}`}
                  className="card-acrylic p-6 hover:scale-105 transition-transform duration-200 text-center group"
                >
                  <h3 className="text-xl font-bold text-secondary mb-2 font-inter group-hover:text-primary transition-colors">
                    {store.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{store.nameEn}</p>
                  <p className="text-gray-500 text-xs">{store.hours}</p>
                  {store.note && (
                    <p className="text-xs text-orange-600 font-medium mt-2">{store.note}</p>
                  )}
                </a>
              ))}
            </div>
            {(event1stPosts.length > 0 || event2ndPosts.length > 0) && (
              <div className="mt-6 text-center">
                <a
                  href="#events"
                  className="text-primary hover:text-primary-dark transition-colors font-medium inline-flex items-center gap-2"
                >
                  開催イベントを見る
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 店舗セクション */}
      {stores.map((store, index) => (
        <section 
          id={store.id}
          key={store.id} 
          className={`py-16 scroll-mt-20 ${index % 2 === 1 ? 'bg-white/50' : ''}`}
        >
          <div className="section-padding max-container">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* 画像スライダー */}
                <div>
                  <ImageSlider
                    images={store.images}
                    alt={store.name}
                    interval={2000}
                  />
                </div>

                {/* 店舗情報 */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-2 font-inter">
                      {store.name}
                    </h2>
                    <p className="text-xl text-gray-600 mb-4">{store.nameEn}</p>
                    {store.note && (
                      <p className="text-sm text-orange-600 font-medium mb-4">{store.note}</p>
                    )}
                  </div>

                  <div className="space-y-4 text-gray-700">
                    <p>{store.description}</p>
                    <div>
                      <p className="font-semibold text-gray-900">営業時間</p>
                      <p>{store.hours}</p>
                      {store.extendedHours && (
                        <p className="text-sm text-gray-600 mt-1">{store.extendedHours}</p>
                      )}
                    </div>
                  </div>

                  {/* ボタン */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href={store.calendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-center"
                    >
                      予約ページ
                    </a>
                    <Link
                      href={store.aboutUrl}
                      className="btn-primary text-center"
                    >
                      About
                    </Link>
                  </div>
                </div>
              </div>

              {/* イベント一覧 */}
              {store.eventCategory && (() => {
                const eventPosts = store.eventCategory === "Event1st" ? event1stPosts : event2ndPosts;
                const displayPosts = eventPosts.slice(0, 3);
                
                if (displayPosts.length === 0) return null;
                
                return (
                  <div className="mt-12">
                    <h3 className="text-2xl font-bold text-secondary mb-6 font-inter">
                      {store.name} 開催イベント
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {displayPosts.map((post) => (
                        <BlogCard key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Google Calendar埋め込み */}
              <div className="mt-12 card-acrylic p-4 md:p-8">
                <h3 className="text-2xl font-bold text-secondary mb-6 font-inter text-center">
                  {store.name} 予約カレンダー
                </h3>
                <div className="w-full overflow-hidden rounded-lg">
                  <iframe
                    src={store.calendarEmbedUrl}
                    style={{ border: 0 }}
                    width="100%"
                    height="600"
                    frameBorder="0"
                    title={`${store.name} 予約カレンダー`}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* イベント情報セクション */}
      {(event1stPosts.length > 0 || event2ndPosts.length > 0) && (
        <section id="events" className="py-16 scroll-mt-20">
          <div className="section-padding max-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4 font-inter">
                開催イベント
              </h2>
              <p className="text-gray-600">
                各店舗で開催されるイベント情報をお知らせします。
              </p>
            </div>

            {/* Event1st */}
            {event1stPosts.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-secondary mb-6 font-inter">
                  1st Floor イベント
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {event1stPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {/* Event2nd */}
            {event2ndPosts.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-secondary mb-6 font-inter">
                  2nd Floor イベント
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {event2ndPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
