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
  // Google マップの埋め込みと同じ地点
  geo: { latitude: 36.56575, longitude: 136.96788 },
  hours: {
    opens: "12:00",
    closes: "18:00",
    // 0=日曜 … 6=土曜
    closedWeekdays: [4],
    label: "12:00〜18:00",
    closedLabel: "木曜定休",
    note: "事前予約で木曜と18:00〜20:00の延長営業が可能です。",
  },
  onlineShopUrl: "https://shop.85-store.com/",
  sns: {
    instagram: "https://www.instagram.com/85store_inami/",
    facebook: "https://www.facebook.com/profile.php?id=61580629616145",
    tiktok: "https://www.tiktok.com/@85store85",
    note: "https://note.com/85_store",
    spotify: "https://open.spotify.com/show/6tA2ppEmxZEzvraua6zLFV",
  },
} as const;

export const STORE_FULL_ADDRESS =
  `〒${STORE.address.postalCode} ${STORE.address.region}${STORE.address.locality}${STORE.address.street}`;

const SCHEMA_WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// schema.org の営業日（定休日を除いた曜日）
export const STORE_OPEN_DAYS_SCHEMA = SCHEMA_WEEKDAYS.filter(
  (_, day) => !(STORE.hours.closedWeekdays as readonly number[]).includes(day)
);
