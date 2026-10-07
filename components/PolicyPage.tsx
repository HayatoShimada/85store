import SectionHeading from "@/components/SectionHeading";
import { getShopPolicy, getShopPolicyUrl, type ShopPolicyKey } from "@/lib/shopify-storefront";

import { phraseShortTextHtml } from "@/lib/phrase";
import Phrase from "@/components/Phrase";
interface PolicyPageProps {
  policyKey: ShopPolicyKey;
  title: string; // 英語の見出し
  titleJa: string;
  handle: string; // オンラインストアのポリシーのハンドル（取得できないときのリンク先）
}

// オンラインストア（Shopify）で管理しているポリシーをそのまま表示する
export default async function PolicyPage({ policyKey, title, titleJa, handle }: PolicyPageProps) {
  const policy = await getShopPolicy(policyKey);
  const shopUrl = getShopPolicyUrl(policy?.handle ?? handle);

  return (
    <div className="wrap pt-12">
      <SectionHeading as="h1" title={title} description={titleJa} />
      {policy ? (
        <div className="article-body mx-0" dangerouslySetInnerHTML={{ __html: phraseShortTextHtml(policy.body) }} />
      ) : (
        <p className="text-ink-2">
          <Phrase>{"内容を読み込めませんでした。"}</Phrase>
          <a href={shopUrl} className="underline underline-offset-4"><Phrase>{"オンラインストアの"}</Phrase>{titleJa}</a>
          <Phrase>{"をご確認ください。"}</Phrase>
        </p>
      )}
      <p className="mt-12 border-t border-rule pt-4 text-sm text-muted">
        <Phrase>{"この内容はオンラインストア（shop.85-store.com）と共通です。"}</Phrase>
        <a href={shopUrl} className="ml-1 underline underline-offset-4"><Phrase>{"オンラインストアで見る"}</Phrase></a>
      </p>
    </div>
  );
}
