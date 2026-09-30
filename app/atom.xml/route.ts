import { buildBlogFeed } from "@/lib/feed";

export const revalidate = 3600;

export async function GET() {
  const feed = await buildBlogFeed();
  return new Response(feed.atom1(), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
