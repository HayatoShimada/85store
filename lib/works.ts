// 85-Store がつくったもの（Works）の唯一の定義元。/works・トップ・About で使う
export type Work = {
  slug: string;
  name: string;
  href: string; // 外部サイトは https から書く
  kind: string; // 種類（英語のチップ）
  description: string;
  image: string; // public/images/works の 4:3 のスクリーンショット
};

export const WORKS: Work[] = [
  {
    slug: "hakoneko",
    name: "ハコネコはこちらを見ている",
    href: "/hakoneko",
    kind: "Game",
    description: "一見キュート、中身はハードなコズミックホラー・マージパズル。店長スヌーをモデルにした iPhone のゲームです。",
    image: "/images/works/hakoneko.jpg",
  },
  {
    slug: "vividatmos",
    name: "VividAtmos",
    href: "https://graphic.85-store.com/",
    kind: "Graphic",
    description: "ブランドカラーをひとつ決めるだけで、継ぎ目なくループするグラフィックの動画と画像がつくれるツール。",
    image: "/images/works/vividatmos.jpg",
  },
  {
    slug: "blackbullet",
    name: "BlackBullet",
    href: "https://hayatoshimada.github.io/blackbullet/",
    kind: "App",
    description: "ローカルで動く、Markdown のノートアプリ。意味検索やデータベース表示、MCP による AI 連携つき（オープンソース）。",
    image: "/images/works/blackbullet.jpg",
  },
  {
    slug: "foxtrotdesign",
    name: "foxtrotdesign",
    href: "https://dev.85-store.com/",
    kind: "Personal",
    description: "仕入れ担当はやとの、考えたこと・読んだもの・つくったものを整理するための個人サイト。",
    image: "/images/works/foxtrotdesign.jpg",
  },
];

export const isExternalWork = (work: Work) => work.href.startsWith("http");
