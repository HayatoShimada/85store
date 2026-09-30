// サーバー（UTC）とブラウザでずれないよう、日本時間で日付を整形する
const jaDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

export function formatDate(date: string | Date): string {
  return jaDateFormatter.format(new Date(date));
}
