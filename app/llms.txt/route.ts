import { getLlmsTxt } from "@/lib/llms";

export async function GET() {
  return new Response(await getLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
