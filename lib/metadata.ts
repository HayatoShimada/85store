import type { Metadata } from "next";

// RSS / Atom フィードの案内（<link rel="alternate">）
const FEED_TYPES = {
  "application/rss+xml": "/feed.xml",
  "application/atom+xml": "/atom.xml",
};

// ページの alternates。Next.js はページの alternates でレイアウトの値を丸ごと置き換えるため、
// canonical を書くページでもフィードの案内が消えないよう、必ずこれを使う
export function pageAlternates(canonical: string): Metadata["alternates"] {
  return { canonical, types: FEED_TYPES };
}

export const siteAlternates: Metadata["alternates"] = { types: FEED_TYPES };
