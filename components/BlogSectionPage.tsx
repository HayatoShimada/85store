import type { Metadata } from "next";
import BlogListLayout from "@/components/BlogListLayout";
import { getBlogPostsByCategories } from "@/lib/cms";
import { type BlogSectionSlug, getBlogSection, getBlogSectionPath } from "@/utils/blog";

// ブログの区分のページ（/blog/products など）。記事がまだ無い区分も、一覧を空で出す
export function blogSectionMetadata(slug: BlogSectionSlug): Metadata {
  const section = getBlogSection(slug);
  const path = getBlogSectionPath(section);
  const description = `85-Store（ハコストア）のブログから、${section.description}をまとめています。`;
  return {
    title: `${section.title} | Blog`,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "ja_JP", url: path, title: `${section.title} | Blog`, description },
  };
}

export default async function BlogSectionPage({ slug }: { slug: BlogSectionSlug }) {
  const section = getBlogSection(slug);
  const posts = await getBlogPostsByCategories(section.categories);
  return (
    <BlogListLayout
      title={section.title}
      description={section.description}
      posts={posts}
      currentPath={getBlogSectionPath(section)}
    />
  );
}
