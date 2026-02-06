import { Metadata } from "next";
import BlogCard from "@/components/BlogCard";
import NoteCard from "@/components/NoteCard";
import { CategorySection } from "@/components/CategorySection";
import { TagSection } from "@/components/TagSection";
import StructuredData from "@/components/StructuredData";
import { getBlogPosts, getAllCategories, getAllTags } from "@/lib/microcms";
import { getNoteArticles } from "@/lib/note";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

export const metadata: Metadata = {
  title: "Blog | 富山県南砺市井波の古着・セレクトショップ 85-Store",
  description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」のブログ。スタイリング情報やトレンド、古着の楽しみ方などをお届けします。",
  keywords: [
    "富山",
    "南砺市",
    "井波",
    "古着",
    "セレクトショップ",
    "85-Store",
    "ハコストア",
    "ブログ",
    "スタイリング",
    "トレンド",
    "古着 ブログ",
    "セレクトショップ ブログ",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: `${siteUrl}/blog`,
    siteName: "85-Store（ハコストア）",
    title: "Blog | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」のブログ。スタイリング情報やトレンド、古着の楽しみ方などをお届けします。",
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
    title: "Blog | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」のブログ。スタイリング情報やトレンド、古着の楽しみ方などをお届けします。",
    images: [`${siteUrl}/logo.svg`],
  },
};

export default async function BlogPage() {
  const [blogPosts, categories, tags, noteArticles] = await Promise.all([
    getBlogPosts(),
    getAllCategories(),
    getAllTags(),
    getNoteArticles()
  ]);

  return (
    <div className="min-h-screen section-bg-gradient">
      <StructuredData type="Blog" />
      {/* Blog Section */}
      <section className="py-16">
        <div className="section-padding max-container">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-secondary mb-4">
              Blog
            </h1>
            <p className="text-sm text-gray-600 mb-6">富山県南砺市井波の古着・セレクトショップ「85-Store」からのスタイリング情報とトレンド</p>
            
            {/* Categories & Tags (inline) */}
            <div className="space-y-3">
              <CategorySection categories={categories} inline />
              <TagSection tags={tags} inline />
            </div>
          </div>

          {/* Blog Posts */}
          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-3xl font-semibold text-gray-600 mb-2">
                まだ記事がありません
              </h3>
              <p className="text-gray-500">
                新しい記事をお待ちください。
              </p>
            </div>
          )}
        </div>
      </section>

      {/* note Articles Section */}
      {noteArticles.length > 0 && (
        <section className="py-16">
          <div className="section-padding max-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary mb-4 ">
                note
              </h2>
              <p className="text-gray-600 mb-4">
                85-Storeの仕入れ担当（Hayato）の洋服、哲学、日常に関するエッセイ。
              </p>
              <a
                href="https://note.com/85_store"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1 text-sm font-semibold"
              >
                すべて見る
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {noteArticles.map((article) => (
                <NoteCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
