// 85-Store周辺マップ（/map）のスポットデータ
// Googleマイマップ「85-Storeの井波マップ」と同期して管理する
// https://www.google.com/maps/d/edit?mid=108ah4cb-FpmlERaDeUIKIZY0Z1aXNHI

export const MY_MAP_ID = "108ah4cb-FpmlERaDeUIKIZY0Z1aXNHI";
export const MY_MAP_EMBED_URL = `https://www.google.com/maps/d/embed?mid=${MY_MAP_ID}&ehbc=2E312F`;
export const MY_MAP_VIEW_URL = `https://www.google.com/maps/d/viewer?mid=${MY_MAP_ID}`;

export interface SpotImage {
  /** /public 配下のローカルパス（例: /map-images/zuisenji.jpg） */
  src: string;
  alt: string;
  /** 撮影者・出典表記（例: "Photo: ○○"） */
  credit: string;
  /** 出典ページURL（Wikimedia Commonsのファイルページ等） */
  creditUrl: string;
  /** ライセンス表記（例: "CC BY-SA 4.0"） */
  license: string;
}

export interface MapSpot {
  name: string;
  description: string;
  lat: number;
  lng: number;
  /** 公式サイトURL */
  url?: string;
  /** 公式InstagramURL */
  instagram?: string;
  /** 営業時間・定休日など（変わりやすいので目安として表示） */
  hours?: string;
  /** フリーライセンス画像（出典必須）。店舗提供・自前撮影の写真に差し替え可 */
  image?: SpotImage;
}

export interface MapCategory {
  id: string;
  en: string;
  ja: string;
  description: string;
  spots: MapSpot[];
}

// 85-Store（徒歩時間の起点）
const ORIGIN = { lat: 36.5657509, lng: 136.9704516 };

// 直線距離 × 経路係数1.3、徒歩80m/分で概算
export function walkingMinutes(spot: MapSpot): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(spot.lat - ORIGIN.lat);
  const dLng = toRad(spot.lng - ORIGIN.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(ORIGIN.lat)) * Math.cos(toRad(spot.lat)) * Math.sin(dLng / 2) ** 2;
  const distance = 2 * R * Math.asin(Math.sqrt(a));
  return Math.max(1, Math.ceil((distance * 1.3) / 80));
}

export function googleMapsUrl(spot: MapSpot): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.name} 南砺市`)}`;
}

