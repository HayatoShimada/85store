import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "配送について",
  description: "85-Store（ハコストア）の配送についてです。オンラインストアと共通の内容です。",
  alternates: { canonical: "/shipping" },
};

export default function Page() {
  return <PolicyPage policyKey="shippingPolicy" title="Shipping" titleJa="配送について" handle="shipping-policy" />;
}
