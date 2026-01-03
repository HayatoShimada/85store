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
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4 font-inter">
              Latest Posts
            </h2>
            <p className="text-gray-600">富山県南砺市井波の古着・セレクトショップ「85-Store」からのスタイリング情報とトレンドをお届けします</p>
          </div>

          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post: Blog) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No blog posts yet</p>
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
              <h2 className="text-3xl font-bold text-secondary mb-4 font-inter">
                note
              </h2>
              <p className="text-gray-600 mb-4">
                85-Storeの仕入れ担当（Hayato）の洋服、哲学、日常に関するエッセイ。
              </p>
              <a
                href="https://note.com/85_store"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1 text-sm font-medium"
              >
                すべて見る
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {noteArticles.slice(0, 3).map((article) => (
                <NoteCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* おすすめ商品セクション */}
      <FeaturedProducts products={featuredProducts} />
    </div>
  );
}
