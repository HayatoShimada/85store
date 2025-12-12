import { Metadata } from 'next';

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
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

