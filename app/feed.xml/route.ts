import { getBlogFeedXml } from "@/lib/feed";

export async function GET() {
  return new Response(await getBlogFeedXml("rss"), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
