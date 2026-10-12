// お客さまが検索した言葉を D1 に記録し、お店向けの一覧のために集計する。
// IP などお客さまを特定できる情報は残さない（検索語・回数・出した商品の数だけ）。

export type Kind = "text" | "image";

export type Term = {
  kind: Kind;
  query: string;
  count: number;
  results: number;
  last_at: string;
};

export type Summary = { searches: number; terms: number; zero: number; images: number };

// 日本時間の日付（YYYY-MM-DD）
export function tokyoDay(date: Date): string {
  return new Date(date.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

export async function logSearch(db: D1Database, kind: Kind, query: string, results: number, now = new Date()) {
  await db
    .prepare(
      `INSERT INTO search_log (day, kind, query, count, results, last_at) VALUES (?1, ?2, ?3, 1, ?4, ?5)
       ON CONFLICT (day, kind, query) DO UPDATE SET count = count + 1, results = ?4, last_at = ?5`,
    )
    .bind(tokyoDay(now), kind, query, results, now.toISOString())
    .run();
}

// days 日前（今日を含む）からの集計。zero なら、商品を出せなかった言葉だけ
export async function listTerms(db: D1Database, days: number, zero: boolean, now = new Date()): Promise<Term[]> {
  const since = tokyoDay(new Date(now.getTime() - (days - 1) * 86400_000));
  const { results } = await db
    .prepare(
      `SELECT kind, query, SUM(count) AS count, MAX(last_at) AS last_at,
         (SELECT results FROM search_log l WHERE l.kind = s.kind AND l.query = s.query
            ORDER BY last_at DESC LIMIT 1) AS results
       FROM search_log s WHERE day >= ?1
       GROUP BY kind, query
       ${zero ? "HAVING results = 0" : ""}
       ORDER BY count DESC, last_at DESC LIMIT 500`,
    )
    .bind(since)
    .all<Term>();
  return results;
}

export function summarize(terms: Term[]): Summary {
  return {
    searches: terms.reduce((n, t) => n + t.count, 0),
    terms: terms.filter((t) => t.kind === "text").length,
    zero: terms.filter((t) => t.results === 0).length,
    images: terms.filter((t) => t.kind === "image").reduce((n, t) => n + t.count, 0),
  };
}
