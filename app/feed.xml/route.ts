import { buildBlogFeed } from "@/lib/feed";

export const revalidate = 3600;

export async function GET() {
  const feed = await buildBlogFeed();
  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
