import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  mapCategories,
  walkingMinutes,
  googleMapsUrl,
  MY_MAP_EMBED_URL,
  MY_MAP_VIEW_URL,
  type MapSpot,
} from "@/lib/map-spots";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://85-store.com";

export const metadata: Metadata = {
  title: "Our Town Map | 井波おすすめマップ - 85-Store",
  description:
    "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」がおすすめする井波の観光マップ。木彫刻のまち井波のショップ、食事、カフェ、寺社、宿泊スポットをご紹介します。",
  keywords: [
    "井波",
    "南砺市",
    "観光",
    "マップ",
    "井波観光",
    "瑞泉寺",
    "八日町通り",
    "富山",
    "85-Store",
    "ハコストア",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: `${siteUrl}/map`,
    siteName: "85-Store（ハコストア）",
    title: "Our Town Map | 井波おすすめマップ - 85-Store",
    description:
      "85-Storeがおすすめする井波の観光マップ。ショップ、食事、カフェ、寺社、宿泊スポットをご紹介します。",
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
    title: "Our Town Map | 井波おすすめマップ - 85-Store",
    description:
      "85-Storeがおすすめする井波の観光マップ。ショップ、食事、カフェ、寺社、宿泊スポットをご紹介します。",
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

function SpotLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-gray-500 underline underline-offset-4 decoration-gray-300 hover:text-primary hover:decoration-primary transition-colors"
    >
      {label}
    </a>
  );
}

function SpotItem({ spot }: { spot: MapSpot }) {
  return (
    <div className="py-8">
      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-[240px_1fr] items-start">
        {spot.image ? (
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-gray-100">
              <Image
                src={spot.image.src}
                alt={spot.image.alt}
                fill
                sizes="(max-width: 640px) 100vw, 240px"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-1.5 text-[11px] leading-relaxed text-gray-400">
              <a
                href={spot.image.creditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {spot.image.credit}（{spot.image.license}）
              </a>
            </figcaption>
          </figure>
        ) : (
          <div
            aria-hidden="true"
            className="hidden sm:flex aspect-[4/3] items-center justify-center rounded-sm border border-gray-100 bg-gray-50"
          >
            <svg
              className="h-6 w-6 text-gray-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
          </div>
        )}
        <div>
          <h3 className="font-bold text-secondary leading-relaxed">
            {spot.name}
          </h3>
          <p className="mt-1 text-xs tracking-[0.15em] text-gray-400">
            85-Storeから徒歩約{walkingMinutes(spot)}分
          </p>
          <p className="mt-3 text-charcoal leading-relaxed">
            {spot.description}
          </p>
          {spot.hours && (
            <p className="mt-2 text-sm text-gray-500">{spot.hours}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            {spot.url && <SpotLink href={spot.url} label="公式サイト" />}
            {spot.instagram && (
              <SpotLink href={spot.instagram} label="Instagram" />
            )}
            <SpotLink href={googleMapsUrl(spot)} label="Googleマップ" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヒーロー */}
      <section className="border-t border-gray-200">
        <div className="section-padding max-container py-20 md:py-28">
          <div className="grid md:grid-cols-[200px_1fr] gap-10 md:gap-16">
            <SectionHeading en="Our Town Map" ja="井波おすすめマップ" />
            <div className="max-w-2xl">
              <p className="text-xl md:text-2xl font-bold text-secondary leading-relaxed tracking-tight">
                木彫刻のまち、井波を歩く。
              </p>
              <div className="mt-8 space-y-6 text-charcoal leading-loose">
                <p>
                  85-Storeがある富山県南砺市井波は、600年以上続く木彫刻の文化が息づく歴史ある町。彫刻士の工房が軒を連ねる八日町通り、静かな路地、そして個性豊かなお店たち。
                </p>
                <p>
                  お買い物の前後にゆっくり歩いてほしい、わたしたちのおすすめスポットを地図にまとめました。どのスポットも85-Storeから歩いて回れる距離です。
                </p>
              </div>
              <figure className="mt-10">
                <div className="relative aspect-[21/9] overflow-hidden rounded-sm bg-gray-100">
                  <Image
                    src="/map-images/yokamachi-street.jpg"
                    alt="彫刻工房が軒を連ねる八日町通りの町並み"
                    fill
                    sizes="(max-width: 768px) 100vw, 672px"
                    className="object-cover"
                    priority
                  />
                </div>
                <figcaption className="mt-1.5 text-[11px] leading-relaxed text-gray-400">
                  八日町通り —{" "}
                  <a
                    href="https://commons.wikimedia.org/wiki/File:Nanto_Yokamachi,_Toyama_pref._road_No.21.jpg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Photo: Miyuki Meinaka, Wikimedia Commons（Public domain）
                  </a>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* マップ全体図 */}
      <section className="border-t border-gray-200">
        <div className="section-padding max-container py-20 md:py-28">
          <div className="grid md:grid-cols-[200px_1fr] gap-10 md:gap-16">
            <SectionHeading en="Map" ja="全体マップ" />
            <div>
              <div className="h-[420px] md:h-[560px] overflow-hidden rounded-sm border border-gray-200">
                <iframe
                  src={MY_MAP_EMBED_URL}
                  width="100%"
                  height="100%"
                  style={{ border: 0, marginTop: "-68px", height: "calc(100% + 68px)" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="85-Storeの井波マップ"
                />
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Googleマイマップで開くと、現在地の表示や各スポットへの経路検索ができます。掲載している営業時間等は取材時点の情報です。最新の営業情報は各店舗のSNS等でご確認ください。
              </p>
              <a
                href={MY_MAP_VIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-fit mt-6"
              >
                Googleマイマップで開く
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* カテゴリごとのスポット一覧 */}
      {mapCategories.map((category) => (
        <section key={category.id} className="border-t border-gray-200">
          <div className="section-padding max-container py-20 md:py-28">
            <div className="grid md:grid-cols-[200px_1fr] gap-10 md:gap-16">
              <SectionHeading en={category.en} ja={category.ja} />
              <div>
                <p className="text-charcoal leading-loose">{category.description}</p>
                <div className="mt-8 border-y border-gray-200 divide-y divide-gray-200">
                  {category.spots.map((spot) => (
                    <SpotItem key={spot.name} spot={spot} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* 来店案内 */}
      <section className="border-t border-gray-200">
        <div className="section-padding max-container py-20 md:py-28">
          <div className="grid md:grid-cols-[200px_1fr] gap-10 md:gap-16">
            <SectionHeading en="Visit Us" ja="ご来店案内" />
            <div className="max-w-2xl">
              <p className="text-charcoal leading-loose">
                85-Storeは井波の町なか、本町通り沿いにあります。営業時間やアクセスの詳細はAboutページをご覧ください。
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/about" className="btn-primary">
                  About Us
                </Link>
                <Link href="/reserve" className="btn-primary">
                  Reserve
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
