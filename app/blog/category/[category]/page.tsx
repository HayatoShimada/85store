import { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogListLayout from "@/components/BlogListLayout";
import { getBlogPostsByCategory, getAllCategories } from "@/lib/cms";
import { nonEmptyParams } from "@/utils/static-params";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  // エンコードせずに返す（エンコードすると二重エンコードになり、日本語カテゴリが404になる）
  return nonEmptyParams("category", categories);
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryName = decodeURIComponent((await params).category);
  const path = `/blog/category/${encodeURIComponent(categoryName)}`;
  const description = `85-Store（ハコストア）のブログから「${categoryName}」の記事をまとめています。`;

  return {
    title: `${categoryName} | Blog`,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "ja_JP", url: path, title: `${categoryName} | Blog`, description },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryName = decodeURIComponent((await params).category);

  const [posts, categories] = await Promise.all([
    getBlogPostsByCategory(categoryName),
    getAllCategories(),
  ]);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <BlogListLayout
      title={categoryName}
      description={`カテゴリ「${categoryName}」の記事 ${posts.length}件`}
      posts={posts}
      categories={categories}
      currentCategory={categoryName}
    />
  );
}
