import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

export const metadata: Metadata = {
  title: "Contact（お問い合わせ）",
  alternates: { canonical: "/contact" },
  description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」へのお問い合わせ。店舗情報、営業時間、アクセス方法をご案内します。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: `${siteUrl}/contact`,
    siteName: "85-Store（ハコストア）",
    title: "Contact | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」へのお問い合わせ。店舗情報、営業時間、アクセス方法をご案内します。",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」へのお問い合わせ。店舗情報、営業時間、アクセス方法をご案内します。",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

