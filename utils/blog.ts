import type { Blog } from "@/types/cms";

// 記事のURLパス（スラッグ。microCMS から移した記事は、そのコンテンツIDがスラッグになっている）
export function getBlogPostPath(post: Pick<Blog, "slug">): string {
  return `/blog/${encodeURIComponent(post.slug)}`;
}
