// 85-Store Research & Development（/rnd）の文言・リポジトリ・ロードマップの唯一の定義元。
// ロードマップとPR・IssueはGitHubのProjectから `npm run sync:rnd` でdata/rnd.jsonに書き出したもの
import data from "@/data/rnd.json";

export const RND_ORG_URL = "https://github.com/85-Store-Research-Development";

export const RND_SUMMARY = {
  lead: "AIの時代に、洋服屋の買い物をもっと楽しく。",
  body: "お店の手間を減らしながら、新しい価値をつくっていくための研究開発です。",
};

export type Principle = { name: string; ja: string; lead: string; items: { name: string; body: string }[] };

// 活動指針
export const PRINCIPLES: Principle[] = [
  {
    name: "Open R&D",
    ja: "ひらかれた研究開発",
    lead: "お客さま・お店・仕入れ先の垣根なく、結果も過程も分かち合う。",
    items: [
      { name: "Living Lab", body: "店舗とオンラインストアを実験場に見立て、新しい仕組みを試して直す" },
      { name: "Build in Public", body: "試行錯誤もデータも課題も、過程ごと公開する" },
      { name: "Ecosystem", body: "上下や一方通行ではなく、みんなが得をして一緒に育つ" },
    ],
  },
  {
    name: "AI Augmentation",
    ja: "AIで小売を拡張する",
    lead: "AIを積極的に使い、うれしい反応もそうでない反応も、価値に変える。",
    items: [
      { name: "Human-in-the-Loop", body: "人の感情や反応を、開発の循環に入れる" },
      { name: "Offload to AI", body: "予測や定型の作業はAIに任せ、人は接客と企画に集中する" },
      { name: "Data × Sensitivity", body: "モデルそのものより、データと現場の感性を掛け合わせる" },
    ],
  },
  {
    name: "Joyful Discovery",
    ja: "便利の先にある楽しさ",
    lead: "効率化はゴールではなく、楽しい発見のための手段。",
    items: [
      { name: "Beyond Convenience", body: "時短や便利さの先に、偶然の出会いと発見を設計する" },
      { name: "Physical Experience", body: "リアルな店の価値と、デジタルの快適さを混ぜ合わせる" },
      { name: "Craft & Empathy", body: "手触りと美意識、共感を大切に、記憶に残る体験をつくる" },
    ],
  },
];

// 主要課題（ロードマップの「柱」と同じ名前）
export const RND_GOAL = "現実の店よりも、じっくり楽しく選べる体験をつくる。";

export const PILLARS = [
  { key: "EC", name: "EC", title: "伝わらないものを、伝わるようにする", body: "サイズ・着心地・見え方・探しやすさ。画面越しでは分からないことを、分かるようにする。" },
  { key: "店頭", name: "Store", title: "「行く価値」を最大にする", body: "欲しい物が店にあり、街の情報と好みが結びつき、話しかけやすい店にする。" },
  { key: "立場を超える", name: "Co-create", title: "お客さまと一緒につくる", body: "議論にひらき、声をAIで拾って、店への提案に変える。" },
  { key: "土台", name: "Foundation", title: "続けるための土台", body: "データをつなぎ、効き目を数え、無理なく回る仕組みにする。" },
] as const;

export type Repo = { name: string; role: string; place: string; isPublic: boolean; owner?: string };

// リポジトリ（非公開のものはリンクしない）
export const REPOS: Repo[] = [
  { name: "85store", role: "公式サイト（85-store.com）。ブログ・商品検索・営業日の表示", place: "Vercel", isPublic: true },
  { name: "85store-theme", role: "オンラインストアのテーマ。サイズ診断・あなたが着たら・特集ページ", place: "Shopify", isPublic: false },
  { name: "85store-cms", role: "入力画面。記事・商品の編集、Shopifyとの同期、4言語の翻訳、AIの変更案の承認", place: "Raspberry Pi 5", isPublic: false },
  { name: "85crm", role: "在庫・売上・目標・仕入れの管理と、AIの経営会議", place: "Raspberry Pi", isPublic: false },
  { name: "rocm_opencv_server", role: "GPUの処理。商品写真の補正・分類、状態メモの候補、着用イメージ（PoC）", place: "PC（RX 7900 XTX）", isPublic: true },
  { name: "imx519_edge", role: "撮影スタジオのカメラと撮影アプリ（スマホから撮ってCMSに下書き）", place: "Raspberry Pi 5", isPublic: true },
  { name: "super_imx519", role: "撮影スタジオの設計と、写真の仕上げ", place: "PC", isPublic: true },
  { name: "business-calendar", role: "営業日カレンダー。サイトとGoogleマップに営業時間を反映", place: "Cloudflare Workers", isPublic: true },
  { name: "snoo_trucar", role: "店長スヌーを探して追いかけるロボット", place: "Raspberry Pi 4", isPublic: true },
];

export const repoUrl = (repo: Repo) => `${RND_ORG_URL}/${repo.name}`;

export type RoadmapItem = (typeof data.roadmap)[number];
export type GithubActivity = (typeof data.pulls)[number];

export const RND_DATA = data as {
  generatedAt: string;
  projectUrl: string;
  roadmap: RoadmapItem[];
  pulls: GithubActivity[];
  issues: GithubActivity[];
};

// ロードマップの時期（Projectの「時期」）
export const PHASES = [
  { key: "これまで", label: "Done", from: "2026-10-01" },
  { key: "Now", label: "Now", from: "2026-11-01" },
  { key: "Next", label: "Next", from: "2027-01-01" },
  { key: "Later", label: "Later", from: "2027-07-01" },
] as const;
