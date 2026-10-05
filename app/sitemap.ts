import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/cms";
import { BLOG_SECTIONS, getBlogCategoryPath, getBlogPostPath, getBlogSectionPath } from "@/utils/blog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

const STATIC_PAGES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "daily", priority: 1.0 },
  { path: "/blog", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/reserve", changeFrequency: "monthly", priority: 0.7 },
  { path: "/upstore", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/works", changeFrequency: "monthly", priority: 0.5 },
  { path: "/hakoneko", changeFrequency: "monthly", priority: 0.5 },
  { path: "/shipping", changeFrequency: "yearly", priority: 0.3 },
  { path: "/returns", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllBlogPosts();
  const lastModifiedOf = (post: (typeof posts)[number]) =>
    new Date(post.updatedAt || post.publishedAt || post.createdAt);

  const latestPostDate = posts.length > 0
    ? new Date(Math.max(...posts.map((post) => lastModifiedOf(post).getTime())))
    : undefined;

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    // トップとブログ一覧は最新記事の更新日を反映する
    lastModified: path === "" || path === "/blog" ? latestPostDate : undefined,
    changeFrequency,
    priority,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}${getBlogPostPath(post)}`,
    lastModified: lastModifiedOf(post),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // カテゴリごとに最新記事の更新日を集計
  const categoryDates = new Map<string, Date>();
  for (const post of posts) {
    for (const category of post.category ?? []) {
      const date = lastModifiedOf(post);
      const current = categoryDates.get(category);
      if (!current || date > current) categoryDates.set(category, date);
    }
  }

  // 区分のページ（記事が無い区分も出す）。区分に入るカテゴリのうち、区分と同じもの（Products など）は転送するので出さない
  const sectionEntries: MetadataRoute.Sitemap = BLOG_SECTIONS.map((section) => {
    const dates = section.categories.flatMap((c) => categoryDates.get(c) ?? []);
    return {
      url: `${siteUrl}${getBlogSectionPath(section)}`,
      lastModified: dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined,
      changeFrequency: "weekly",
      priority: 0.6,
    };
  });
  const redirected = new Set(BLOG_SECTIONS.filter((s) => s.categories.length === 1).map((s) => s.categories[0] as string));

  const categoryEntries: MetadataRoute.Sitemap = Array.from(categoryDates)
    .filter(([category]) => !redirected.has(category))
    .map(([category, date]) => ({
      url: `${siteUrl}${getBlogCategoryPath(category)}`,
      lastModified: date,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  return [...staticEntries, ...postEntries, ...sectionEntries, ...categoryEntries];
}
