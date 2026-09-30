import type { Blog } from "@/types/microcms";

// 記事のURLパス。スラッグがあればスラッグ、なければmicroCMSのコンテンツID
export function getBlogPostPath(post: Pick<Blog, "id" | "slug">): string {
  return `/blog/${encodeURIComponent(post.slug || post.id)}`;
}
