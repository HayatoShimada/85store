import { Metadata } from "next";
import RndMark from "@/components/RndMark";
import StructuredData from "@/components/StructuredData";
import WorkCard from "@/components/WorkCard";
import { isExternalWork, WORKS } from "@/lib/works";
import { pageAlternates } from "@/lib/metadata";

import Phrase from "@/components/Phrase";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://85-store.com";

const description = "85-Store Research & Development（R&D）。85-Store（ハコストア）の研究開発。ゲーム「ハコネコはこちらを見ている」、ループするグラフィックのツール VividAtmos、ノートアプリ BlackBullet など。";

export const metadata: Metadata = {
  title: "R&D",
  alternates: pageAlternates("/rnd"),
  description,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: `${siteUrl}/rnd`,
    siteName: "85-Store（ハコストア）",
    title: "R&D | 85-Store（ハコストア）",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "R&D | 85-Store（ハコストア）",
    description,
  },
};

export default function RndPage() {
  return (
    <div className="wrap pt-12">
      <StructuredData
        type="ItemList"
        data={{
          name: "85-Store Research & Development がつくったもの",
          itemListElement: WORKS.map((work, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": work.kind === "Game" ? "VideoGame" : work.kind === "App" || work.kind === "Graphic" ? "SoftwareApplication" : "WebSite",
              name: work.name,
              url: isExternalWork(work) ? work.href : `${siteUrl}${work.href}`,
              description: work.description,
              image: `${siteUrl}${work.image}`,
              creator: { "@id": `${siteUrl}/#organization` },
            },
          })),
        }}
      />
      <p className="wordmark mb-6 text-[clamp(3rem,1rem+9vw,9rem)] leading-[0.85]" aria-hidden="true">R&amp;D</p>
      <div className="mb-12 flex items-start gap-[clamp(20px,4vw,48px)]">
        <RndMark className="h-[clamp(72px,10vw,120px)] w-auto flex-none" />
        <div>
          <h1 className="font-display text-lg font-semibold">85-Store Research &amp; Development</h1>
          <p className="mt-3 max-w-2xl leading-loose text-ink-2">
            <Phrase>{"洋服屋のかたわらで、ゲームや道具をつくり、研究しています。仕入れ担当のはやとが、デザインとプログラムの両方から手を動かしたものです。"}</Phrase>
          </p>
          <p className="mt-3 text-sm">
            <a href="https://github.com/85-Store-Research-Development" target="_blank" rel="noopener noreferrer" className="underline decoration-1 underline-offset-4 hover:decoration-2">
              GitHub（85-Store-Research-Development）<span className="sr-only"><Phrase>{"（別のサイトで開きます）"}</Phrase></span>
            </a>
          </p>
        </div>
      </div>
      <ul className="grid-lines grid-cols-2 max-[560px]:grid-cols-1">
        {WORKS.map((work) => <WorkCard key={work.slug} work={work} />)}
      </ul>
    </div>
  );
}
