import { Feed } from "feed";
import { cacheLife, cacheTag } from "next/cache";
import { getBlogPosts } from "@/lib/microcms";
import { getBlogPostPath } from "@/utils/blog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

// ブログのRSS / Atomフィードを生成する（記事と同じ "blogs" タグで再検証される）
export async function getBlogFeedXml(format: "rss" | "atom"): Promise<string> {
  "use cache";
  cacheTag("blogs");
  cacheLife("days");

  const posts = await getBlogPosts(20);
  const dateOf = (post: (typeof posts)[number]) =>
    new Date(post.publishedAt || post.createdAt);

  const feed = new Feed({
    id: `${siteUrl}/blog`,
    title: "85-Store Blog",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」のブログ。",
    link: `${siteUrl}/blog`,
    language: "ja",
    favicon: `${siteUrl}/logo.svg`,
    copyright: `© ${new Date().getFullYear()} 85-Store`,
    updated: posts.length > 0 ? dateOf(posts[0]) : undefined,
    feedLinks: {
      rss: `${siteUrl}/feed.xml`,
      atom: `${siteUrl}/atom.xml`,
    },
    author: { name: "85-Store", link: siteUrl },
  });

  for (const post of posts) {
    const url = `${siteUrl}${getBlogPostPath(post)}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.description || post.excerpt || undefined,
      date: dateOf(post),
      image: post.eyecatch?.url,
      category: post.category?.map((name) => ({ name })),
      author: post.author ? [{ name: post.author }] : undefined,
    });
  }

  return format === "rss" ? feed.rss2() : feed.atom1();
}
