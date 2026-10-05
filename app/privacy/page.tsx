import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { pageAlternates } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "85-Store（ハコストア）のプライバシーポリシーです。オンラインストアと共通の内容です。",
  alternates: pageAlternates("/privacy"),
};

export default function Page() {
  return <PolicyPage policyKey="privacyPolicy" title="Privacy Policy" titleJa="プライバシーポリシー" handle="privacy-policy" />;
}
