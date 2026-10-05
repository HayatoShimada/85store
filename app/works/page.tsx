import { Metadata } from "next";
import WorkCard from "@/components/WorkCard";
import { WORKS } from "@/lib/works";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://85-store.com";

const description = "85-Store（ハコストア）がつくったもの。ゲーム「ハコネコはこちらを見ている」、ループするグラフィックのツール VividAtmos、ノートアプリ BlackBullet など。";

export const metadata: Metadata = {
  title: "Works",
  alternates: { canonical: "/works" },
  description,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: `${siteUrl}/works`,
    siteName: "85-Store（ハコストア）",
    title: "Works | 85-Store（ハコストア）",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Works | 85-Store（ハコストア）",
    description,
  },
};

export default function WorksPage() {
  return (
    <div className="wrap pt-12">
      <p className="wordmark mb-6 text-[clamp(3rem,1rem+9vw,9rem)] leading-[0.85]" aria-hidden="true">Works</p>
      <h1 className="text-lg font-semibold">85-Store がつくったもの</h1>
      <p className="mt-3 mb-12 max-w-2xl leading-loose text-ink-2">
        洋服屋のかたわらで、ゲームや道具もつくっています。仕入れ担当のはやとが、デザインとプログラムの両方から手を動かしたものです。
      </p>
      <ul className="grid-lines grid-cols-2 max-[560px]:grid-cols-1">
        {WORKS.map((work) => <WorkCard key={work.slug} work={work} />)}
      </ul>
    </div>
  );
}
