import type { Blog, CmsImage } from "@/types/cms";

// 記事のURLパス（スラッグ。microCMS から移した記事は、そのコンテンツIDがスラッグになっている）
export function getBlogPostPath(post: Pick<Blog, "slug">): string {
  return `/blog/${encodeURIComponent(post.slug)}`;
}

// ブログの区分（/blog/<slug>）。ショップのメニューからもリンクしている。
// カテゴリの名前は CMS の「カテゴリ」と同じにする（Event1st / Event2nd は Reserve ページでも使う）
export const BLOG_SECTIONS = [
  { slug: "products", title: "商品ブログ", description: "入荷した商品やブランドの紹介", categories: ["Products"] },
  { slug: "styling", title: "スタイリング", description: "古着とセレクトアイテムのスタイリング", categories: ["Styling"] },
  { slug: "event", title: "イベント", description: "店内イベントと出店のお知らせ", categories: ["Event1st", "Event2nd", "出店イベント"] },
  { slug: "research", title: "Research & Development", description: "サイズ診断など、85-Store の開発と研究の進捗", categories: ["Research & Development"] },
] as const;

export type BlogSection = (typeof BLOG_SECTIONS)[number];
export type BlogSectionSlug = BlogSection["slug"];

export const getBlogSection = (slug: BlogSectionSlug): BlogSection => BLOG_SECTIONS.find((s) => s.slug === slug)!;
export const getBlogSectionPath = (section: Pick<BlogSection, "slug">) => `/blog/${section.slug}`;
export const getBlogCategoryPath = (category: string) => `/blog/category/${encodeURIComponent(category)}`;

// カテゴリの一覧のリンク先（区分に入るカテゴリは区分のページ）
export function getCategoryListPath(category: string): string {
  const section = BLOG_SECTIONS.find((s) => (s.categories as readonly string[]).includes(category));
  return section ? getBlogSectionPath(section) : getBlogCategoryPath(category);
}

// 一覧の上の絞り込み
export const BLOG_NAV: { href: string; label: string }[] = [
  { href: "/blog", label: "すべて" },
  ...BLOG_SECTIONS.map((s) => ({ href: getBlogSectionPath(s), label: s.title })),
  { href: getBlogCategoryPath("News"), label: "News" },
];

// アイキャッチが無い記事の既定の画像。Research & Development の記事は R&D のロゴ（og は SNS 用の横長）
const RESEARCH_EYECATCH: CmsImage = { url: "/images/rnd-eyecatch.png", width: 1200, height: 1500, og: "/images/rnd-og.png" };
const RESEARCH_CATEGORIES: readonly string[] = getBlogSection("research").categories;

export function getEyecatch(post: Pick<Blog, "eyecatch" | "category">): CmsImage | undefined {
  if (post.eyecatch) return post.eyecatch;
  return post.category?.some((name) => RESEARCH_CATEGORIES.includes(name)) ? RESEARCH_EYECATCH : undefined;
}
