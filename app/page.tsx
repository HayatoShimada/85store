import { Metadata } from "next";
import Image from "next/image";
import BlogCard, { BlogCardGrid } from "@/components/BlogCard";
import NoteCard from "@/components/NoteCard";
import ProductGrid from "@/components/ProductGrid";
import SectionHeading from "@/components/SectionHeading";
import StoreActions from "@/components/StoreActions";
import StoreInfoSection from "@/components/StoreInfoSection";
import StoreStatus from "@/components/StoreStatus";
import WorkCard from "@/components/WorkCard";
import IrregularHolidayNote from "@/components/IrregularHolidayNote";
import { getBanners, getBlogPosts } from "@/lib/cms";
import { getNoteArticles } from "@/lib/note";
import { getLatestProducts } from "@/lib/shopify-storefront";
import { STORE } from "@/lib/store-info";
import { WORKS } from "@/lib/works";
import type { Banner } from "@/types/cms";
import { pageAlternates } from "@/lib/metadata";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';
const TITLE = "85-Store（ハコストア）| 富山県南砺市井波の古着・セレクトショップ";
const DESCRIPTION = "もう一度、洋服を好きになれる場所。富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」。オーセンティックな古着とトレンド感のある新品を、実店舗とオンラインストアでご紹介しています。";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: pageAlternates("/"),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: STORE.name,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

type HeroPhoto = { url: string; alt: string; href?: string };

// microCMS の縦長バナーが足りないときに使う写真（先頭のバナーと同じ店内写真にならないよう、店長の写真を先に使う）
const FALLBACK_HERO_PHOTOS: HeroPhoto[] = [
  { url: "/images/snoo.jpg", alt: "店長のスヌー" },
  { url: "/images/shop.jpg", alt: "85-Store の店内" },
];

const isPortrait = (banner: Banner) => (banner.image.height ?? 0) > (banner.image.width ?? 0);

