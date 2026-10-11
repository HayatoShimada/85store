// 検索語と商品を Clef（判定用のモデル）に渡し、商品ごとに「検索の意図に合うか」の確率を出す。
// 1回のリクエストで、商品ごとに1つの noul（はい・いいえ）を聞く。商品が多いときは分けて並列に聞く。

export type Product = {
  handle: string;
  title: string;
  productType: string;
  description: string;
  brand: string | null;
  material: string | null;
  // 商品の属性（rocm_opencv_server が Clef で判定して custom.search_attributes に入れたもの）
  attributes: string | null;
};

export type Ranked = { handle: string; score: number };
export type RankResult = { meaningful: number; ranked: Ranked[] };

type NoulAnswer = { noul: number };
export type ClefRequest = {
  model: string;
  state: unknown;
  questions: Record<string, { type: "noul"; instructions: string }>;
};
export type Ask = (request: ClefRequest) => Promise<Record<string, NoulAnswer>>;

export const MODEL = "clef-flash";
// 1回のリクエストで聞く商品の数（入力が長くなりすぎないように）
export const CHUNK = 30;
const DESCRIPTION_LIMIT = 80;

// 商品を1行で表す（Clef の質問に入れる）
export function describe(p: Product): string {
  const facts = [p.productType, p.brand, p.material, p.attributes].filter(Boolean).join(" / ");
  const description = p.description.replace(/\s+/g, " ").trim().slice(0, DESCRIPTION_LIMIT);
  return `${p.title}（${facts}）${description}`;
}

export function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

// 検索語が、商品を探す意味のあることばか（でたらめな文字列でも商品の確率が 0.8 を超えることがあるため）
export const MEANINGFUL_ID = "meaningful";

export function buildRequest(query: string, products: Product[], askMeaningful = false): ClefRequest {
  const questions: ClefRequest["questions"] = {};
  if (askMeaningful) {
    questions[MEANINGFUL_ID] = {
      type: "noul",
      instructions:
        "検索語は、服・靴・小物・雑貨や、その色・季節・用途・ブランド・サイズなどを表す意味のあることばか。" +
        "ブランド名（英字）やサイズ（S・M・L・XL）だけでも yes。でたらめな文字列や、商品と関係のない話なら no",
    };
  }
  products.forEach((p, i) => {
    questions[`p${i}`] = {
      type: "noul",
      instructions: `この商品はお客さまの検索の意図に合うか: ${describe(p)}`,
    };
  });
  return {
    model: MODEL,
    state: { task: "古着・セレクトショップのオンラインストアで、お客さまの検索語に合う商品を選ぶ", query },
    questions,
  };
}

// 全商品の確率を出し、高い順に並べる。検索語が意味のあることばかの確率（meaningful）も返す
export async function rank(query: string, products: Product[], ask: Ask): Promise<RankResult> {
  const groups = chunks(products, CHUNK);
  const answers = await Promise.all(groups.map((g, i) => ask(buildRequest(query, g, i === 0))));
  const ranked: Ranked[] = [];
  groups.forEach((group, gi) => {
    group.forEach((p, i) => {
      const score = answers[gi][`p${i}`]?.noul;
      if (typeof score === "number") ranked.push({ handle: p.handle, score });
    });
  });
  const meaningful = answers[0]?.[MEANINGFUL_ID]?.noul ?? 1;
  return { meaningful, ranked: ranked.sort((a, b) => b.score - a.score) };
}

// 検索語をそろえる（キャッシュのキーにする）
export function normalizeQuery(q: string): string {
  return q.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
}
