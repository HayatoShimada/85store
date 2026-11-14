import { Metadata } from "next";
import Link from "next/link";
import RndMark from "@/components/RndMark";
import StructuredData from "@/components/StructuredData";
import WorkCard from "@/components/WorkCard";
import ActivityList from "@/components/rnd/ActivityList";
import RoadmapGantt from "@/components/rnd/RoadmapGantt";
import SectionHeading from "@/components/SectionHeading";
import { cacheLife } from "next/cache";
import { isExternalWork, WORKS } from "@/lib/works";
import { PILLARS, PRINCIPLES, REPOS, RND_DATA, RND_GOAL, RND_ORG_URL, RND_SUMMARY, repoUrl } from "@/lib/rnd";
import { formatDate } from "@/utils/date";
import { pageAlternates } from "@/lib/metadata";

import Phrase from "@/components/Phrase";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://85-store.com";

const description = "85-Store Research & Development（R&D）。AI の時代に洋服屋の買い物をもっと楽しくする、85-Store（ハコストア）の研究開発。活動指針・ロードマップ・GitHub の開発状況・つくったもの。";

// ガントチャートの「今日」（日本時間。1時間ごとに取り直す）
async function getToday() {
  "use cache";
  cacheLife("hours");
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());
}

const linkClass = "underline decoration-1 underline-offset-4 hover:decoration-2";

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

export default async function RndPage() {
  const today = await getToday();
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
      <div className="flex items-end justify-between gap-6 border-b border-ink pb-6">
        <p className="wordmark text-[clamp(3rem,1rem+9vw,9rem)] leading-[0.85]" aria-hidden="true">R&amp;D</p>
        <RndMark className="h-[clamp(72px,9vw,132px)] w-auto flex-none" />
      </div>
      <div className="grid gap-x-[clamp(24px,5vw,80px)] gap-y-8 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <h1 className="font-display text-[clamp(1.75rem,1.1rem+2vw,2.75rem)] leading-[1.02] tracking-tight">
          <span className="block font-light">85-Store</span>
          <span className="block font-extrabold">Research <span className="text-[#C8361E]">&amp;</span></span>
          <span className="block font-extrabold">Development</span>
        </h1>
        <div>
          <p className="text-2xl font-bold leading-snug tracking-tight text-balance"><Phrase>{RND_SUMMARY.lead}</Phrase></p>
          <p className="mt-4 max-w-[34em] leading-loose text-ink-2"><Phrase>{RND_SUMMARY.body}</Phrase></p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={RND_ORG_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              GitHub<span className="sr-only"><Phrase>{"（別のサイトで開きます）"}</Phrase></span>
            </a>
            <Link href="/blog/research" className="btn btn-secondary"><Phrase>{"研究開発の記事"}</Phrase></Link>
          </div>
        </div>
      </div>

      <section className="section" aria-labelledby="principles-heading">
        <SectionHeading id="principles-heading" title="Principles" description="活動指針" />
        <ol className="grid-lines grid-cols-3 max-[900px]:grid-cols-1">
          {PRINCIPLES.map((principle, i) => (
            <li key={principle.name} className="flex flex-col gap-4 p-[clamp(20px,2.5vw,32px)]">
              <p className="num text-xs text-muted">0{i + 1}</p>
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight">{principle.name}</h3>
                <p className="text-sm text-muted"><Phrase>{principle.ja}</Phrase></p>
              </div>
              <p className="font-semibold leading-relaxed"><Phrase>{principle.lead}</Phrase></p>
              <dl className="mt-auto space-y-3 border-t border-rule pt-4">
                {principle.items.map((item) => (
                  <div key={item.name}>
                    <dt className="font-display text-sm font-bold">{item.name}</dt>
                    <dd className="text-sm leading-relaxed text-ink-2"><Phrase>{item.body}</Phrase></dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" aria-labelledby="focus-heading">
        <SectionHeading id="focus-heading" title="Focus" description="いま取り組んでいる課題" />
        <p className="mb-8 max-w-3xl text-2xl font-bold leading-snug tracking-tight text-balance"><Phrase>{RND_GOAL}</Phrase></p>
        <ul className="grid-lines grid-cols-4 max-[1000px]:grid-cols-2 max-[560px]:grid-cols-1">
          {PILLARS.map((pillar) => (
            <li key={pillar.key} className="p-[clamp(20px,2.5vw,28px)]">
              <p className="font-display text-sm font-bold tracking-wide">{pillar.name}</p>
              <h3 className="mt-2 font-semibold leading-snug"><Phrase>{pillar.title}</Phrase></h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2"><Phrase>{pillar.body}</Phrase></p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="roadmap-heading">
        <SectionHeading id="roadmap-heading" title="Road Map" description="これからの予定（GitHub Project から）" />
        <RoadmapGantt items={RND_DATA.roadmap} today={today} />
        <p className="mt-3 text-xs text-muted">
          <time dateTime={RND_DATA.generatedAt}>{formatDate(RND_DATA.generatedAt)}</time> 時点
        </p>
      </section>

      <section className="section" aria-labelledby="activity-heading">
        <SectionHeading id="activity-heading" title="Activity" description="公開しているリポジトリの最近の動き" />
        <div className="grid grid-cols-2 gap-x-[clamp(24px,4vw,64px)] gap-y-10 max-[800px]:grid-cols-1">
          <div>
            <h3 className="mb-3 font-display text-lg font-bold">Pull Requests</h3>
            <ActivityList items={RND_DATA.pulls} />
          </div>
          <div>
            <h3 className="mb-3 font-display text-lg font-bold">Issues</h3>
            <ActivityList items={RND_DATA.issues} />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="repos-heading">
        <SectionHeading id="repos-heading" title="Repositories" description="リポジトリ" />
        <ul className="grid-lines grid-cols-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
          {REPOS.map((repo) => (
            <li key={repo.name} className="flex flex-col gap-2 p-[clamp(18px,2vw,24px)]">
              <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span className={`chip ${repo.isPublic ? "border-ink text-ink" : ""}`}>{repo.isPublic ? "Public" : "Private"}</span>
                <span>{repo.place}</span>
              </p>
              <h3 className="font-display font-bold">
                {repo.isPublic ? (
                  <a href={repoUrl(repo)} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {repo.name}<span className="sr-only"><Phrase>{"（別のサイトで開きます）"}</Phrase></span>
                  </a>
                ) : (
                  repo.name
                )}
              </h3>
              <p className="text-sm leading-relaxed text-ink-2"><Phrase>{repo.role}</Phrase></p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="works-heading">
        <SectionHeading id="works-heading" title="Works" description="つくったもの" />
        <ul className="grid-lines grid-cols-2 max-[560px]:grid-cols-1">
          {WORKS.map((work) => <WorkCard key={work.slug} work={work} />)}
        </ul>
      </section>
    </div>
  );
}