export const mapCategories: MapCategory[] = [
  {
    id: "shop",
    en: "Shop",
    ja: "ショップ・雑貨",
    description: "井波の町を歩きながら立ち寄りたいお店。",
    spots: [
      {
        name: "85-Store",
        description:
          "わたしたちのお店。オーセンティックな古着とニューアイテムを提案するセレクトショップです。まずはここからスタート。",
        lat: 36.5657509,
        lng: 136.9704516,
      },
      {
        name: "KaraKasa（カラカサ）",
        description:
          "夫婦で営む古着とカフェのお店。「ちょっとした雨宿りのように、誰でも気軽に立ち寄れる場所」という想いが店名に込められています。",
        lat: 36.560439,
        lng: 136.9715874,
        instagram: "https://www.instagram.com/karakasa.44c75/",
      },
      {
        name: "Lantern",
        description:
          "元印刷所の事務所を改装した、和の空間にアメリカ古着が並ぶ古着屋。1960年代以降のヴィンテージを中心に扱っています。85-Storeと合わせて井波の古着めぐりをどうぞ。",
        lat: 36.5637262,
        lng: 136.9691263,
        url: "https://lanternhouse.thebase.in/",
        instagram: "https://www.instagram.com/lantern.vintage/",
        hours: "12:00 – 18:00 / 水・木曜定休（不定休あり）",
      },
    ],
  },
  {
    id: "food",
    en: "Eat & Drink",
    ja: "食事・お酒",
    description: "ランチから夜まで。85-Storeスタッフも通うお店。",
    spots: [
      {
        name: "nomi",
        description:
          "「木彫りの街の燻製料理とイタリアン」を掲げる一軒。南砺卵や五箇山豆腐、南砺ポークベーコンなど地元食材の燻製盛り合わせが名物で、クラフトビールやワインも揃います。予約がおすすめ。",
        lat: 36.5640836,
        lng: 136.9695343,
        url: "https://nomi-cafe.com/",
        instagram: "https://www.instagram.com/nomi_smoke/",
        hours: "ディナー 18:00 – 22:30 / 月・火曜定休",
      },
      {
        name: "LAW",
        description:
          "元洋服仕立て屋をリノベーションした自家培養天然酵母のパン屋。小麦・水・酵母・塩だけで作るしっとりしたパンが評判で、イチジクとカシューナッツのパンが人気です。",
        lat: 36.5590352,
        lng: 136.9691521,
        instagram: "https://www.instagram.com/law_inami/",
        hours: "11:00 – 17:00 / 定休日はSNSでご確認ください",
      },
      {
        name: "井波 かすがい",
        description:
          "旧井波美術館の歴史的建物を改装した、江戸前天ぷらと小鉢料理のお店。地元農家の野菜と富山湾の魚を使った天ぷら定食や天丼が楽しめます。カウンター8席。",
        lat: 36.5603246,
        lng: 136.9708749,
        instagram: "https://www.instagram.com/kasugai_inami/",
        hours: "ランチ 11:30 – 14:00 / ディナー 18:00 – 23:00（営業日はSNSでご確認ください）",
      },
      {
        name: "炭焼きイタリアンバル LEONE（レオーネ）",
        description:
          "「よいとこ井波」1階にある炭焼きイタリアンバル。玄関には井波彫刻が飾られ、炭焼き料理とお酒を楽しめます。",
        lat: 36.5602904,
        lng: 136.969266,
        instagram: "https://www.instagram.com/leone_inami2025/",
        hours: "17:30 – 23:00 / 火曜・第1第3月曜定休",
      },
      {
        name: "まる来",
        description:
          "85-Storeから歩いてすぐの地元の居酒屋。焼き餃子やカレー味の唐揚げなど、気取らない一品料理と海鮮が揃います。",
        lat: 36.5650302,
        lng: 136.9726161,
        hours: "17:00 – 24:00 / 不定休",
      },
      {
        name: "NAT.BREW（ナットブリュー）",
        description:
          "「その土地を醸す」をテーマに、古民家を改装した醸造所で庄川水系の湧き水を仕込み水に使うクラフトビールブルワリー。干し柿やクロモジなど南砺の素材を使ったビールはお土産にもおすすめです。",
        lat: 36.5649019,
        lng: 136.969017,
        url: "https://www.nat-brew.com/",
        instagram: "https://www.instagram.com/nat.brew_inami/",
        hours: "営業日・時間はSNSの営業カレンダーでご確認ください",
      },
    ],
  },
  {
    id: "cafe",
    en: "Cafe & Art",
    ja: "カフェ・アート",
    description: "散策のひと休みに。コーヒーとアートのある場所。",
    spots: [
      {
        name: "haiz coffee roastery（ヘイズコーヒーロースタリー）",
        description:
          "空き家をリノベーションしたロースタリー＆カフェ。コロンビアの農園から直接買い付けたスペシャルティコーヒーを店内で自家焙煎しています。焼き菓子や豆の販売もあり、2階にはイートイン席も。",
        lat: 36.5644284,
        lng: 136.9697243,
        url: "https://note.com/haizcoffee",
        instagram: "https://www.instagram.com/haiz_coffee_roastery/",
        hours: "平日 12:00 – 17:00 / 土日祝 10:30 – 17:30 / 水曜定休",
      },
      {
        name: "週末アートプレイス くらし灯",
        description:
          "自宅の車庫を改装した「誰かの人生が読める自家焙煎珈琲店」を掲げるアートスペース。現代アートや工芸の展示・ワークショップとともに、深煎りネルドリップの珈琲を楽しめます。",
        lat: 36.570364,
        lng: 136.9726753,
        url: "https://kurashitou.art/",
        hours: "月・木 12:00 – 18:00 / 金 16:00 – 21:00 / 土日祝 10:00 – 18:00 / 火・水曜定休",
      },
    ],
  },
  {
    id: "history",
    en: "History",
    ja: "歴史・寺社",
    description: "木彫刻のまち井波の歴史を感じるスポット。",
    spots: [
      {
        name: "井波別院 瑞泉寺",
        description:
          "明徳元年（1390年）開創の真宗大谷派の古刹。焼失後の再建の際、京都から派遣された彫刻師が井波の宮大工に技術を伝えたのが「井波彫刻」の始まりとされます。明治18年再建の本堂は日本有数の木造寺院建築。瑞泉寺へ続く石畳の八日町通りには彫刻工房が軒を連ねます。",
        lat: 36.5585772,
        lng: 136.9722586,
        url: "https://inamibetuin-zuisen-ji.amebaownd.com/",
        hours: "拝観 9:00 – 16:30 / 拝観料 一般500円・小中学生無料",
        image: {
          src: "/map-images/zuisenji-hondo.jpg",
          alt: "井波別院 瑞泉寺の本堂",
          credit: "Photo: Resto1578, Wikimedia Commons",
          creditUrl:
            "https://commons.wikimedia.org/wiki/File:InamibetsuinZuisenji.JPG",
          license: "CC BY-SA 3.0",
        },
      },
      {
        name: "井波八幡宮",
        description:
          "明徳4年（1393年）創建と伝わる井波の総鎮守。境内は越中一向一揆の拠点だった井波城の本丸跡にあり、土塁や石垣が残ります。毎年5月2日・3日の春季例大祭「よいやさ祭り」では、神輿が獅子や屋体とともに町を練り歩きます。",
        lat: 36.5588969,
        lng: 136.9741203,
        url: "https://inamihachimangu.com/",
        image: {
          src: "/map-images/inami-castle.jpg",
          alt: "井波八幡宮に隣接する井波城跡",
          credit: "境内に隣接する井波城跡 — Photo: Negitan, Wikimedia Commons",
          creditUrl: "https://commons.wikimedia.org/wiki/File:Inami_Castle.JPG",
          license: "Public domain",
        },
      },
    ],
  },
  {
    id: "stay",
    en: "Stay",
    ja: "宿泊",
    description: "井波にゆっくり滞在するなら。",
    spots: [
      {
        name: "HOTEL and DINING YURT",
        description:
          "旧井波駅舎のすぐ隣、築96年の古民家を改修した宿と食事処。「人が集い、ゆっくりと食卓を囲める場所」がコンセプトで、食事処は宿泊者以外も利用できます。店名のYURTは遊牧民の住居のこと。",
        lat: 36.5684409,
        lng: 136.969028,
        instagram: "https://www.instagram.com/yurt_inami/",
      },
      {
        name: "Bed and Craft",
        description:
          "2016年に井波で誕生した、日本初の「職人に弟子入りできる宿」。木彫刻家や漆芸家が空間を手がけた古民家一棟貸しのヴィラが町に点在する分散型ホテルで、2024年にはミシュランガイドのホテルセレクションに選出されました。",
        lat: 36.564083,
        lng: 136.9696743,
        url: "https://bedandcraft.com/",
        instagram: "https://www.instagram.com/bedandcraft/",
      },
      {
        name: "Bed and Craft TOMOE（KIN-NAKA / MITU / TenNE）",
        description:
          "元料亭「金中」を改修したBed and Craftの宿泊棟。木彫刻家・陶芸家・仏師がそれぞれ手がけた3棟からなり、通路でつながる全棟の貸切にも対応しています。",
        lat: 36.560845,
        lng: 136.9692425,
        url: "https://bedandcraft.com/properties/tomoe/",
      },
    ],
  },
  {
    id: "access",
    en: "Park & Parking",
    ja: "公園・駐車場",
    description: "車でお越しの方、お子さま連れの方へ。",
    spots: [
      {
        name: "井波交通広場駐車場",
        description:
          "旧加越線・井波駅の跡地にあたる、井波観光の玄関口となる駐車場（普通車210円/日）。観光案内所やレンタサイクルがあり、隣接する寺院風の旧井波駅舎（登録有形文化財・現在は物産展示館）も見どころです。",
        lat: 36.5611994,
        lng: 136.9692928,
        hours: "観光案内所 8:30 – 16:30",
        image: {
          src: "/map-images/inami-station.jpg",
          alt: "井波交通広場に隣接する旧井波駅舎",
          credit: "Photo: Takuma-sa, Wikimedia Commons",
          creditUrl:
            "https://commons.wikimedia.org/wiki/File:Inami-Station.JPG",
          license: "CC BY-SA 3.0",
        },
      },
      {
        name: "井波児童公園",
        description:
          "旧井波町役場に隣接する、85-Storeのすぐ近くの公園。お子さま連れの休憩にどうぞ。",
        lat: 36.5655135,
        lng: 136.9709744,
      },
    ],
  },
];
