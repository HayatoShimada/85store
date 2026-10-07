import SectionHeading from "@/components/SectionHeading";
import { getShopPolicy, getShopPolicyUrl, type ShopPolicyKey } from "@/lib/shopify-storefront";

import { phraseHeadingsHtml } from "@/lib/phrase";
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
        <div className="article-body mx-0" dangerouslySetInnerHTML={{ __html: phraseHeadingsHtml(policy.body) }} />
      ) : (
        <p className="text-ink-2">
          内容を読み込めませんでした。
          <a href={shopUrl} className="underline underline-offset-4">オンラインストアの{titleJa}</a>
          をご確認ください。
        </p>
      )}
      <p className="mt-12 border-t border-rule pt-4 text-sm text-muted">
        この内容はオンラインストア（shop.85-store.com）と共通です。
        <a href={shopUrl} className="ml-1 underline underline-offset-4">オンラインストアで見る</a>
      </p>
    </div>
  );
}
