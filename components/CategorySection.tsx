import Link from 'next/link';

interface CategorySectionProps {
  categories: string[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  const categoryConfigs: Record<string, { label: string; color: string }> = {
    "Fashion": { label: "ファッション", color: "text-pink-700" },
    "Life Style": { label: "ライフスタイル", color: "text-blue-700" },
    "Shop Info": { label: "店舗情報", color: "text-green-700" },
    "Products": { label: "商品", color: "text-purple-700" },
    "Event": { label: "イベント", color: "text-orange-700" },
    "更新情報": { label: "更新情報", color: "text-blue-700" },
  };

  // カテゴリが空の場合は何も表示しない
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="section-padding max-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary mb-4 font-inter">
            Category
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category) => {
            const categoryConfig = categoryConfigs[category] || {
              label: category,
              color: "text-gray-700"
            };

            return (
              <Link
                key={category}
                href={`/blog/category/${encodeURIComponent(category)}`}
                className={`category-card ${categoryConfig.color}`}
              >
                <div className="font-semibold relative z-10">{categoryConfig.label}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
