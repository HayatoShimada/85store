import { STORE, STORE_FULL_ADDRESS, STORE_PAYMENT_LABEL } from "@/lib/store-info";

// よくある質問（/faq の表示・FAQPage の構造化データ・llms.txt で共有する）。
// 回答は AI や検索の回答にそのまま引用されやすいよう、1文目で結論を言い切る
export type Faq = { question: string; answer: string; link?: { href: string; label: string } };

export const FAQS: Faq[] = [
  {
    question: "85-Store（ハコストア）はどんなお店ですか？",
    answer: `富山県南砺市井波にある古着・セレクトショップです。${STORE.vintage.join("・")}と、${STORE.brands.join("・")}などの新品を、手に取りやすい価格で扱っています。「もう一度洋服を好きになれる場所」をコンセプトにしています。`,
  },
  {
    question: "お店の場所はどこですか？",
    answer: `${STORE_FULL_ADDRESS}です。井波の町なかにあり、1階がセレクトショップの85-Store、2階が共創スペースの85-UpStoreです。`,
    link: { href: STORE.mapUrl, label: "Google マップで開く" },
  },
  {
    question: "営業時間と定休日を教えてください。",
    answer: `営業時間は${STORE.hours.label}、定休日は${STORE.hours.closedDays}です。${STORE.hours.note}営業日はサイトの営業日カレンダーで確認でき、営業時間の変更や急なお休みは Instagram のストーリーでお知らせします。`,
    link: { href: "/#calendar", label: "営業日カレンダー" },
  },
  {
    question: "駐車場はありますか？",
    answer: `あります。${STORE.parkingNote}`,
    link: { href: STORE.parkingUrl, label: "駐車場の地図" },
  },
  {
    question: "来店に予約は必要ですか？",
    answer: `基本的に予約は不要です。営業時間（${STORE.hours.label}）中はそのままご来店ください。定休日の木曜日と18:00〜20:00の延長営業は事前予約制で、来店予約のページから予約できます。`,
    link: { href: "/reserve", label: "来店予約" },
  },
  {
    question: "支払い方法は何が使えますか？",
    answer: `店頭では${STORE_PAYMENT_LABEL}が使えます。`,
  },
  {
    question: "価格帯はどれくらいですか？",
    answer: `おおよそ${STORE.priceRange}です。古着を中心に、手に取りやすい価格帯でそろえています。`,
  },
  {
    question: "古着の買取はしていますか？",
    answer: "買取は行っていません。",
  },
  {
    question: "オンラインで購入できますか？",
    answer: `できます。オンラインストア（${STORE.onlineShopUrl}）で購入でき、全国と海外へ発送しています。国内は佐川急便で、原則ご注文の翌営業日に発送し、送料は10,000円以上のご購入で無料、10,000円未満は一律500円です。海外へは日本郵便（EMS など）で発送します。くわしくはサイトの「配送について」「返品・交換」のページをご覧ください。`,
    link: { href: STORE.onlineShopUrl, label: "オンラインストア" },
  },
  {
    question: "2階の85-UpStoreとは何ですか？",
    answer: "85-Store の2階にある共創スペースです。ポップアップ、展示、ワークショップなど、井波で活動する事業者やクリエイターが使える場所です。",
    link: { href: "/upstore", label: "85-UpStore について" },
  },
  {
    question: "問い合わせ方法を教えてください。",
    answer: `サイトのお問い合わせフォーム、メール（${STORE.email}）、電話（${STORE.telephone}）で受け付けています。`,
    link: { href: "/contact", label: "お問い合わせ" },
  },
];
