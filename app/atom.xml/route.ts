import { getBlogFeedXml } from "@/lib/feed";

export async function GET() {
  return new Response(await getBlogFeedXml("atom"), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
