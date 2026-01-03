import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

export const metadata: Metadata = {
  title: "Contact | 富山県南砺市井波の古着・セレクトショップ 85-Store",
  description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」へのお問い合わせ。店舗情報、営業時間、アクセス方法をご案内します。",
  keywords: [
    "富山",
    "南砺市",
    "井波",
    "古着",
    "セレクトショップ",
    "85-Store",
    "ハコストア",
    "お問い合わせ",
    "店舗情報",
    "アクセス",
    "営業時間",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: `${siteUrl}/contact`,
    siteName: "85-Store（ハコストア）",
    title: "Contact | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」へのお問い合わせ。店舗情報、営業時間、アクセス方法をご案内します。",
    images: [
      {
        url: `${siteUrl}/logo.svg`,
        width: 1200,
        height: 630,
        alt: "85-Store（ハコストア）",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」へのお問い合わせ。店舗情報、営業時間、アクセス方法をご案内します。",
    images: [`${siteUrl}/logo.svg`],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

