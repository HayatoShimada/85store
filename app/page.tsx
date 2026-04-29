import { Metadata } from "next";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import BlogCard from "@/components/BlogCard";
import NoteCard from "@/components/NoteCard";
import FeaturedProducts from "@/components/FeaturedProducts";
import FeaturedBlogPosts from "@/components/FeaturedBlogPosts";
import StructuredData from "@/components/StructuredData";
import { getBlogPosts, getFeaturedBlogPosts, getFeaturedProducts, getBanners } from "@/lib/microcms";
import { getNoteArticles } from "@/lib/note";
import type { Blog } from "@/types/microcms";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

export const metadata: Metadata = {
  title: "富山県南砺市井波の古着・セレクトショップ | 85-Store（ハコストア）",
  description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」。オーセンティックな古着とニューアイテムを提案するセレクトショップです。週末限定ストアとオンラインストアでお買い物をお楽しみください。",
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
    "オーセンティック",
    "ヴィンテージ",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "85-Store（ハコストア）",
    title: "富山県南砺市井波の古着・セレクトショップ | 85-Store（ハコストア）",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」。オーセンティックな古着とニューアイテムを提案するセレクトショップです。週末限定ストアとオンラインストアでお買い物をお楽しみください。",
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
    title: "富山県南砺市井波の古着・セレクトショップ | 85-Store（ハコストア）",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」。オーセンティックな古着とニューアイテムを提案するセレクトショップです。週末限定ストアとオンラインストアでお買い物をお楽しみください。",
    images: [`${siteUrl}/logo.svg`],
  },
};

export default async function Home() {
  // MicroCMSとnoteからデータを取得
  const [blogPosts, featuredBlogPosts, featuredProducts, banners, noteArticles] = await Promise.all([
    getBlogPosts(3),
    getFeaturedBlogPosts(),
    getFeaturedProducts(6),
    getBanners(),
    getNoteArticles(),
  ]);

  return (
    <div className="section-bg-gradient">
      <StructuredData type="WebSite" />
      <HeroSection banners={banners} />

      {/* Featuredブログ記事 */}
      <FeaturedBlogPosts posts={featuredBlogPosts} />

      {/* 最新のブログ記事 */}
      <section className="py-16">
        <div className="section-padding max-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4 ">
              Latest Posts
            </h2>
            <p className="text-sm text-gray-600">富山県南砺市井波の古着・セレクトショップ「85-Store」からのスタイリング情報とトレンドをお届けします</p>
          </div>

          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post: Blog) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="card-acrylic p-12 text-center max-w-2xl mx-auto rounded-xl">
              <p className="text-gray-500 font-medium tracking-wide">ただいま記事を準備中です</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/blog" className="btn-primary">
              See All Posts
            </Link>
          </div>
        </div>
      </section>

      {/* note記事セクション */}
      {noteArticles.length > 0 && (
        <section className="py-16">
          <div className="section-padding max-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary mb-4 ">
                note
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                85-Storeの仕入れ担当（Hayato）の洋服、哲学、日常に関するエッセイ。
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {noteArticles.slice(0, 3).map((article) => (
                <NoteCard key={article.id} article={article} />
              ))}
            </div>
            <div className="text-center mt-8">
              <a
                href="https://note.com/85_store"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                See All Posts
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Podcastセクション */}
      <section className="py-16">
        <div className="section-padding max-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">Podcast</h2>
            <p className="text-sm text-gray-600 mb-4">
              85-Storeが配信するポッドキャスト。古着・ファッション・日常についてゆるく話しています。
            </p>
            <a
              href="https://open.spotify.com/show/6tA2ppEmxZEzvraua6zLFV?si=xammDwf7SZ2p_ZBGOdbgdg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1DB954] hover:bg-[#1aa34a] text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Spotifyで聴く
            </a>
          </div>
          <div className="max-w-2xl mx-auto">
            <iframe
              src="https://open.spotify.com/embed/show/6tA2ppEmxZEzvraua6zLFV"
              width="100%"
              height="352"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* おすすめ商品セクション */}
      <FeaturedProducts products={featuredProducts} />
    </div>
  );
}
