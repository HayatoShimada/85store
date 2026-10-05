// 店舗情報の唯一の定義元。表示（ヘッダー・フッター・店舗案内）と構造化データの両方で使う
export const STORE = {
  name: "85-Store（ハコストア）",
  shortName: "85-Store",
  description: "富山県南砺市井波の古着・セレクトショップ。オーセンティックな古着とニューアイテムを提案するセレクトショップです。",
  address: {
    postalCode: "932-0217",
    region: "富山県",
    locality: "南砺市",
    street: "本町4丁目100",
  },
  // Google マップ上の「85-Store」の地点
  geo: { latitude: 36.56575, longitude: 136.97045 },
  // 通常の営業時間（営業日カレンダーのAPIが使えないときの既定値・構造化データ・静的な文言に使う。
  // 実際の休業日や時間変更は管理画面で設定する: lib/business-calendar.ts）
  hours: {
    opens: "12:00",
    closes: "18:00",
    // 0=日曜 … 6=土曜
    closedWeekdays: [4],
    label: "12:00〜18:00",
    closedDays: "木曜日（不定休あり）",
    closedLabel: "木曜定休（不定休あり）",
    note: "事前予約で木曜と18:00〜20:00の延長営業が可能です。",
  },
  telephone: "070-8447-0934",
  email: "info@85-store.com",
  // 店頭の価格帯（構造化データの priceRange・FAQ）
  priceRange: "3,000〜30,000円",
  // 店頭で使える支払い方法
  payment: {
    creditCards: ["Visa", "Mastercard", "JCB", "American Express", "Diners Club", "Discover"],
    eMoney: ["交通系IC", "iD", "QUICPay"],
    qr: ["PayPay", "楽天ペイ", "d払い", "WeChat Pay", "Alipay+"],
  },
  // 取り扱い（新品のブランドと古着の種類）
  brands: ["River", "VOIRY", "SOWBOW", "Macmahon Knitting Mills", "Building"],
  vintage: ["アメリカ古着", "ヨーロッパ古着", "国内ドメブラ古着"],
  // 対象エリア（構造化データの areaServed）
  areaServed: ["南砺市", "砺波市", "富山県"],
  onlineShopUrl: "https://shop.85-store.com/",
  // Google マップの Maps URLs（https://developers.google.com/maps/documentation/urls）。
  // スマホでは Google マップのアプリで開く。maps.app.goo.gl の短縮リンクは Firebase Dynamic Links の終了でアプリが開かないことがある
  mapUrl: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("85-Store 富山県南砺市本町4丁目100"),
  parkingUrl: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("井波児童公園 富山県南砺市"),
  // お店の前は道幅が狭いため、近くの駐車場を案内する
  parkingNote: "お店の前にも駐車場がありますが、道幅が狭く大きめの車は難しいため、「井波社会福祉センター」か「井波児童公園」の駐車場がおすすめです（お店まで徒歩30秒）。",
  mapEmbedUrl: "https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s36.5657509,136.9704516!6i18!3m1!1sja!5m1!1sja",
  sns: {
    instagram: "https://www.instagram.com/85store_inami/",
    facebook: "https://www.facebook.com/profile.php?id=61580629616145",
    tiktok: "https://www.tiktok.com/@85store85",
    note: "https://note.com/85_store",
    spotify: "https://open.spotify.com/show/6tA2ppEmxZEzvraua6zLFV",
  },
} as const;

// schema.org 用の国際形式の電話番号
export const STORE_TELEPHONE_INTL = `+81-${STORE.telephone.replace(/^0/, "")}`;

// 支払い方法の一文（FAQ・llms.txt）
export const STORE_PAYMENT_LABEL =
  `現金、クレジットカード（${STORE.payment.creditCards.join("・")}）、電子マネー（${STORE.payment.eMoney.join("・")}）、QRコード決済（${STORE.payment.qr.join("・")} など）`;

export const STORE_FULL_ADDRESS =
  `〒${STORE.address.postalCode} ${STORE.address.region}${STORE.address.locality}${STORE.address.street}`;

const SCHEMA_WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// schema.org の営業日（定休日を除いた曜日）
export const STORE_OPEN_DAYS_SCHEMA = SCHEMA_WEEKDAYS.filter(
  (_, day) => !(STORE.hours.closedWeekdays as readonly number[]).includes(day)
);
