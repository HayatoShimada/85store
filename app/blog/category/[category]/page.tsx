import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import BlogListLayout from "@/components/BlogListLayout";
import { getBlogPostsByCategory, getAllCategories } from "@/lib/cms";
import { BLOG_SECTIONS, getBlogCategoryPath, getBlogSectionPath } from "@/utils/blog";
import { nonEmptyParams } from "@/utils/static-params";
import { pageAlternates } from "@/lib/metadata";

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
  const path = getBlogCategoryPath(categoryName);
  const description = `85-Store（ハコストア）のブログから「${categoryName}」の記事をまとめています。`;

  return {
    title: `${categoryName} | Blog`,
    description,
    alternates: pageAlternates(path),
    openGraph: { type: "website", locale: "ja_JP", url: path, title: `${categoryName} | Blog`, description },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryName = decodeURIComponent((await params).category);

  // そのカテゴリだけの区分（Products・Styling）は区分のページへ
  const section = BLOG_SECTIONS.find((s) => s.categories.length === 1 && s.categories[0] === categoryName);
  if (section) permanentRedirect(getBlogSectionPath(section));

  const posts = await getBlogPostsByCategory(categoryName);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <BlogListLayout
      title={categoryName}
      description={`カテゴリ「${categoryName}」の記事 ${posts.length}件`}
      posts={posts}
      currentPath={getBlogCategoryPath(categoryName)}
    />
  );
}
