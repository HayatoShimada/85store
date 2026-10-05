import { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogListLayout from "@/components/BlogListLayout";
import { getAllTags, getBlogPostsByTag } from "@/lib/cms";
import { nonEmptyParams } from "@/utils/static-params";
import { pageAlternates } from "@/lib/metadata";

interface TagPageProps {
  params: Promise<{
    tag: string;
  }>;
}

export async function generateStaticParams() {
  // エンコードせずに返す（Next.jsが自動でエンコードする）
  return nonEmptyParams("tag", await getAllTags());
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tag = decodeURIComponent((await params).tag);
  const path = `/blog/tag/${encodeURIComponent(tag)}`;
  const description = `85-Store（ハコストア）のブログから「#${tag}」の記事をまとめています。`;

  return {
    title: `#${tag} | Blog`,
    description,
    alternates: pageAlternates(path),
    openGraph: { type: "website", locale: "ja_JP", url: path, title: `#${tag} | Blog`, description },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent((await params).tag);
  const posts = await getBlogPostsByTag(tag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <BlogListLayout
      title={`#${tag}`}
      description={`タグ「${tag}」の記事 ${posts.length}件`}
      posts={posts}
    />
  );
}
