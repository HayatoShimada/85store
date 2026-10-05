import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { pageAlternates } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "利用規約",
  description: "85-Store（ハコストア）の利用規約です。オンラインストアと共通の内容です。",
  alternates: pageAlternates("/terms"),
};

export default function Page() {
  return <PolicyPage policyKey="termsOfService" title="Terms of Service" titleJa="利用規約" handle="terms-of-service" />;
}
