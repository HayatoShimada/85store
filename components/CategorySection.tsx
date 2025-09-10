import Link from 'next/link';

interface CategorySectionProps {
  categories: string[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  const categoryConfigs: Record<string, { label: string; color: string }> = {
    "Fashion": { label: "ファッション", color: "bg-pink-100 text-pink-800" },
    "Life Style": { label: "ライフスタイル", color: "bg-blue-100 text-blue-800" },
    "Shop Info": { label: "店舗情報", color: "bg-green-100 text-green-800" },
    "Products": { label: "商品", color: "bg-purple-100 text-purple-800" },
    "Event": { label: "イベント", color: "bg-orange-100 text-orange-800" },
  };

  // カテゴリが空の場合は何も表示しない
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="section-padding max-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary mb-4">
            Category
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category: string) => {
            const categoryConfig = categoryConfigs[category] || { 
              label: category, 
              color: "bg-gray-100 text-gray-800" 
            };

            return (
              <Link
                key={category}
                href={`/blog/category/${category.toLowerCase().replace(' ', '-')}`}
                className={`p-4 rounded-lg text-center transition-colors hover:opacity-80 ${categoryConfig.color}`}
              >
                <div className="font-semibold">{categoryConfig.label}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
