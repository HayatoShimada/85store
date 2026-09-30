// Cache Components では generateStaticParams が空配列だとビルドエラーになるため、
// 記事が0件（microCMS未設定のローカル環境など）のときはダミーの値を返す。
// ダミーの値に対応するデータは存在しないので、ページ側で notFound() になる。
export const PLACEHOLDER_PARAM = "__placeholder__";

export function nonEmptyParams<K extends string>(
  key: K,
  values: string[]
): Record<K, string>[] {
  const list = values.length > 0 ? values : [PLACEHOLDER_PARAM];
  return list.map((value) => ({ [key]: value }) as Record<K, string>);
}
