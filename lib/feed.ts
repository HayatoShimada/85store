import { Feed } from "feed";
import { getBlogPosts } from "@/lib/microcms";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

// ブログのRSS / Atomフィードを生成する
export async function buildBlogFeed(): Promise<Feed> {
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
    const url = `${siteUrl}/blog/${post.id}`;
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

  return feed;
}