export default async function Home() {
  const [banners, posts, noteArticles, products] = await Promise.all([
    getBanners(),
    getBlogPosts(6),
    getNoteArticles(),
    getLatestProducts(8),
  ]);

  // 縦長のバナーはヒーローの写真、それ以外は Pick Up に並べる
  const heroPhotos: HeroPhoto[] = [
    ...banners.filter(isPortrait).map((banner) => ({ url: banner.image.url, alt: banner.title ?? "", href: banner.detailButtonUrl })),
    ...FALLBACK_HERO_PHOTOS,
  ].slice(0, 2);
  const pickUps = banners.filter((banner) => !isPortrait(banner));

  return (
    <div className="wrap">
      <p className="wordmark pt-6 pb-4 text-display" aria-hidden="true" data-snoo-trigger>85-Store</p>

      {/* ヒーロー: 写真2枚 + ブランドメッセージ + 営業情報 */}
      <div className="grid-lines grid-cols-12">
        {heroPhotos.map((photo, index) => {
          const image = (
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              priority={index === 0}
              sizes="(max-width: 1000px) 50vw, 33vw"
              className="object-cover"
            />
          );
          return (
            <figure key={photo.url} className="relative col-span-4 min-h-[clamp(420px,44vw,680px)] overflow-hidden bg-surface max-[1000px]:col-span-6 max-[1000px]:aspect-[3/4] max-[1000px]:min-h-0">
              {photo.href ? <a href={photo.href} aria-label={photo.alt || "詳しく見る"}>{image}</a> : image}
            </figure>
          );
        })}

        <div className="col-span-4 grid grid-rows-[auto_1fr] gap-px bg-rule max-[1000px]:order-first max-[1000px]:col-span-12 max-[1000px]:grid-cols-2 max-[1000px]:grid-rows-none max-[640px]:grid-cols-1">
          <div className="bg-accent p-[clamp(20px,2.5vw,36px)] text-on-accent">
            <h1 className="text-2xl font-bold tracking-tight">もう一度、洋服を好きになれる場所</h1>
            <p className="mt-4 max-w-[26em]">
              富山県南砺市のセレクトショップ、85-Store（ハコストア）です。今好きな服と、ずっと着られる服を。
            </p>
          </div>
          <div className="grid content-between gap-6 bg-bg p-[clamp(20px,2.5vw,36px)]">
            <div>
              <div className="mb-4">
                <StoreStatus
                  action={
                    <a href="#calendar" className="btn btn-secondary px-3">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                        <rect x="3.5" y="5" width="17" height="15" />
                        <path d="M3.5 10h17M8 3v4M16 3v4" />
                      </svg>
                      営業日カレンダー
                    </a>
                  }
                />
              </div>
              <dl className="facts">
                <div><dt>営業時間</dt><dd className="num text-xl font-semibold">{STORE.hours.label}</dd></div>
                <div><dt>定休日</dt><dd>{STORE.hours.closedDays}<IrregularHolidayNote className="text-muted" /></dd></div>
                <div><dt>住所</dt><dd>{STORE.address.region}{STORE.address.locality}{STORE.address.street}</dd></div>
              </dl>
            </div>
            <StoreActions />
          </div>
        </div>
      </div>

      {pickUps.length > 0 && (
        <section className="section" aria-labelledby="pickup-heading">
          <SectionHeading id="pickup-heading" title="Pick Up" description="いまのおすすめ" />
          <ul className="grid-lines grid-cols-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
            {pickUps.map((banner) => {
              const body = (
                <>
                  <div className="media-frame aspect-[4/3]">
                    <Image src={banner.image.url} alt={banner.title || banner.subtitle ? "" : "85-Store のおすすめ"} fill sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw" />
                  </div>
                  {(banner.title || banner.subtitle) && (
                    <div className="p-4">
                      {banner.title && <p className="font-semibold">{banner.title}</p>}
                      {banner.subtitle && <p className="text-sm text-muted">{banner.subtitle}</p>}
                    </div>
                  )}
                </>
              );
              return (
                <li key={banner.id}>
                  {banner.detailButtonUrl ? <a href={banner.detailButtonUrl} className="group block">{body}</a> : body}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {products.length > 0 && (
        <section className="section" aria-labelledby="arrivals-heading">
          <SectionHeading
            id="arrivals-heading"
            title="New Arrivals"
            description="オンラインストアの新着アイテム"
            link={{ href: STORE.onlineShopUrl, label: "すべて見る" }}
          />
          <ProductGrid products={products} />
        </section>
      )}

      <section className="section" aria-labelledby="journal-heading">
        <SectionHeading
          id="journal-heading"
          title="Journal"
          description="入荷、イベント、営業日のお知らせ"
          link={{ href: "/blog", label: "すべての記事" }}
        />
        {posts.length > 0 ? (
          <BlogCardGrid>
            {posts.map((post) => <BlogCard key={post.id} post={post} />)}
          </BlogCardGrid>
        ) : (
          <p className="text-muted">ただいま記事を準備中です。</p>
        )}
      </section>

      {noteArticles.length > 0 && (
        <section className="section" aria-labelledby="note-heading">
          <SectionHeading
            id="note-heading"
            title="note"
            description="仕入れ担当 はやと の、洋服と日常のエッセイ"
            link={{ href: STORE.sns.note, label: "note で読む" }}
          />
          <BlogCardGrid>
            {noteArticles.slice(0, 3).map((article) => <NoteCard key={article.id} article={article} />)}
          </BlogCardGrid>
        </section>
      )}

      <section className="section" aria-labelledby="podcast-heading">
        <SectionHeading
          id="podcast-heading"
          title="Podcast"
          description="古着・ファッション・日常について、ゆるく話しています"
          link={{ href: STORE.sns.spotify, label: "Spotify で聴く" }}
        />
        <iframe
          src="https://open.spotify.com/embed/show/6tA2ppEmxZEzvraua6zLFV"
          title="85-Store の Podcast（Spotify）"
          width="100%"
          height="232"
          allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          // ページ（ダーク・猫）と配色がずれると、ブラウザが iframe の下地を白で塗り、角丸の外側が白く見える
          className="block border-0 [color-scheme:light]"
        />
      </section>

      <section className="section" aria-labelledby="works-heading">
        <SectionHeading
          id="works-heading"
          title="Works"
          description="85-Store がつくったゲームや道具"
          link={{ href: "/works", label: "すべて見る" }}
        />
        <ul className="grid-lines grid-cols-4 max-[900px]:grid-cols-2">
          {WORKS.map((work) => (
            <WorkCard key={work.slug} work={work} sizes="(max-width: 900px) 50vw, 25vw" showDescription={false} />
          ))}
        </ul>
      </section>

      <StoreInfoSection />
    </div>
  );
}
