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
  onlineShopUrl: "https://shop.85-store.com/",
  mapUrl: "https://maps.app.goo.gl/ZfyGqHvE4fZJY7He7",
  parkingUrl: "https://maps.app.goo.gl/tGRFs9VSyNqXdyfMA",
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

export const STORE_FULL_ADDRESS =
  `〒${STORE.address.postalCode} ${STORE.address.region}${STORE.address.locality}${STORE.address.street}`;

const SCHEMA_WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// schema.org の営業日（定休日を除いた曜日）
export const STORE_OPEN_DAYS_SCHEMA = SCHEMA_WEEKDAYS.filter(
  (_, day) => !(STORE.hours.closedWeekdays as readonly number[]).includes(day)
);

// 日本時間の現在時刻から営業状況を判定する（不定休は反映しない。Instagramでお知らせしている）
export type StoreStatus = "open" | "before" | "after" | "closed";

export function getStoreStatus(now: Date = new Date()): StoreStatus {
  const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  if ((STORE.hours.closedWeekdays as readonly number[]).includes(jst.getDay())) return "closed";

  const minutes = jst.getHours() * 60 + jst.getMinutes();
  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  if (minutes < toMinutes(STORE.hours.opens)) return "before";
  if (minutes >= toMinutes(STORE.hours.closes)) return "after";
  return "open";
}
