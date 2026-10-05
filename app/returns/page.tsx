import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { pageAlternates } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "返品・交換について",
  description: "85-Store（ハコストア）の返品・交換についてです。オンラインストアと共通の内容です。",
  alternates: pageAlternates("/returns"),
};

export default function Page() {
  return <PolicyPage policyKey="refundPolicy" title="Returns" titleJa="返品・交換について" handle="refund-policy" />;
}
