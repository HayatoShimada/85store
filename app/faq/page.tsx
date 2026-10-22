import { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import StructuredData from "@/components/StructuredData";
import { FAQS } from "@/lib/faq";
import { pageAlternates } from "@/lib/metadata";

import Phrase from "@/components/Phrase";
import { SHORT_TEXT_LENGTH } from "@/lib/phrase";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://85-store.com";

const description = "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」のよくある質問。場所・営業時間・駐車場・予約・支払い方法・価格帯・オンラインストアについて。";

export const metadata: Metadata = {
  title: "よくある質問",
  alternates: pageAlternates("/faq"),
  description,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: `${siteUrl}/faq`,
    siteName: "85-Store（ハコストア）",
    title: "よくある質問 | 85-Store（ハコストア）",
    description,
  },
};

const linkClass = "underline decoration-1 underline-offset-4 hover:decoration-2";

export default function FaqPage() {
  return (
    <div className="wrap pt-12">
      <StructuredData
        type="FAQPage"
        data={{
          url: `${siteUrl}/faq`,
          mainEntity: FAQS.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
      <SectionHeading as="h1" title="FAQ" description="よくある質問" />
      <dl className="max-w-3xl">
        {FAQS.map((faq) => (
          <div key={faq.question} className="border-t border-rule py-8">
            <dt className="text-lg font-semibold"><Phrase>{faq.question}</Phrase></dt>
            <dd className="mt-3 leading-loose text-ink-2">
              <Phrase max={SHORT_TEXT_LENGTH}>{faq.answer}</Phrase>
              {faq.link && (
                <span className="mt-2 block">
                  {faq.link.href.startsWith("http") ? (
                    <a href={faq.link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>{faq.link.label}</a>
                  ) : (
                    <Link href={faq.link.href} className={linkClass}>{faq.link.label}</Link>
                  )}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p className="max-w-3xl border-t border-rule pt-8 text-sm text-muted">
        <Phrase>{"ほかにご不明な点があれば、"}</Phrase><Link href="/contact" className={linkClass}><Phrase>{"お問い合わせ"}</Phrase></Link><Phrase>{"からご連絡ください。"}</Phrase>
      </p>
    </div>
  );
}
