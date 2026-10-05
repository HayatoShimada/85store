import { cacheLife, cacheTag } from "next/cache";
import { getBlogPosts } from "@/lib/cms";
import { FAQS } from "@/lib/faq";
import { STORE, STORE_FULL_ADDRESS, STORE_PAYMENT_LABEL } from "@/lib/store-info";
import { WORKS } from "@/lib/works";
import { getBlogPostPath } from "@/utils/blog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

const absolute = (href: string) => (href.startsWith("http") ? href : `${siteUrl}${href}`);

// AI（LLM）向けのサイトの要約（https://llmstxt.org/ の形式）。記事と同じ "blogs" タグで再検証される
export async function getLlmsTxt(): Promise<string> {
  "use cache";
  cacheTag("blogs");
  cacheLife("days");

  const posts = await getBlogPosts(10);

  return `# ${STORE.name}

> 富山県南砺市井波にある古着・セレクトショップ。${STORE.vintage.join("・")}と、${STORE.brands.join("・")}などの新品を、手に取りやすい価格（おおよそ${STORE.priceRange}）で扱う。コンセプトは「もう一度洋服を好きになれる場所」。2階は共創スペース「85-UpStore」。

## 店舗情報

- 店名: ${STORE.shortName}（読み: ハコストア）
- 業種: 古着屋・セレクトショップ
- 住所: ${STORE_FULL_ADDRESS}
- 営業時間: ${STORE.hours.label}
- 定休日: ${STORE.hours.closedDays}
- 予約: 基本的に不要。${STORE.hours.note}
- 駐車場: ${STORE.parkingNote}
- 支払い方法: ${STORE_PAYMENT_LABEL}
- 買取: 行っていない
- 電話: ${STORE.telephone}
- メール: ${STORE.email}
- Google マップ: ${STORE.mapUrl}
- オンラインストア: ${STORE.onlineShopUrl}（全国・海外へ発送）
- Instagram: ${STORE.sns.instagram}（営業時間の変更や急なお休みはストーリーでお知らせ）

## ページ

- [お店について](${siteUrl}/about): コンセプト・取り扱いブランド・スタッフ・沿革
- [よくある質問](${siteUrl}/faq): 場所・営業時間・駐車場・予約・支払い方法・価格帯
- [来店予約](${siteUrl}/reserve): 延長営業や定休日の来店予約、イベント
- [85-UpStore](${siteUrl}/upstore): 2階の共創スペース（ポップアップ・展示・ワークショップ）
- [ブログ](${siteUrl}/blog): 入荷・スタイリング・イベントのお知らせ
- [お問い合わせ](${siteUrl}/contact)
- [配送について](${siteUrl}/shipping)・[返品・交換](${siteUrl}/returns)

## よくある質問

${FAQS.map((faq) => `### ${faq.question}\n\n${faq.answer}`).join("\n\n")}

## 最新のブログ記事

${posts.map((post) => `- [${post.title}](${siteUrl}${getBlogPostPath(post)})${post.description ? `: ${post.description}` : ""}`).join("\n")}

## つくったもの

${WORKS.map((work) => `- [${work.name}](${absolute(work.href)}): ${work.description}`).join("\n")}
`;
}
