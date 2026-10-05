import { Metadata } from "next";
import BlogListLayout from "@/components/BlogListLayout";
import { BlogCardGrid } from "@/components/BlogCard";
import NoteCard from "@/components/NoteCard";
import Pagination from "@/components/Pagination";
import SectionHeading from "@/components/SectionHeading";
import StructuredData from "@/components/StructuredData";
import { getBlogPostsPage } from "@/lib/cms";
import { getNoteArticles } from "@/lib/note";
import { STORE } from "@/lib/store-info";
import { pageAlternates } from "@/lib/metadata";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';
const DESCRIPTION = "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」のブログ。入荷情報やイベント、営業日のお知らせをお届けします。";

export const metadata: Metadata = {
  title: "Blog",
  description: DESCRIPTION,
  alternates: pageAlternates("/blog"),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: `${siteUrl}/blog`,
    siteName: STORE.name,
    title: `Blog | ${STORE.name}`,
    description: DESCRIPTION,
  },
};

export default async function BlogPage() {
  const [{ posts, totalPages }, noteArticles] = await Promise.all([
    getBlogPostsPage(1),
    getNoteArticles(),
  ]);

  return (
    <>
      <StructuredData type="Blog" />
      <BlogListLayout
        title="Blog"
        description="入荷、イベント、営業日のお知らせ"
        posts={posts}
        currentPath="/blog"
        pagination={<Pagination currentPage={1} totalPages={totalPages} />}
      >
        {noteArticles.length > 0 && (
          <section className="section" aria-labelledby="note-heading">
            <SectionHeading
              id="note-heading"
              title="note"
              description="仕入れ担当 はやと の、洋服と日常のエッセイ"
              link={{ href: STORE.sns.note, label: "note で読む" }}
            />
            <BlogCardGrid>
              {noteArticles.slice(0, 6).map((article) => <NoteCard key={article.id} article={article} />)}
            </BlogCardGrid>
          </section>
        )}
      </BlogListLayout>
    </>
  );
}
